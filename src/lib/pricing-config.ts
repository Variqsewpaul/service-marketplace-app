import { SubscriptionTier, SubscriptionTierInfo } from '@/types/monetization';

// Pricing constants
export const BOOKING_FEE = 2.50; // Total booking fee
export const CUSTOMER_BOOKING_FEE = 1.25; // Customer pays half
export const PROVIDER_BOOKING_FEE = 1.25; // Provider pays half
export const DEPOSIT_PERCENTAGE = 0.20; // 20% deposit required

// Subscription tier definitions
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierInfo> = {
    [SubscriptionTier.FREE]: {
        tier: SubscriptionTier.FREE,
        name: 'Free',
        price: 0,
        transactionFeePercent: 7,
        bookingLimit: 3, // 3 bookings per month
        leadLimit: 5, // 5 leads per month
        features: [
            'Up to 3 bookings per month',
            'Up to 5 leads per month',
            '7% transaction fee',
            'Basic profile listing',
            'In-app messaging',
            'Customer reviews',
        ],
    },
    [SubscriptionTier.BASIC]: {
        tier: SubscriptionTier.BASIC,
        name: 'Basic',
        price: 29,
        transactionFeePercent: 5,
        bookingLimit: 15, // 15 bookings per month
        leadLimit: 30, // 30 leads per month
        features: [
            'Up to 15 bookings per month',
            'Up to 30 leads per month',
            '5% transaction fee',
            'Enhanced profile listing',
            'In-app messaging',
            'Customer reviews',
            'Priority support',
        ],
    },
    [SubscriptionTier.PRO]: {
        tier: SubscriptionTier.PRO,
        name: 'Pro',
        price: 79,
        transactionFeePercent: 3,
        bookingLimit: undefined, // Unlimited
        leadLimit: undefined, // Unlimited
        features: [
            'Unlimited bookings',
            'Unlimited leads',
            '3% transaction fee',
            'Featured profile listing',
            'In-app messaging',
            'Customer reviews',
            'Priority support',
            'Advanced analytics',
            'Promotional tools',
        ],
    },
};

// Helper function to get subscription tier info
export function getSubscriptionTierInfo(tier: SubscriptionTier): SubscriptionTierInfo {
    return SUBSCRIPTION_TIERS[tier];
}

// Helper function to calculate transaction fee percentage
export function getTransactionFeePercent(tier: SubscriptionTier): number {
    return SUBSCRIPTION_TIERS[tier].transactionFeePercent;
}

// Helper function to check if tier has booking limit
export function hasBookingLimit(tier: SubscriptionTier): boolean {
    return SUBSCRIPTION_TIERS[tier].bookingLimit !== undefined;
}

// Helper function to get booking limit
export function getBookingLimit(tier: SubscriptionTier): number | undefined {
    return SUBSCRIPTION_TIERS[tier].bookingLimit;
}
