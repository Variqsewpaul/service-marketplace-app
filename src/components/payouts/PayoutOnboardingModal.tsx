'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Props {
    accountStatus: {
        hasSubaccount: boolean;
        payoutsEnabled: boolean;
        error?: string;
    };
}

export default function PayoutOnboardingModal({ accountStatus }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user has subaccount
        if (accountStatus.hasSubaccount) {
            return;
        }

        // Check if user has skipped recently (within 24 hours)
        const skippedAt = localStorage.getItem('payout_onboarding_skipped_at');
        if (skippedAt) {
            const skippedTime = new Date(skippedAt).getTime();
            const now = new Date().getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (now - skippedTime < twentyFourHours) {
                return;
            }
        }

        // Show modal
        setIsOpen(true);
    }, [accountStatus]);

    const handleSkip = () => {
        localStorage.setItem('payout_onboarding_skipped_at', new Date().toISOString());
        setIsOpen(false);
    };

    const handleSetup = () => {
        router.push('/settings/payout-account');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Payouts</h2>
                    <p className="text-gray-600 mb-6">
                        To receive payments from customers, you need to add your banking details. It only takes a minute!
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <Button onClick={handleSetup} size="lg" className="w-full">
                            Set Up Now
                        </Button>
                        <button 
                            onClick={handleSkip}
                            className="text-sm text-gray-500 hover:text-gray-700 font-medium py-2"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 text-xs text-center text-gray-500 border-t">
                    You can always set this up later in Settings.
                </div>
            </div>
        </div>
    );
}
