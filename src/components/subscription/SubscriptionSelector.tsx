'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionTier } from '@/types/monetization';
import { SUBSCRIPTION_TIERS } from '@/lib/pricing-config';
import { upgradeSubscription, downgradeSubscription } from '@/actions/subscription-actions';

interface SubscriptionSelectorProps {
    currentTier: SubscriptionTier;
}

export default function SubscriptionSelector({ currentTier }: SubscriptionSelectorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const TIER_RANK = {
        [SubscriptionTier.FREE]: 0,
        [SubscriptionTier.BASIC]: 1,
        [SubscriptionTier.PRO]: 2,
    };

    const handleSelectTier = async (tier: SubscriptionTier) => {
        if (tier === currentTier) return;

        setLoading(true);
        setError(null);

        try {
            const isDowngrade = TIER_RANK[tier] < TIER_RANK[currentTier];
            const result = isDowngrade
                ? await downgradeSubscription(tier)
                : await upgradeSubscription(tier);

            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || 'Failed to update subscription');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.values(SUBSCRIPTION_TIERS).map((tierInfo) => {
                    const isCurrent = tierInfo.tier === currentTier;
                    const isUpgrade = TIER_RANK[tierInfo.tier] > TIER_RANK[currentTier];

                    return (
                        <div
                            key={tierInfo.tier}
                            className={`border-2 rounded-lg p-6 ${isCurrent
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            {/* Tier Header */}
                            <div className="text-center mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">{tierInfo.name}</h3>
                                <div className="mt-2">
                                    {tierInfo.price === 0 ? (
                                        <span className="text-3xl font-bold text-gray-900">Free</span>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold text-gray-900">R{tierInfo.price}</span>
                                            <span className="text-gray-600">/month</span>
                                        </>
                                    )}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-blue-600">
                                    {tierInfo.transactionFeePercent}% transaction fee
                                </div>
                            </div>

                            {/* Features List */}
                            <ul className="space-y-3 mb-6">
                                {tierInfo.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg
                                            className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Action Button */}
                            <button
                                onClick={() => handleSelectTier(tierInfo.tier)}
                                disabled={loading || isCurrent}
                                className={`w-full py-2 px-4 rounded font-semibold transition ${isCurrent
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : isUpgrade
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-600 text-white hover:bg-gray-700'
                                    } disabled:opacity-50`}
                            >
                                {loading
                                    ? 'Processing...'
                                    : isCurrent
                                        ? 'Current Plan'
                                        : isUpgrade
                                            ? 'Upgrade'
                                            : 'Downgrade'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">How it works:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Transaction fees are deducted from each completed booking</li>
                    <li>• Booking fees (R25) are split between you and the customer</li>
                    <li>• Upgrades take effect immediately</li>
                    <li>• Downgrades take effect at the end of your current billing period</li>
                </ul>
            </div>
        </div>
    );
}
