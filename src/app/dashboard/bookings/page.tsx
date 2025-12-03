'use client';

import { useEffect, useState } from 'react';
import { getUserBookings } from '@/actions/booking-actions';
import { BookingStatus } from '@/types/monetization';
import BookingCard from '@/components/booking/BookingCard';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [isProvider, setIsProvider] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');

    useEffect(() => {
        loadBookings();
    }, [filter]);

    const loadBookings = async () => {
        setLoading(true);
        const result = await getUserBookings(filter === 'ALL' ? undefined : filter);
        if (result.success) {
            setBookings(result.bookings || []);
            setIsProvider(result.isProvider || false);
        }
        setLoading(false);
    };

    const filteredBookings = filter === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const statusCounts = {
        ALL: bookings.length,
        PENDING: bookings.filter(b => b.status === BookingStatus.PENDING).length,
        CONFIRMED: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
        IN_PROGRESS: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length,
        COMPLETED: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
        CANCELLED: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isProvider ? 'My Bookings (Provider)' : 'My Bookings (Customer)'}
                </h1>
                <p className="text-gray-600 mt-2">
                    {isProvider
                        ? 'Manage your service bookings and track customer requests'
                        : 'View and manage your service requests'}
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as any)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {status.replace('_', ' ')} ({count})
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="text-gray-600">Loading bookings...</div>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <p className="text-gray-600">No bookings found.</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {isProvider
                            ? 'Bookings will appear here when customers request your services.'
                            : 'Start browsing providers to make your first booking.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            isProvider={isProvider}
                            onUpdate={loadBookings}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
