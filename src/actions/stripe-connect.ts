'use server'

import { auth } from '@/auth';
import { getOrCreateConnectAccount, createAccountLink, checkAccountStatus } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Create a Stripe Connect onboarding link for providers
 */
export async function createConnectOnboardingLink() {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get provider profile
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!providerProfile) {
            return { error: 'Provider profile not found' };
        }

        // Get or create Connect account
        const accountId = await getOrCreateConnectAccount(
            providerProfile.id,
            session.user.id,
            session.user.email
        );

        // Create onboarding link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const returnUrl = `${baseUrl}/settings/payout-account?success=true`;
        const refreshUrl = `${baseUrl}/settings/payout-account?refresh=true`;

        const onboardingUrl = await createAccountLink(accountId, returnUrl, refreshUrl);

        return { url: onboardingUrl };
    } catch (error) {
        console.error('Error creating Connect onboarding link:', error);
        return { error: 'Failed to create onboarding link' };
    }
}

/**
 * Get the status of the provider's Connect account
 */
export async function getConnectAccountStatus() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
            select: {
                stripeAccountId: true,
                stripeOnboarded: true,
                payoutsEnabled: true,
            },
        });

        if (!providerProfile?.stripeAccountId) {
            return {
                hasAccount: false,
                onboarded: false,
                payoutsEnabled: false,
            };
        }

        // Check status with Stripe
        const status = await checkAccountStatus(providerProfile.stripeAccountId);

        // Update database if status changed
        if (
            status.detailsSubmitted !== providerProfile.stripeOnboarded ||
            status.payoutsEnabled !== providerProfile.payoutsEnabled
        ) {
            await prisma.providerProfile.update({
                where: { userId: session.user.id },
                data: {
                    stripeOnboarded: status.detailsSubmitted,
                    payoutsEnabled: status.payoutsEnabled,
                },
            });
        }

        return {
            hasAccount: true,
            onboarded: status.detailsSubmitted,
            payoutsEnabled: status.payoutsEnabled,
            chargesEnabled: status.chargesEnabled,
        };
    } catch (error) {
        console.error('Error getting Connect account status:', error);
        return { error: 'Failed to get account status' };
    }
}

/**
 * Create a login link for the provider to access their Stripe Express dashboard
 */
export async function createConnectDashboardLink() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
            select: { stripeAccountId: true },
        });

        if (!providerProfile?.stripeAccountId) {
            return { error: 'No Connect account found' };
        }

        const { stripe } = await import('@/lib/stripe');
        const loginLink = await stripe.accounts.createLoginLink(providerProfile.stripeAccountId);

        return { url: loginLink.url };
    } catch (error) {
        console.error('Error creating dashboard link:', error);
        return { error: 'Failed to create dashboard link' };
    }
}
