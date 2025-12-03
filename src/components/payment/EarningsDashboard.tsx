'use client';

import { useEffect, useState } from 'react';
import { getProviderEarnings } from '@/actions/payment-actions';
import { formatCurrency } from '@/lib/fee-calculator';
import { TransactionSummary } from '@/types/monetization';

export default function EarningsDashboard() {
    const [summary, setSummary] = useState<TransactionSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEarnings();
    }, []);

    const loadEarnings = async () => {
        setLoading(true);
        const result = await getProviderEarnings();
        if (result.success && result.summary) {
            setSummary(result.summary);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-gray-600">Loading earnings...</div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">No earnings data available yet.</p>
                <p className="text-sm text-gray-500 mt-2">Complete your first booking to see earnings here.</p>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Earnings',
            value: formatCurrency(summary.totalEarnings),
            subtext: 'Gross revenue from all bookings',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Platform Fees',
            value: formatCurrency(summary.totalFees),
            subtext: 'Transaction and booking fees',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            label: 'Net Earnings',
            value: formatCurrency(summary.netEarnings),
            subtext: 'Amount after fees',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Pending Payments',
            value: formatCurrency(summary.pendingPayments),
            subtext: 'Held in escrow',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
    ];

    const feePercentage = summary.totalEarnings > 0
        ? ((summary.totalFees / summary.totalEarnings) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
                        <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.subtext}</div>
                    </div>
                ))}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completed Bookings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Completed Bookings:</span>
                            <span className="text-2xl font-bold text-gray-900">{summary.completedBookings}</span>
                        </div>
                        {summary.completedBookings > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Average per Booking:</span>
                                <span className="text-xl font-semibold text-blue-600">
                                    {formatCurrency(summary.netEarnings / summary.completedBookings)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fee Analysis */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Analysis</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Effective Fee Rate:</span>
                            <span className="text-2xl font-bold text-gray-900">{feePercentage}%</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            Upgrade your subscription to reduce transaction fees and keep more of your earnings.
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Breakdown Chart (Visual) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
                <div className="space-y-4">
                    {/* Net Earnings Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Net Earnings</span>
                            <span className="font-semibold text-green-600">{formatCurrency(summary.netEarnings)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-green-500 h-4 rounded-full"
                                style={{
                                    width: summary.totalEarnings > 0
                                        ? `${(summary.netEarnings / summary.totalEarnings) * 100}%`
                                        : '0%',
                                }}
                            />
                        </div>
                    </div>

                    {/* Fees Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700">Platform Fees</span>
                            <span className="font-semibold text-red-600">{formatCurrency(summary.totalFees)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-red-500 h-4 rounded-full"
                                style={{
                                    width: summary.totalEarnings > 0
                                        ? `${(summary.totalFees / summary.totalEarnings) * 100}%`
                                        : '0%',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Maximize Your Earnings</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Upgrade to Pro tier to reduce fees from {feePercentage}% to 3%</li>
                    <li>• Complete bookings promptly to release escrowed payments faster</li>
                    <li>• Maintain high ratings to attract more customers</li>
                </ul>
            </div>
        </div>
    );
}
