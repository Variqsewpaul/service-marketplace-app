import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPaymentHistory } from '@/actions/payment-methods';

export default async function PaymentMethodsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    const result = await getPaymentHistory();

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Payment Methods</h1>
                        <p className="text-muted-foreground">
                            Manage your payments with Paystack - South Africa's trusted payment platform
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Info Card */}
                        <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">💳</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-2">Secure Payments with Paystack</h3>
                                    <p className="text-blue-800 text-sm mb-3">
                                        When you make a booking, you'll be redirected to Paystack's secure payment page to complete your transaction.
                                    </p>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>✓ All major South African banks supported</li>
                                        <li>✓ Instant EFT and card payments</li>
                                        <li>✓ Bank-level security and encryption</li>
                                        <li>✓ Mobile money and QR payments</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="border rounded-lg p-6">
                            <h3 className="font-semibold mb-4">Recent Transactions</h3>
                            {result.transactions && result.transactions.length > 0 ? (
                                <div className="space-y-3">
                                    {result.transactions.map((transaction: any) => (
                                        <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <div>
                                                <p className="font-medium">{transaction.description}</p>
                                                <p className="text-sm text-muted-foreground">{transaction.date}</p>
                                            </div>
                                            <p className="font-semibold">R{transaction.amount.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No transactions yet</p>
                                    <p className="text-sm mt-1">Your payment history will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* Supported Payment Methods */}
                        <div className="border rounded-lg p-6">
                            <h3 className="font-semibold mb-4">Supported Payment Methods</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded">
                                    <div className="text-3xl mb-2">💳</div>
                                    <p className="text-sm font-medium">Cards</p>
                                    <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded">
                                    <div className="text-3xl mb-2">🏦</div>
                                    <p className="text-sm font-medium">Bank Transfer</p>
                                    <p className="text-xs text-muted-foreground">Instant EFT</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded">
                                    <div className="text-3xl mb-2">📱</div>
                                    <p className="text-sm font-medium">Mobile Money</p>
                                    <p className="text-xs text-muted-foreground">MTN, Vodacom</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded">
                                    <div className="text-3xl mb-2">📲</div>
                                    <p className="text-sm font-medium">QR Payments</p>
                                    <p className="text-xs text-muted-foreground">SnapScan, Zapper</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
