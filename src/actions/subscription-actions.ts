'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@/types/monetization';
import { getSubscriptionTierInfo, getBookingLimit } from '@/lib/pricing-config';
import { revalidatePath } from 'next/cache';

/**
 * Get provider's current subscription
 */
export async function getProviderSubscription(providerProfileId: string) {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { providerProfileId },
            include: {
                providerProfile: {
                    select: {
                        subscriptionTier: true,
                        monthlyBookingCount: true,
                        bookingCountResetDate: true,
                    },
                },
            },
        });

        return { success: true, subscription };
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return { success: false, error: 'Failed to fetch subscription' };
    }
}

/**
 * Get current user's provider subscription
 */
export async function getCurrentProviderSubscription() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                subscription: true,
            },
        });

        if (!providerProfile) {
            return { success: false, error: 'Provider profile not found' };
        }

        const tierInfo = getSubscriptionTierInfo(providerProfile.subscriptionTier as SubscriptionTier);

        return {
            success: true,
            subscription: providerProfile.subscription,
            tierInfo,
            monthlyBookingCount: providerProfile.monthlyBookingCount,
            bookingLimit: getBookingLimit(providerProfile.subscriptionTier as SubscriptionTier),
        };
    } catch (error) {
        console.error('Error fetching current subscription:', error);
        return { success: false, error: 'Failed to fetch subscription' };
    }
}

/**
 * Upgrade subscription to a paid tier
 */
export async function upgradeSubscription(tier: SubscriptionTier) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    if (tier === SubscriptionTier.FREE) {
        return { success: false, error: 'Cannot upgrade to free tier' };
    }

    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
            include: { subscription: true },
        });

        if (!providerProfile) {
            return { success: false, error: 'Provider profile not found' };
        }

        // Update provider profile tier
        await prisma.providerProfile.update({
            where: { id: providerProfile.id },
            data: { subscriptionTier: tier },
        });

        // Calculate period dates
        const currentPeriodStart = new Date();
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        // Create or update subscription
        if (providerProfile.subscription) {
            await prisma.subscription.update({
                where: { id: providerProfile.subscription.id },
                data: {
                    tier,
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart,
                    currentPeriodEnd,
                    cancelAtPeriodEnd: false,
                },
            });
        } else {
            await prisma.subscription.create({
                data: {
                    providerProfileId: providerProfile.id,
                    tier,
                    status: SubscriptionStatus.ACTIVE,
                    currentPeriodStart,
                    currentPeriodEnd,
                },
            });
        }

        revalidatePath('/dashboard/subscription');
        revalidatePath('/dashboard');

        return { success: true, message: `Successfully upgraded to ${tier} tier` };
    } catch (error) {
        console.error('Error upgrading subscription:', error);
        return { success: false, error: 'Failed to upgrade subscription' };
    }
}

/**
 * Downgrade subscription
 */
export async function downgradeSubscription(tier: SubscriptionTier) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
            include: { subscription: true },
        });

        if (!providerProfile) {
            return { success: false, error: 'Provider profile not found' };
        }

        // Update provider profile tier
        await prisma.providerProfile.update({
            where: { id: providerProfile.id },
            data: { subscriptionTier: tier },
        });

        // Update subscription to cancel at period end
        if (providerProfile.subscription) {
            await prisma.subscription.update({
                where: { id: providerProfile.subscription.id },
                data: {
                    tier,
                    cancelAtPeriodEnd: tier === SubscriptionTier.FREE,
                },
            });
        }

        revalidatePath('/dashboard/subscription');
        revalidatePath('/dashboard');

        return { success: true, message: `Successfully changed to ${tier} tier` };
    } catch (error) {
        console.error('Error downgrading subscription:', error);
        return { success: false, error: 'Failed to change subscription' };
    }
}

/**
 * Check if provider can accept more bookings (for free tier)
 */
export async function checkBookingLimit(providerProfileId: string): Promise<boolean> {
    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { id: providerProfileId },
            select: {
                subscriptionTier: true,
                monthlyBookingCount: true,
                bookingCountResetDate: true,
            },
        });

        if (!providerProfile) return false;

        const tier = providerProfile.subscriptionTier as SubscriptionTier;
        const limit = getBookingLimit(tier);

        // No limit for paid tiers
        if (limit === undefined) return true;

        // Check if we need to reset the counter (monthly reset)
        const now = new Date();
        const resetDate = new Date(providerProfile.bookingCountResetDate);

        if (now > resetDate) {
            // Reset counter
            const nextResetDate = new Date(now);
            nextResetDate.setMonth(nextResetDate.getMonth() + 1);

            await prisma.providerProfile.update({
                where: { id: providerProfileId },
                data: {
                    monthlyBookingCount: 0,
                    bookingCountResetDate: nextResetDate,
                },
            });

            return true;
        }

        // Check if under limit
        return providerProfile.monthlyBookingCount < limit;
    } catch (error) {
        console.error('Error checking booking limit:', error);
        return false;
    }
}

/**
 * Increment booking count for provider
 */
export async function incrementBookingCount(providerProfileId: string) {
    try {
        await prisma.providerProfile.update({
            where: { id: providerProfileId },
            data: {
                monthlyBookingCount: {
                    increment: 1,
                },
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error incrementing booking count:', error);
        return { success: false, error: 'Failed to update booking count' };
    }
}

/**
 * Calculate transaction fee for a provider
 */
export async function calculateTransactionFee(
    providerProfileId: string,
    amount: number
): Promise<number> {
    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { id: providerProfileId },
            select: { subscriptionTier: true },
        });

        if (!providerProfile) return 0;

        const tierInfo = getSubscriptionTierInfo(providerProfile.subscriptionTier as SubscriptionTier);
        return amount * (tierInfo.transactionFeePercent / 100);
    } catch (error) {
        console.error('Error calculating transaction fee:', error);
        return 0;
    }
}
