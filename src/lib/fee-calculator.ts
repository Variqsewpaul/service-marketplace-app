import { SubscriptionTier, FeeCalculation } from '@/types/monetization';
import {
    BOOKING_FEE,
    CUSTOMER_BOOKING_FEE,
    PROVIDER_BOOKING_FEE,
    DEPOSIT_PERCENTAGE,
    getTransactionFeePercent
} from './pricing-config';

/**
 * Calculate all fees and totals for a booking
 */
export function calculateBookingFees(
    servicePrice: number,
    providerTier: SubscriptionTier
): FeeCalculation {
    const transactionFeePercent = getTransactionFeePercent(providerTier);
    const transactionFeeAmount = servicePrice * (transactionFeePercent / 100);

    // Total amount customer pays (service + customer's portion of booking fee)
    const totalAmount = servicePrice + CUSTOMER_BOOKING_FEE;

    // Deposit is 20% of total amount
    const depositAmount = totalAmount * DEPOSIT_PERCENTAGE;

    // Provider receives: service price - transaction fee - provider's portion of booking fee
    const providerNetAmount = servicePrice - transactionFeeAmount - PROVIDER_BOOKING_FEE;

    return {
        servicePrice,
        bookingFee: BOOKING_FEE,
        transactionFeePercent,
        transactionFeeAmount,
        totalAmount,
        depositAmount,
        providerNetAmount,
    };
}

/**
 * Calculate platform revenue from a booking
 */
export function calculatePlatformRevenue(
    servicePrice: number,
    providerTier: SubscriptionTier
): number {
    const fees = calculateBookingFees(servicePrice, providerTier);
    return fees.transactionFeeAmount + BOOKING_FEE;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

/**
 * Calculate deposit amount (20% of total)
 */
export function calculateDeposit(totalAmount: number): number {
    return totalAmount * DEPOSIT_PERCENTAGE;
}

/**
 * Calculate remaining balance after deposit
 */
export function calculateRemainingBalance(totalAmount: number, depositAmount: number): number {
    return totalAmount - depositAmount;
}
