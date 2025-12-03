'use client';

import { useState } from 'react';
import { unlockLead } from '@/app/actions/job';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

type JobPost = {
    id: string;
    title: string;
    description: string;
    street?: string | null;
    district?: string | null;
    city?: string | null;
    postcode?: string | null;
    location: string | null;  // Old field for backward compatibility
    category: string;
    budget: number | null;
    createdAt: Date;
    customer: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

export default function LeadCard({ job, isUnlocked }: { job: JobPost, isUnlocked: boolean }) {
    const router = useRouter();
    const [unlocked, setUnlocked] = useState(isUnlocked);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleUnlock() {
        setIsLoading(true);
        setError('');

        const result = await unlockLead(job.id);

        if (result.success) {
            setUnlocked(true);
        } else {
            setError(result.error || 'Failed to unlock lead');
        }
        setIsLoading(false);
    }

    // Format location from structured fields
    const formatLocation = () => {
        const parts = [job.district, job.city, job.postcode].filter(Boolean);
        if (parts.length > 0) {
            return parts.join(', ');
        }
        // Fallback to old location field
        return job.location || 'Remote';
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg border">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">{job.title}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {job.category} • {formatLocation()} • {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {job.budget && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            R{job.budget}
                        </span>
                    )}
                </div>

                <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-3">
                        {job.description}
                    </p>
                </div>

                {unlocked ? (
                    <div className="mt-6 bg-green-50 p-4 rounded-md border border-green-200">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Contact Details Unlocked!</h4>
                        <div className="flex items-center">
                            {job.customer.image ? (
                                <img src={job.customer.image} alt="" className="h-10 w-10 rounded-full mr-3" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center mr-3 text-green-700 font-bold">
                                    {job.customer.name?.[0] || 'C'}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-900">{job.customer.name || 'Customer'}</p>
                                <p className="text-xs text-gray-500">You can now contact this customer.</p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push(`/dashboard/messages/${job.customer.id}`)}
                            >
                                Message Customer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-6">
                        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
                        <Button
                            onClick={handleUnlock}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Unlocking...' : 'Unlock Lead'}
                        </Button>
                        <p className="mt-2 text-xs text-center text-muted-foreground">
                            Unlocking this lead allows you to view contact details.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
