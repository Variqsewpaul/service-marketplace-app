'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { finalizeBookingPayment } from '@/actions/payment-actions';
import { Button } from '@/components/ui/Button';

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        if (!reference) {
            setStatus('error');
            setMessage('Invalid payment reference');
            return;
        }

        const verifyPayment = async () => {
            try {
                const result = await finalizeBookingPayment(reference);

                if (result.success && result.bookingId) {
                    setStatus('success');
                    setMessage('Payment successful! Redirecting to booking...');
                    setTimeout(() => {
                        router.push(`/dashboard/bookings/${result.bookingId}`);
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(result.error || 'Payment verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An unexpected error occurred');
            }
        };

        verifyPayment();
    }, [reference, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                {status === 'processing' && (
                    <>
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h2 className="text-xl font-semibold text-green-900 mb-2">Payment Successful</h2>
                        <p className="text-green-800 mb-4">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✕</span>
                        </div>
                        <h2 className="text-xl font-semibold text-red-900 mb-2">Payment Failed</h2>
                        <p className="text-red-800 mb-6">{message}</p>
                        <Button onClick={() => router.push('/dashboard/bookings')}>
                            Return to Bookings
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
