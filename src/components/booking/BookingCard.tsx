'use client';

import { BookingStatus } from '@/types/monetization';
import { formatCurrency } from '@/lib/fee-calculator';
import { confirmBooking, startBooking, completeBooking, cancelBooking, initiateDispute, sendQuote } from '@/actions/booking-actions';
import { useState } from 'react';

interface BookingCardProps {
    booking: any; // Full booking object from database
    isProvider: boolean;
    onUpdate?: () => void;
}

export default function BookingCard({ booking, isProvider, onUpdate }: BookingCardProps) {
    const [loading, setLoading] = useState(false);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showDispute, setShowDispute] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [quotePrice, setQuotePrice] = useState('');

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        CONFIRMED: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-purple-100 text-purple-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-gray-100 text-gray-800',
        DISPUTED: 'bg-red-100 text-red-800',
    };

    const handleAction = async (action: () => Promise<any>) => {
        setLoading(true);
        const result = await action();
        setLoading(false);

        if (result.success) {
            if (result.authorizationUrl) {
                // Redirect to Paystack
                window.location.href = result.authorizationUrl;
            } else {
                onUpdate?.();
            }
        } else {
            alert(result.error);
        }
    };

    const handleSendQuote = async () => {
        if (!quotePrice || parseFloat(quotePrice) <= 0) return;
        setLoading(true);
        const result = await sendQuote(booking.id, parseFloat(quotePrice));
        setLoading(false);
        if (result.success) {
            setShowQuoteModal(false);
            onUpdate?.();
        } else {
            alert(result.error);
        }
    };

    const otherParty = isProvider ? booking.customer : booking.providerProfile?.user;

    // Strictly hide contact info if booking is not confirmed/active
    const isBookingActive = [
        BookingStatus.CONFIRMED,
        BookingStatus.IN_PROGRESS,
        BookingStatus.COMPLETED,
        BookingStatus.DISPUTED
    ].includes(booking.status);

    const showContactInfo = booking.contactRevealed && isBookingActive;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{booking.serviceTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {isProvider ? 'Customer' : 'Provider'}: {showContactInfo ? (otherParty?.name || 'Unknown') : 'Hidden (Deposit Required)'}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
                    {booking.status.replace('_', ' ')}
                </span>
            </div>

            {/* Service Details */}
            {booking.serviceDescription && (
                <p className="text-sm text-gray-900 mb-3">{booking.serviceDescription}</p>
            )}

            {/* Notes */}
            {booking.notes && (
                <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</span>
                    <p className="text-sm text-gray-900 mt-1">{booking.notes}</p>
                </div>
            )}

            {/* Booking Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {booking.scheduledDate && (
                    <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                            {new Date(booking.scheduledDate).toLocaleDateString()}
                        </span>
                    </div>
                )}
                {booking.scheduledTime && (
                    <div>
                        <span className="text-gray-600">Time:</span>
                        <span className="ml-2 font-semibold text-gray-900">{booking.scheduledTime}</span>
                    </div>
                )}
                {booking.location && (
                    <div className="col-span-2">
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                            {!showContactInfo ? 'Hidden (Deposit Required)' : booking.location}
                        </span>
                    </div>
                )}
            </div>

            {/* Pricing */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                {booking.servicePrice > 0 ? (
                    <>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Service Price:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(booking.servicePrice)}</span>
                        </div>
                        {booking.status === BookingStatus.PENDING && (
                            <div className="text-xs text-blue-600 font-medium mt-1">
                                Quote Received - Waiting for acceptance
                            </div>
                        )}
                        {booking.status !== BookingStatus.PENDING && (
                            <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200 text-gray-900">
                                <span>Total:</span>
                                <span>{formatCurrency(booking.totalAmount)}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-sm text-amber-600 font-medium flex items-center gap-2">
                        <span>⏳ Quote Requested</span>
                        <span className="text-gray-500 font-normal">- Waiting for provider proposal</span>
                    </div>
                )}
            </div>

            {/* Contact Reveal Status */}
            {booking.contactRevealed && (
                <div className="bg-green-50 border border-green-200 rounded p-2 mb-4 text-sm text-green-700">
                    ✓ Contact information has been shared
                </div>
            )}

            {/* Action Buttons */}
            {!showCancelForm && (
                <div className="mt-6 flex flex-wrap gap-3">
                    {/* Provider Actions */}
                    {isProvider && booking.status === BookingStatus.PENDING && booking.servicePrice === 0 && (
                        <button
                            onClick={() => setShowQuoteModal(true)}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send Quote
                        </button>
                    )}

                    {isProvider && booking.status === BookingStatus.PENDING && booking.servicePrice > 0 && (
                        <button
                            onClick={() => setShowQuoteModal(true)}
                            disabled={loading}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50"
                        >
                            Update Quote
                        </button>
                    )}

                    {isProvider && booking.status === BookingStatus.CONFIRMED && (
                        <button
                            onClick={() => handleAction(() => startBooking(booking.id))}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            Start Service
                        </button>
                    )}

                    {/* Customer Actions */}
                    {!isProvider && booking.status === BookingStatus.PENDING && booking.servicePrice > 0 && (
                        <button
                            onClick={() => handleAction(() => confirmBooking(booking.id))}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            Accept Quote & Pay Deposit ({formatCurrency(booking.depositAmount)})
                        </button>
                    )}

                    {booking.status === BookingStatus.IN_PROGRESS && (
                        <button
                            onClick={() => handleAction(() => completeBooking(booking.id))}
                            disabled={loading}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                        >
                            Mark Complete
                        </button>
                    )}

                    {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) && (
                        <button
                            onClick={() => setShowCancelForm(true)}
                            disabled={loading}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded font-semibold hover:bg-red-50 disabled:opacity-50 transition"
                        >
                            Cancel
                        </button>
                    )}

                    {booking.status === BookingStatus.COMPLETED && (
                        <button
                            onClick={() => handleAction(() => initiateDispute(booking.id, 'Dispute reason'))}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            Report Issue
                        </button>
                    )}
                </div>
            )}

            {/* Cancel Form */}
            {showCancelForm && (
                <div className="space-y-3">
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation (optional)"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(() => cancelBooking(booking.id, cancelReason))}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                        >
                            Confirm Cancellation
                        </button>
                        <button
                            onClick={() => setShowCancelForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 transition"
                        >
                            Keep Booking
                        </button>
                    </div>
                </div>
            )}

            {/* Booking Date */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                Booked on {new Date(booking.createdAt).toLocaleDateString()}
            </div>
            {/* Quote Modal */}
            {showQuoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Send Price Quote</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Price ($)
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                value={quotePrice}
                                onChange={(e) => setQuotePrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Enter price..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowQuoteModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendQuote}
                                disabled={loading || !quotePrice}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Quote'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
