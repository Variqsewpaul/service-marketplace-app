import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PayoutAccountClient from '@/components/payment/PayoutAccountClient';
import { getSubaccountStatus } from '@/actions/paystack-subaccounts';

export default async function PayoutAccountPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/auth/signin');
    }

    // Check if user is a provider
    const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!providerProfile) {
        redirect('/become-a-provider');
    }

    const accountStatus = await getSubaccountStatus();

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Payout Account</h1>
                        <p className="text-muted-foreground">
                            Set up your bank account to receive payments from customers via Paystack
                        </p>
                    </div>

                    <PayoutAccountClient accountStatus={accountStatus} />
                </div>
            </div>
        </div>
    );
}
