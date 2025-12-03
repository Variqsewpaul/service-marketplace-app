// Subscription tier types
export enum SubscriptionTier {
    FREE = 'FREE',
    BASIC = 'BASIC',
    PRO = 'PRO',
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    PAST_DUE = 'PAST_DUE',
}

// Booking types
export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DISPUTED = 'DISPUTED',
}

// Transaction types
export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    PAYMENT = 'PAYMENT',
    REFUND = 'REFUND',
    SUBSCRIPTION = 'SUBSCRIPTION',
    BOOKING_FEE = 'BOOKING_FEE',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

// Payment types
export enum PaymentStatus {
    HELD = 'HELD',
    RELEASED = 'RELEASED',
    REFUNDED = 'REFUNDED',
    DISPUTED = 'DISPUTED',
}

export enum ReleaseCondition {
    COMPLETION = 'COMPLETION',
    MANUAL = 'MANUAL',
    DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
}

// Booking request type
export interface BookingRequest {
    providerId: string;
    serviceTitle: string;
    serviceDescription?: string;
    serviceOfferingId?: string;
    servicePrice: number;
    scheduledDate?: Date;
    scheduledTime?: string;
    location?: string;
    notes?: string;
}

// Fee calculation result
export interface FeeCalculation {
    servicePrice: number;
    bookingFee: number;
    transactionFeePercent: number;
    transactionFeeAmount: number;
    totalAmount: number;
    depositAmount: number;
    providerNetAmount: number;
}

// Subscription tier info
export interface SubscriptionTierInfo {
    tier: SubscriptionTier;
    name: string;
    price: number; // Monthly price in dollars (0 for free)
    transactionFeePercent: number;
    bookingLimit?: number; // undefined = unlimited
    leadLimit?: number; // undefined = unlimited
    features: string[];
}

// Transaction summary
export interface TransactionSummary {
    totalEarnings: number;
    totalFees: number;
    netEarnings: number;
    pendingPayments: number;
    completedBookings: number;
}
