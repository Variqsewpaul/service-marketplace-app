import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '@/types/monetization';
import SubscriptionSelector from '@/components/subscription/SubscriptionSelector';

export default async function SubscriptionPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            subscription: true,
        },
    }) as any;

    if (!providerProfile) {
        redirect('/become-a-provider');
    }

    const currentTier = providerProfile.subscriptionTier as SubscriptionTier;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                <p className="text-gray-600 mt-2">
                    Choose the plan that best fits your business needs
                </p>
            </div>

            <SubscriptionSelector
                currentTier={currentTier}
            />

            {/* Billing History */}
            {providerProfile.subscription && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Billing Information</h2>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Current Period:</span>
                                <span className="ml-2 font-semibold">
                                    {new Date(providerProfile.subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                                    {new Date(providerProfile.subscription.currentPeriodEnd).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Status:</span>
                                <span className="ml-2 font-semibold capitalize">
                                    {providerProfile.subscription.status.toLowerCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
