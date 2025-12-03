'use client';

import { useState } from 'react';
import { BookingRequest, SubscriptionTier } from '@/types/monetization';
import { createBookingRequest } from '@/actions/booking-actions';

interface BookingRequestFormProps {
    providerId: string;
    providerName: string;
    providerTier: SubscriptionTier;
    defaultServicePrice?: number;
    defaultServiceTitle?: string;
    onSuccess?: (bookingId: string) => void;
    onCancel?: () => void;
}

export default function BookingRequestForm({
    providerId,
    providerName,
    providerTier,
    defaultServiceTitle = '',
    onSuccess,
    onCancel,
}: BookingRequestFormProps) {
    const [formData, setFormData] = useState({
        serviceTitle: defaultServiceTitle,
        serviceDescription: '',
        scheduledDate: '',
        scheduledTime: '',
        location: '',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const request: BookingRequest = {
                providerId,
                serviceTitle: formData.serviceTitle,
                serviceDescription: formData.serviceDescription || undefined,
                servicePrice: 0, // Price will be set by provider in quote
                scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
                scheduledTime: formData.scheduledTime || undefined,
                location: formData.location || undefined,
                notes: formData.notes || undefined,
            };

            const result = await createBookingRequest(request);

            if (result.success && result.bookingId) {
                onSuccess?.(result.bookingId);
            } else {
                setError(result.error || 'Failed to create booking');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Request Quote from {providerName}
            </h2>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Service Title */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Service Title *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.serviceTitle}
                        onChange={(e) => setFormData({ ...formData, serviceTitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="e.g., House Cleaning, Plumbing Repair"
                    />
                </div>

                {/* Service Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Service Description
                    </label>
                    <textarea
                        value={formData.serviceDescription}
                        onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Describe what you need..."
                    />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Preferred Date
                        </label>
                        <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Preferred Time
                        </label>
                        <input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Service Location
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Address or location"
                    />
                </div>

                {/* Additional Notes */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Additional Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Any special requirements or instructions..."
                    />
                </div>

                {/* Terms */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-gray-700">
                    <p className="mb-2">
                        <strong>How it works:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Request a quote for your service</li>
                        <li>Provider will review and send a price proposal</li>
                        <li>Accept the quote and pay a deposit to confirm</li>
                        <li>Contact details revealed after confirmation</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.serviceTitle}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {loading ? 'Sending Request...' : 'Request Quote'}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
