'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: Date;
    description: string | null;
    booking?: {
        id: string;
        serviceTitle: string;
        providerProfile: {
            user: {
                name: string | null;
            };
            businessName: string | null;
        };
    } | null;
}

interface Props {
    transactions: Transaction[];
}

export default function CustomerPaymentHistory({ transactions }: Props) {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💳</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
                <p className="text-muted-foreground mb-6">
                    You haven't made any payments yet. Book a service to get started.
                </p>
                <Link href="/services">
                    <Button>Browse Services</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Description</th>
                            <th className="px-4 py-3">Provider</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    {tx.description || (tx.booking ? `Payment for ${tx.booking.serviceTitle}` : 'Payment')}
                                </td>
                                <td className="px-4 py-3">
                                    {tx.booking?.providerProfile.businessName || tx.booking?.providerProfile.user.name || 'Unknown'}
                                </td>
                                <td className="px-4 py-3 font-semibold">
                                    R {tx.amount.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                        ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {tx.booking && (
                                        <Link href={`/dashboard/bookings/${tx.booking.id}`}>
                                            <Button variant="ghost" size="sm">
                                                View Booking
                                            </Button>
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
