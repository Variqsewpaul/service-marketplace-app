import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
    typescript: true,
});

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string) {
    const { prisma } = await import('@/lib/prisma');

    // Check if user already has a Stripe customer ID
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
    });

    if (user?.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
            userId,
        },
    });

    // Save customer ID to database
    await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
    });

    return customer.id;
}

/**
 * Get or create a Stripe Connect account for a provider
 */
export async function getOrCreateConnectAccount(providerProfileId: string, userId: string, email: string) {
    const { prisma } = await import('@/lib/prisma');

    // Check if provider already has a Connect account
    const provider = await prisma.providerProfile.findUnique({
        where: { id: providerProfileId },
        select: { stripeAccountId: true },
    });

    if (provider?.stripeAccountId) {
        return provider.stripeAccountId;
    }

    // Create new Connect account
    const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
        metadata: {
            providerProfileId,
            userId,
        },
    });

    // Save account ID to database
    await prisma.providerProfile.update({
        where: { id: providerProfileId },
        data: { stripeAccountId: account.id },
    });

    return account.id;
}

/**
 * Create an account link for Connect onboarding
 */
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
    });

    return accountLink.url;
}

/**
 * Check if a Connect account is fully onboarded
 */
export async function checkAccountStatus(accountId: string) {
    const account = await stripe.accounts.retrieve(accountId);

    return {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
    };
}
