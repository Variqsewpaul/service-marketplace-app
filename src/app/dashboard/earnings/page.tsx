import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import EarningsDashboard from '@/components/payment/EarningsDashboard';

export default async function EarningsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Verify user is a provider
    const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!providerProfile) {
        redirect('/become-a-provider');
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
                <p className="text-gray-600 mt-2">
                    Track your income, fees, and pending payments
                </p>
            </div>

            <EarningsDashboard />
        </div>
    );
}
