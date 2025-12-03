'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus, TransactionType, TransactionStatus, BookingRequest, SubscriptionTier } from '@/types/monetization';
import { calculateBookingFees } from '@/lib/fee-calculator';
import { checkBookingLimit, incrementBookingCount } from './subscription-actions';
import { revalidatePath } from 'next/cache';

import { initializePayment } from './payment-methods';

/**
 * Create a new booking request (Quote Request)
 */
export async function createBookingRequest(request: BookingRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Get provider profile
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { id: request.providerId },
            select: {
                id: true,
                userId: true,
                subscriptionTier: true,
            },
        });

        if (!providerProfile) {
            return { success: false, error: 'Provider not found' };
        }

        // Check if provider can accept more bookings
        const canAcceptBooking = await checkBookingLimit(providerProfile.id);
        if (!canAcceptBooking) {
            return {
                success: false,
                error: 'Provider has reached their booking limit. They need to upgrade their subscription.',
            };
        }

        // Create booking with PENDING status and 0 price (Quote Request)
        const booking = await prisma.booking.create({
            data: {
                customerId: session.user.id,
                providerId: providerProfile.id,
                serviceTitle: request.serviceTitle,
                serviceDescription: request.serviceDescription,
                serviceOfferingId: request.serviceOfferingId,
                servicePrice: 0, // Price to be set by provider
                bookingFee: 0,
                transactionFee: 0,
                totalAmount: 0,
                depositAmount: 0,
                scheduledDate: request.scheduledDate,
                scheduledTime: request.scheduledTime,
                location: request.location,
                notes: request.notes,
                status: BookingStatus.PENDING,
            },
        });

        // Increment provider's booking count
        await incrementBookingCount(providerProfile.id);

        revalidatePath('/dashboard/bookings');
        revalidatePath(`/providers/${providerProfile.userId}`);

        return {
            success: true,
            bookingId: booking.id,
            message: 'Quote request sent successfully',
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: 'Failed to create booking request' };
    }
}

/**
 * Provider sends a quote (updates price and fees)
 */
export async function sendQuote(bookingId: string, price: number) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { providerProfile: true },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        // Verify user is the provider
        if (booking.providerProfile.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Calculate fees based on the quoted price
        const tier = (booking.providerProfile.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE;
        const fees = calculateBookingFees(price, tier);

        // Update booking with price and fees
        // We keep status as PENDING, but the presence of price > 0 indicates a quote has been sent
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                servicePrice: price,
                bookingFee: fees.bookingFee,
                transactionFee: fees.transactionFeeAmount,
                totalAmount: fees.totalAmount,
                depositAmount: fees.depositAmount,
            },
        });

        revalidatePath('/dashboard/bookings');
        revalidatePath(`/dashboard/bookings/${bookingId}`);

        return { success: true, message: "Quote sent successfully" };
    } catch (error) {
        console.error("Error sending quote:", error);
        return { success: false, error: "Failed to send quote" };
    }
}

/**
 * Customer confirms booking (Accepts Quote & Pays Deposit)
 */
export async function confirmBooking(bookingId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                providerProfile: {
                    select: {
                        userId: true,
                        autoRevealContact: true,
                    },
                },
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        // Verify user is the customer
        if (booking.customerId !== session.user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        if (booking.servicePrice <= 0) {
            return { success: false, error: 'Cannot confirm booking without a valid price quote' };
        }

        // Initialize Paystack payment
        const paymentResult = await initializePayment(booking.depositAmount, {
            bookingId: booking.id,
            type: 'DEPOSIT',
        });

        if (paymentResult.error || !paymentResult.authorizationUrl) {
            return { success: false, error: paymentResult.error || "Payment initialization failed" };
        }

        return {
            success: true,
            authorizationUrl: paymentResult.authorizationUrl,
            message: 'Redirecting to payment...',
        };
    } catch (error) {
        console.error('Error confirming booking:', error);
        return { success: false, error: 'Failed to confirm booking' };
    }
}

/**
 * Mark booking as in progress
 */
export async function startBooking(bookingId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                providerProfile: { select: { userId: true } },
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        if (booking.providerProfile.userId !== session.user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.IN_PROGRESS },
        });

        revalidatePath('/dashboard/bookings');
        revalidatePath(`/dashboard/bookings/${bookingId}`);

        return { success: true, message: 'Booking started' };
    } catch (error) {
        console.error('Error starting booking:', error);
        return { success: false, error: 'Failed to start booking' };
    }
}

/**
 * Complete a booking and release payment
 */
export async function completeBooking(bookingId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                providerProfile: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        // Either provider or customer can mark as complete
        const isProvider = booking.providerProfile.userId === session.user.id;
        const isCustomer = booking.customerId === session.user.id;

        if (!isProvider && !isCustomer) {
            return { success: false, error: 'Unauthorized' };
        }

        // Update booking
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.COMPLETED,
                completedAt: new Date(),
            },
        });

        // Calculate remaining payment (total - deposit)
        const remainingPayment = booking.totalAmount - booking.depositAmount;

        // Create payment transaction for remaining amount
        if (remainingPayment > 0) {
            await prisma.transaction.create({
                data: {
                    type: TransactionType.PAYMENT,
                    amount: remainingPayment,
                    fee: 0, // Fee already calculated in booking
                    netAmount: remainingPayment,
                    status: TransactionStatus.COMPLETED,
                    bookingId: booking.id,
                    customerId: booking.customerId,
                    providerId: booking.providerProfile.id,
                    description: `Final payment for: ${booking.serviceTitle}`,
                },
            });
        }

        // Release payment to provider (this would integrate with payment provider)
        // For now, we just create a transaction record
        const providerPayment = booking.servicePrice - booking.transactionFee - (booking.bookingFee / 2);

        await prisma.transaction.create({
            data: {
                type: TransactionType.PAYMENT,
                amount: booking.servicePrice,
                fee: booking.transactionFee + (booking.bookingFee / 2),
                netAmount: providerPayment,
                status: TransactionStatus.COMPLETED,
                bookingId: booking.id,
                customerId: booking.customerId,
                providerId: booking.providerProfile.id,
                description: `Payment received for: ${booking.serviceTitle}`,
            },
        });

        revalidatePath('/dashboard/bookings');
        revalidatePath(`/dashboard/bookings/${bookingId}`);
        revalidatePath('/dashboard/earnings');

        return {
            success: true,
            message: 'Booking completed successfully',
            providerEarnings: providerPayment,
        };
    } catch (error) {
        console.error('Error completing booking:', error);
        return { success: false, error: 'Failed to complete booking' };
    }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, reason?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                providerProfile: { select: { userId: true } },
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        const isProvider = booking.providerProfile.userId === session.user.id;
        const isCustomer = booking.customerId === session.user.id;

        if (!isProvider && !isCustomer) {
            return { success: false, error: 'Unauthorized' };
        }

        // Update booking
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CANCELLED,
                cancelledAt: new Date(),
                notes: reason ? `${booking.notes || ''}\nCancellation reason: ${reason}` : booking.notes,
            },
        });

        // Refund deposit if it was paid
        if (booking.depositAmount > 0) {
            await prisma.transaction.create({
                data: {
                    type: TransactionType.REFUND,
                    amount: booking.depositAmount,
                    fee: 0,
                    netAmount: booking.depositAmount,
                    status: TransactionStatus.COMPLETED,
                    bookingId: booking.id,
                    customerId: booking.customerId,
                    description: `Refund for cancelled booking: ${booking.serviceTitle}`,
                },
            });
        }

        revalidatePath('/dashboard/bookings');
        revalidatePath(`/dashboard/bookings/${bookingId}`);

        return { success: true, message: 'Booking cancelled' };
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return { success: false, error: 'Failed to cancel booking' };
    }
}

/**
 * Get all bookings for current user
 */
export async function getUserBookings(status?: BookingStatus) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Check if user is a provider
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true },
        });

        const where: any = status ? { status } : {};

        let bookings;
        if (providerProfile) {
            // Get bookings as provider
            bookings = await prisma.booking.findMany({
                where: {
                    ...where,
                    providerId: providerProfile.id,
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            // Get bookings as customer
            bookings = await prisma.booking.findMany({
                where: {
                    ...where,
                    customerId: session.user.id,
                },
                include: {
                    providerProfile: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        return { success: true, bookings, isProvider: !!providerProfile };
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return { success: false, error: 'Failed to fetch bookings' };
    }
}

/**
 * Get booking details
 */
export async function getBookingDetails(bookingId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                providerProfile: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                },
                payments: true,
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        // Verify user has access
        const hasAccess =
            booking.customerId === session.user.id ||
            booking.providerProfile.userId === session.user.id;

        if (!hasAccess) {
            return { success: false, error: 'Unauthorized' };
        }

        return { success: true, booking };
    } catch (error) {
        console.error('Error fetching booking details:', error);
        return { success: false, error: 'Failed to fetch booking details' };
    }
}

/**
 * Initiate a dispute for a booking
 */
export async function initiateDispute(bookingId: string, reason: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                providerProfile: { select: { userId: true } },
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        const isProvider = booking.providerProfile.userId === session.user.id;
        const isCustomer = booking.customerId === session.user.id;

        if (!isProvider && !isCustomer) {
            return { success: false, error: 'Unauthorized' };
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.DISPUTED,
                notes: `${booking.notes || ''}\nDispute initiated: ${reason}`,
            },
        });

        revalidatePath('/dashboard/bookings');
        revalidatePath(`/dashboard/bookings/${bookingId}`);

        return {
            success: true,
            message: 'Dispute initiated. Our team will review and contact you shortly.',
        };
    } catch (error) {
        console.error('Error initiating dispute:', error);
        return { success: false, error: 'Failed to initiate dispute' };
    }
}
