'use server'

import { auth } from '@/auth';
import { initializeTransaction, verifyTransaction, getOrCreatePaystackCustomer } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Initialize a payment transaction
 */
export async function initializePayment(amount: number, metadata?: any) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
        return { error: 'Unauthorized' };
    }

    try {
        // Get or create Paystack customer
        const customerCode = await getOrCreatePaystackCustomer(
            session.user.id,
            session.user.email,
            session.user.name?.split(' ')[0],
            session.user.name?.split(' ')[1]
        );

        // Initialize transaction
        const transaction = await initializeTransaction(
            session.user.email,
            amount,
            { ...metadata, userId: session.user.id, customerCode }
        );

        return {
            success: true,
            authorizationUrl: transaction.authorizationUrl,
            reference: transaction.reference,
        };
    } catch (error) {
        console.error('Error initializing payment:', error);
        return { error: 'Failed to initialize payment' };
    }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(reference: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const verification = await verifyTransaction(reference);

        if (verification.status === 'success') {
            return {
                success: true,
                amount: verification.amount,
                metadata: verification.metadata,
            };
        }

        return { error: 'Payment verification failed' };
    } catch (error) {
        console.error('Error verifying payment:', error);
        return { error: 'Failed to verify payment' };
    }
}

/**
 * Get customer's payment history
 */
export async function getPaymentHistory() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { paystackCustomerCode: true },
        });

        if (!user?.paystackCustomerCode) {
            return { transactions: [] };
        }

        // You can fetch transaction history from Paystack API here
        // For now, return empty array
        return { transactions: [] };
    } catch (error) {
        console.error('Error fetching payment history:', error);
        return { error: 'Failed to fetch payment history' };
    }
}
