
if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const BASE_URL = 'https://api.paystack.co';

/**
 * Helper function for Paystack API requests
 */
async function paystackRequest(endpoint: string, method: string = 'GET', body?: any) {
    const headers = {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    };

    const options: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Paystack API request failed');
        }

        return data;
    } catch (error) {
        console.error(`Paystack API Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Get or create a Paystack customer for a user
 */
export async function getOrCreatePaystackCustomer(userId: string, email: string, firstName?: string, lastName?: string) {
    const { prisma } = await import('@/lib/prisma');

    // Check if user already has a Paystack customer code
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { paystackCustomerCode: true, paystackCustomerId: true },
    });

    if (user?.paystackCustomerCode) {
        return user.paystackCustomerCode;
    }

    // Create new Paystack customer
    try {
        const response = await paystackRequest('/customer', 'POST', {
            email,
            first_name: firstName,
            last_name: lastName,
            metadata: {
                userId,
            },
        });

        if (response.status && response.data) {
            // Save customer code to database
            await prisma.user.update({
                where: { id: userId },
                data: {
                    paystackCustomerCode: response.data.customer_code,
                    paystackCustomerId: response.data.id.toString(),
                },
            });

            return response.data.customer_code;
        }
    } catch (error) {
        console.error('Error creating Paystack customer:', error);
        throw new Error('Failed to create Paystack customer');
    }
}

/**
 * Initialize a transaction for payment
 */
export async function initializeTransaction(email: string, amount: number, metadata?: any) {
    try {
        const response = await paystackRequest('/transaction/initialize', 'POST', {
            email,
            amount: Math.round(amount * 100), // Paystack uses kobo (cents)
            metadata,
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        });

        if (response.status && response.data) {
            return {
                authorizationUrl: response.data.authorization_url,
                accessCode: response.data.access_code,
                reference: response.data.reference,
            };
        }
    } catch (error) {
        console.error('Error initializing transaction:', error);
        throw new Error('Failed to initialize transaction');
    }
}

/**
 * Verify a transaction
 */
export async function verifyTransaction(reference: string) {
    try {
        const response = await paystackRequest(`/transaction/verify/${reference}`);

        if (response.status && response.data) {
            return {
                status: response.data.status,
                id: response.data.id,
                amount: response.data.amount / 100, // Convert from kobo to ZAR
                customer: response.data.customer,
                metadata: response.data.metadata,
            };
        }
    } catch (error) {
        console.error('Error verifying transaction:', error);
        throw new Error('Failed to verify transaction');
    }
}

/**
 * Create a subaccount for a provider
 */
export async function createSubaccount(
    businessName: string,
    settlementBank: string,
    accountNumber: string,
    percentageCharge: number,
    description?: string
) {
    try {
        const response = await paystackRequest('/subaccount', 'POST', {
            business_name: businessName,
            settlement_bank: settlementBank,
            account_number: accountNumber,
            percentage_charge: percentageCharge,
            description: description || `Subaccount for ${businessName}`,
        });

        if (response.status && response.data) {
            return {
                subaccountCode: response.data.subaccount_code,
                subaccountId: response.data.id.toString(),
            };
        }
    } catch (error) {
        console.error('Error creating subaccount:', error);
        throw new Error('Failed to create subaccount');
    }
}

/**
 * List all banks for South Africa
 */
export async function listBanks() {
    try {
        const response = await paystackRequest('/bank?country=south_africa');

        if (response.status && response.data) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error('Error listing banks:', error);
        return [];
    }
}

/**
 * Resolve account number to verify bank details
 */
export async function resolveAccountNumber(accountNumber: string, bankCode: string) {
    try {
        const response = await paystackRequest(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);

        if (response.status && response.data) {
            return {
                accountNumber: response.data.account_number,
                accountName: response.data.account_name,
            };
        }
    } catch (error) {
        console.error('Error resolving account number:', error);
        throw new Error('Failed to resolve account number');
    }
}
