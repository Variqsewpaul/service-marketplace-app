'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
    getSouthAfricanBanks,
    verifyBankAccount,
    createProviderSubaccount
} from '@/actions/paystack-subaccounts';

interface Props {
    accountStatus: {
        hasSubaccount: boolean;
        payoutsEnabled: boolean;
        businessName?: string | null;
        error?: string;
    };
}

export default function PayoutAccountClient({ accountStatus }: Props) {
    const [showSetupForm, setShowSetupForm] = useState(false);
    const [banks, setBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: accountStatus.businessName || '',
        bankCode: '',
        accountNumber: '',
        percentageCharge: 10, // Platform takes 10%
    });
    const [verifiedAccount, setVerifiedAccount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (showSetupForm) {
            getSouthAfricanBanks().then((result) => {
                if (result.banks) {
                    setBanks(result.banks);
                }
            });
        }
    }, [showSetupForm]);

    const handleVerifyAccount = async () => {
        if (!formData.accountNumber || !formData.bankCode) {
            setError('Please select a bank and enter account number');
            return;
        }

        setLoading(true);
        setError(null);
        const result = await verifyBankAccount(formData.accountNumber, formData.bankCode);

        if (result.success) {
            setVerifiedAccount(result.accountName || null);
        } else {
            setError(result.error || 'Failed to verify account');
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!verifiedAccount) {
            setError('Please verify your account first');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await createProviderSubaccount(formData);

        if (result.success) {
            window.location.reload();
        } else {
            setError(result.error || 'Failed to create payout account');
        }
        setLoading(false);
    };

    if (accountStatus.error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700">{accountStatus.error}</p>
            </div>
        );
    }

    if (accountStatus.hasSubaccount && accountStatus.payoutsEnabled) {
        return (
            <div className="space-y-6">
                <div className="border rounded-lg p-6 bg-green-50 border-green-200">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">✓</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-green-900 mb-2">Payout Account Active</h3>
                            <p className="text-green-800 mb-4">
                                Your payout account is set up and ready to receive payments via Paystack.
                            </p>

                            <div className="bg-white rounded p-4 mb-4">
                                <p className="text-sm text-muted-foreground">Business Name</p>
                                <p className="font-semibold">{accountStatus.businessName || 'Not set'}</p>
                            </div>

                            <p className="text-sm text-green-800">
                                Payments will be automatically transferred to your bank account after each completed job.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Payout Information</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payout Schedule</span>
                            <span className="font-medium">Automatic after job completion</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform Fee</span>
                            <span className="font-medium">10% per transaction</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Your Earnings</span>
                            <span className="font-medium">90% of each payment</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!showSetupForm) {
        return (
            <div className="border rounded-lg p-8">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">💰</span>
                    </div>

                    <h2 className="text-2xl font-bold mb-4">Set Up Your Payout Account</h2>

                    <p className="text-muted-foreground mb-6">
                        Connect your South African bank account to receive payments from customers through Paystack.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                        <h3 className="font-semibold text-blue-900 mb-3">What you'll need:</h3>
                        <ul className="space-y-2 text-blue-800">
                            <li className="flex items-start gap-2">
                                <span>✓</span>
                                <span>South African bank account</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>✓</span>
                                <span>Account number and bank details</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>✓</span>
                                <span>Business name (if applicable)</span>
                            </li>
                        </ul>
                    </div>

                    <Button
                        onClick={() => setShowSetupForm(true)}
                        size="lg"
                        className="px-8"
                    >
                        Set Up Payout Account
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Bank Account Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-2">Business Name</label>
                    <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Select Bank</label>
                    <select
                        value={formData.bankCode}
                        onChange={(e) => {
                            setFormData({ ...formData, bankCode: e.target.value });
                            setVerifiedAccount(null);
                        }}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                    >
                        <option value="">Choose your bank</option>
                        {banks.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                                {bank.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Account Number</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => {
                                setFormData({ ...formData, accountNumber: e.target.value });
                                setVerifiedAccount(null);
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg"
                            required
                        />
                        <Button
                            type="button"
                            onClick={handleVerifyAccount}
                            disabled={loading || !formData.bankCode || !formData.accountNumber}
                            variant="outline"
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </div>
                    {verifiedAccount && (
                        <p className="text-sm text-green-600 mt-2">
                            ✓ Account verified: {verifiedAccount}
                        </p>
                    )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Platform Fee:</strong> We charge 10% per transaction. You'll receive 90% of each payment directly to your bank account.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSetupForm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !verifiedAccount}
                    >
                        {loading ? 'Creating...' : 'Create Payout Account'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
