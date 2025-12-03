'use client';

import { SubscriptionTier } from '@/types/monetization';
import { SUBSCRIPTION_TIERS } from '@/lib/pricing-config';
import Link from 'next/link';

interface SubscriptionStatusProps {
    tier: SubscriptionTier;
    monthlyBookingCount: number;
    bookingLimit?: number;
    subscriptionEndDate?: Date;
}

export default function SubscriptionStatus({
    tier,
    monthlyBookingCount,
    bookingLimit,
    subscriptionEndDate,
}: SubscriptionStatusProps) {
    const tierInfo = SUBSCRIPTION_TIERS[tier];
    const isNearLimit = bookingLimit && monthlyBookingCount >= bookingLimit * 0.8;
    const isAtLimit = bookingLimit && monthlyBookingCount >= bookingLimit;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {tierInfo.name} Plan
                    </h3>
                    <p className="text-sm text-gray-600">
                        {tierInfo.price === 0 ? 'Free' : `R${tierInfo.price}/month`}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                        {tierInfo.transactionFeePercent}%
                    </div>
                    <div className="text-xs text-gray-600">transaction fee</div>
                </div>
            </div>

            {/* Booking Count for Free Tier */}
            {bookingLimit && (
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-700">Monthly Bookings</span>
                        <span className={`font-semibold ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {monthlyBookingCount} / {bookingLimit}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${Math.min((monthlyBookingCount / bookingLimit) * 100, 100)}%` }}
                        />
                    </div>
                    {isAtLimit && (
                        <p className="text-xs text-red-600 mt-1">
                            You've reached your booking limit. Upgrade to accept more bookings.
                        </p>
                    )}
                </div>
            )}

            {/* Subscription End Date */}
            {subscriptionEndDate && tier !== SubscriptionTier.FREE && (
                <div className="mb-4 text-sm text-gray-600">
                    Renews on {new Date(subscriptionEndDate).toLocaleDateString()}
                </div>
            )}

            {/* Benefits */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Your Benefits:</h4>
                <ul className="space-y-1">
                    {tierInfo.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                            <svg
                                className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path d="M5 13l4 4L19 7"></path>
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Upgrade CTA */}
            {tier !== SubscriptionTier.PRO && (
                <Link
                    href="/dashboard/subscription"
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition"
                >
                    {tier === SubscriptionTier.FREE ? 'Upgrade Now' : 'View Plans'}
                </Link>
            )}
        </div>
    );
}
