'use server'

import { auth } from '@/auth';
import { createSubaccount, listBanks, resolveAccountNumber } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Get list of South African banks
 */
export async function getSouthAfricanBanks() {
    const fallbackBanks = [
        { name: 'Absa Bank', code: '632005', active: true },
        { name: 'Capitec Bank', code: '470010', active: true },
        { name: 'Discovery Bank', code: '679000', active: true },
        { name: 'First National Bank', code: '250655', active: true },
        { name: 'Investec Bank', code: '580105', active: true },
        { name: 'Nedbank', code: '198765', active: true },
        { name: 'Standard Bank', code: '051001', active: true },
        { name: 'TymeBank', code: '678910', active: true },
        { name: 'African Bank', code: '430000', active: true },
        { name: 'Bidvest Bank', code: '462005', active: true },
    ];

    try {
        const banks = await listBanks();
        if (banks && banks.length > 0) {
            return { banks };
        }
        // Return fallback if API returns empty
        return { banks: fallbackBanks };
    } catch (error) {
        console.error('Error fetching banks, using fallback:', error);
        // Return fallback on error
        return { banks: fallbackBanks };
    }
}

/**
 * Verify bank account details
 */
export async function verifyBankAccount(accountNumber: string, bankCode: string) {
    try {
        const verification = await resolveAccountNumber(accountNumber, bankCode);

        if (!verification) {
            return { error: 'Could not resolve account details' };
        }

        return {
            success: true,
            accountName: verification.accountName,
            accountNumber: verification.accountNumber,
        };
    } catch (error) {
        console.error('Error verifying account:', error);
        return { error: 'Failed to verify account details' };
    }
}

/**
 * Create a Paystack subaccount for provider payouts
 */
export async function createProviderSubaccount(data: {
    businessName: string;
    bankCode: string;
    accountNumber: string;
    percentageCharge: number;
}) {
    const session = await auth();
    if (!session?.user?.id) {
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

        // Check if already has subaccount
        if (providerProfile.paystackSubaccountCode) {
            return { error: 'Subaccount already exists' };
        }

        // Create subaccount
        const subaccount = await createSubaccount(
            data.businessName,
            data.bankCode,
            data.accountNumber,
            data.percentageCharge,
            `Payout account for ${data.businessName}`
        );

        if (!subaccount) {
            return { error: 'Failed to create subaccount' };
        }

        // Save to database
        await prisma.providerProfile.update({
            where: { userId: session.user.id },
            data: {
                paystackSubaccountCode: subaccount.subaccountCode,
                paystackSubaccountId: subaccount.subaccountId,
                payoutsEnabled: true,
            },
        });

        revalidatePath('/settings/payout-account');
        return { success: true };
    } catch (error) {
        console.error('Error creating subaccount:', error);
        return { error: 'Failed to create payout account' };
    }
}

/**
 * Get provider's subaccount status
 */
export async function getSubaccountStatus() {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    try {
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId: session.user.id },
            select: {
                paystackSubaccountCode: true,
                paystackSubaccountId: true,
                payoutsEnabled: true,
                businessName: true,
            },
        });

        if (!providerProfile) {
            return { error: 'Provider profile not found' };
        }

        return {
            hasSubaccount: !!providerProfile.paystackSubaccountCode,
            payoutsEnabled: providerProfile.payoutsEnabled,
            businessName: providerProfile.businessName,
        };
    } catch (error) {
        console.error('Error getting subaccount status:', error);
        return { error: 'Failed to get subaccount status' };
    }
}
