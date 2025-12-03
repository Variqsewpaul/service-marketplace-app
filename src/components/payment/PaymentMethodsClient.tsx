'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { setDefaultPaymentMethod, deletePaymentMethod } from '@/actions/payment-methods';
import AddPaymentMethodModal from './AddPaymentMethodModal';

interface PaymentMethod {
    id: string;
    card: {
        brand: string;
        last4: string;
        exp_month: number;
        exp_year: number;
    };
}

interface Props {
    initialPaymentMethods: PaymentMethod[];
    defaultPaymentMethodId: string | null;
}

export default function PaymentMethodsClient({ initialPaymentMethods, defaultPaymentMethodId }: Props) {
    const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
    const [defaultId, setDefaultId] = useState(defaultPaymentMethodId);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    const handleSetDefault = async (paymentMethodId: string) => {
        setLoading(paymentMethodId);
        const result = await setDefaultPaymentMethod(paymentMethodId);
        if (result.success) {
            setDefaultId(paymentMethodId);
        }
        setLoading(null);
    };

    const handleDelete = async (paymentMethodId: string) => {
        if (!confirm('Are you sure you want to remove this payment method?')) return;

        setLoading(paymentMethodId);
        const result = await deletePaymentMethod(paymentMethodId);
        if (result.success) {
            setPaymentMethods(paymentMethods.filter(pm => pm.id !== paymentMethodId));
            if (defaultId === paymentMethodId) {
                setDefaultId(null);
            }
        }
        setLoading(null);
    };

    const getCardBrandIcon = (brand: string) => {
        const icons: Record<string, string> = {
            visa: '💳',
            mastercard: '💳',
            amex: '💳',
            discover: '💳',
        };
        return icons[brand.toLowerCase()] || '💳';
    };

    return (
        <div className="space-y-6">
            {/* Add Payment Method Button */}
            <div className="flex justify-end">
                <Button onClick={() => setShowAddModal(true)}>
                    + Add Payment Method
                </Button>
            </div>

            {/* Payment Methods List */}
            {paymentMethods.length > 0 ? (
                <div className="grid gap-4">
                    {paymentMethods.map((pm) => (
                        <div
                            key={pm.id}
                            className={`border rounded-lg p-6 ${defaultId === pm.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{getCardBrandIcon(pm.card.brand)}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold capitalize">
                                                {pm.card.brand} •••• {pm.card.last4}
                                            </p>
                                            {defaultId === pm.id && (
                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Expires {pm.card.exp_month}/{pm.card.exp_year}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {defaultId !== pm.id && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetDefault(pm.id)}
                                            disabled={loading === pm.id}
                                        >
                                            {loading === pm.id ? 'Setting...' : 'Set as Default'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(pm.id)}
                                        disabled={loading === pm.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        {loading === pm.id ? 'Removing...' : 'Remove'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💳</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                    <p className="text-muted-foreground mb-6">
                        Add a payment method to make checkout faster and easier
                    </p>
                    <Button onClick={() => setShowAddModal(true)}>
                        Add Your First Payment Method
                    </Button>
                </div>
            )}

            {/* Add Payment Method Modal */}
            {showAddModal && (
                <AddPaymentMethodModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newMethod) => {
                        setPaymentMethods([...paymentMethods, newMethod]);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
}
