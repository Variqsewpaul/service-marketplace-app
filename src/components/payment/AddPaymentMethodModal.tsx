'use client';

import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { createSetupIntent } from '@/actions/payment-methods';
import { Button } from '@/components/ui/Button';

interface Props {
    onClose: () => void;
    onSuccess: (paymentMethod: any) => void;
}

function PaymentForm({ onClose, onSuccess }: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setError(submitError.message || 'An error occurred');
            setLoading(false);
            return;
        }

        const { error: confirmError, setupIntent } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: 'if_required',
        });

        if (confirmError) {
            setError(confirmError.message || 'An error occurred');
            setLoading(false);
        } else if (setupIntent && setupIntent.payment_method) {
            // Success - payment method added
            onSuccess({ id: setupIntent.payment_method });
            window.location.reload(); // Reload to fetch updated payment methods
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={!stripe || loading}>
                    {loading ? 'Adding...' : 'Add Payment Method'}
                </Button>
            </div>
        </form>
    );
}

export default function AddPaymentMethodModal({ onClose, onSuccess }: Props) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loadingIntent, setLoadingIntent] = useState(true);

    useEffect(() => {
        createSetupIntent().then((result) => {
            if (result.clientSecret) {
                setClientSecret(result.clientSecret);
            }
            setLoadingIntent(false);
        });
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-6">Add Payment Method</h2>

                {loadingIntent ? (
                    <div className="py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-4 text-muted-foreground">Loading...</p>
                    </div>
                ) : clientSecret ? (
                    <Elements
                        stripe={getStripe()}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: 'stripe',
                            },
                        }}
                    >
                        <PaymentForm onClose={onClose} onSuccess={onSuccess} />
                    </Elements>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-red-600">Failed to initialize payment form</p>
                        <Button onClick={onClose} className="mt-4">Close</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
