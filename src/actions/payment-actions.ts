'use server'

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { verifyTransaction } from '@/lib/paystack';
import { BookingStatus, TransactionType, TransactionStatus, TransactionSummary } from '@/types/monetization';
import { revalidatePath } from 'next/cache';

/**
 * Finalize a booking payment after Paystack redirect
 */
export async function finalizeBookingPayment(reference: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        // 1. Verify transaction with Paystack
        const verification = await verifyTransaction(reference);

        if (!verification || verification.status !== 'success') {
            return { error: 'Payment verification failed' };
        }

        const bookingId = verification.metadata?.bookingId;
        if (!bookingId) {
            return { error: 'Invalid payment metadata' };
        }

        // 2. Get booking details
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                providerProfile: {
                    select: {
                        id: true,
                        userId: true,
                        autoRevealContact: true,
                    },
                },
            },
        });

        if (!booking) {
            return { error: 'Booking not found' };
        }

        // 3. Check if transaction already exists
        const existingTx = await prisma.transaction.findUnique({
            where: { paystackReference: reference },
        });

        if (existingTx) {
            return { success: true, bookingId }; // Already processed
        }

        // 4. Create transaction record
        await prisma.transaction.create({
            data: {
                type: TransactionType.DEPOSIT,
                amount: verification.amount,
                fee: 0, // Fee is handled in payout
                netAmount: verification.amount,
                status: TransactionStatus.COMPLETED,
                bookingId: booking.id,
                customerId: session.user.id,
                providerId: booking.providerProfile.id,
                paystackReference: reference,
                paystackTransactionId: verification.id?.toString(), // Use optional chaining
                description: `Deposit for booking: ${booking.serviceTitle}`,
                metadata: JSON.stringify(verification.metadata),
            },
        });

        // 5. Update booking status
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                contactRevealed: booking.providerProfile.autoRevealContact,
                contactRevealedAt: booking.providerProfile.autoRevealContact ? new Date() : null,
            },
        });

        revalidatePath('/dashboard/bookings');
        revalidatePath(`/dashboard/bookings/${bookingId}`);

        return { success: true, bookingId };
    } catch (error: any) {
        console.error('Error finalizing payment:', error);
        return { error: `Failed to finalize payment: ${error.message || 'Unknown error'}` };
    }
}

/**
 * Get provider earnings summary
 */
export async function getProviderEarnings() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!providerProfile) {
            return { error: 'Provider profile not found' };
        }

        // Get all completed transactions for this provider
        const transactions = await prisma.transaction.findMany({
            where: {
                providerId: providerProfile.id,
                status: TransactionStatus.COMPLETED,
                type: TransactionType.DEPOSIT, // Assuming deposits are the main source of earnings
            },
        });

        // Calculate totals
        const totalEarnings = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalFees = transactions.reduce((sum, tx) => sum + tx.fee, 0);
        const netEarnings = totalEarnings - totalFees;

        // Get pending payments (held in escrow)
        const pendingPayments = await prisma.payment.aggregate({
            where: {
                booking: { providerId: providerProfile.id },
                status: 'HELD',
            },
            _sum: { amount: true },
        });

        // Get completed bookings count
        const completedBookings = await prisma.booking.count({
            where: {
                providerId: providerProfile.id,
                status: BookingStatus.COMPLETED,
            },
        });

        const summary: TransactionSummary = {
            totalEarnings,
            totalFees,
            netEarnings,
            pendingPayments: pendingPayments._sum.amount || 0,
            completedBookings,
        };

        return { success: true, summary };
    } catch (error) {
        console.error('Error fetching earnings:', error);
        return { error: 'Failed to fetch earnings' };
    }
}
