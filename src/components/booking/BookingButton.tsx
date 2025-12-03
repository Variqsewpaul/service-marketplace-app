'use client';

import { useState } from 'react';
import { SubscriptionTier } from '@/types/monetization';
import BookingRequestForm from './BookingRequestForm';
import { useRouter } from 'next/navigation';

interface BookingButtonProps {
    providerId: string;
    providerName: string;
    providerTier: SubscriptionTier;
    defaultServicePrice?: number;
}

export default function BookingButton({
    providerId,
    providerName,
    providerTier,
    defaultServicePrice,
}: BookingButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleSuccess = (bookingId: string) => {
        setShowModal(false);
        router.push(`/dashboard/bookings`);
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
                Book Now
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <BookingRequestForm
                            providerId={providerId}
                            providerName={providerName}
                            providerTier={providerTier}
                            defaultServicePrice={defaultServicePrice}
                            onSuccess={handleSuccess}
                            onCancel={() => setShowModal(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
