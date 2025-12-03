'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobPost } from '@/app/actions/job';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import LocationInput from '@/components/forms/LocationInput';

function InfoIcon({ tooltip }: { tooltip: string }) {
    return (
        <div className="group relative flex items-center ml-2 cursor-help">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-primary transition-colors">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
            </svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-muted border border-border text-foreground text-xs rounded shadow-lg z-10 text-center">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-muted"></div>
            </div>
        </div>
    );
}

export default function PostJobPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            street: formData.get('street') as string || undefined,
            district: formData.get('district') as string || undefined,
            city: formData.get('city') as string || undefined,
            postcode: formData.get('postcode') as string || undefined,
            budget: formData.get('budget') ? parseFloat(formData.get('budget') as string) : undefined,
        };

        const result = await createJobPost(data);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push('/dashboard');
        }
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-card shadow-xl rounded-2xl overflow-hidden border">
                    <div className="bg-gradient-to-r from-primary to-secondary px-6 py-8 text-center">
                        <h1 className="text-3xl font-bold text-white">Post a New Job</h1>
                        <p className="mt-2 text-white/90">
                            Tell us what you need, and we'll connect you with the best professionals.
                        </p>
                    </div>

                    <div className="px-6 py-8 sm:p-10">
                        {error && (
                            <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form action={handleSubmit} className="space-y-8">
                            <div>
                                <label htmlFor="title" className="flex items-center text-sm font-semibold text-foreground mb-2">
                                    Job Title
                                    <InfoIcon tooltip="Give your job a short, descriptive title. E.g., 'Fix Leaking Kitchen Tap'" />
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    required
                                    className="block w-full rounded-lg bg-background border border-border text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                                    placeholder="e.g. Fix leaking tap"
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="flex items-center text-sm font-semibold text-foreground mb-2">
                                    Category
                                    <InfoIcon tooltip="Select the category that best fits your job to help the right pros find it." />
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    className="block w-full rounded-lg bg-background border border-border text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                                >
                                    <option value="">Select a category</option>
                                    {SERVICE_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="description" className="flex items-center text-sm font-semibold text-foreground mb-2">
                                    Description
                                    <InfoIcon tooltip="Provide details about the job. Include specific requirements, dimensions, or any other relevant info." />
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    required
                                    className="block w-full rounded-lg bg-background border border-border text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                                    placeholder="Describe what you need done in detail..."
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-semibold text-foreground mb-2">
                                    Location
                                    <InfoIcon tooltip="Provide the location details where the job needs to be done." />
                                </label>
                                <div className="space-y-4">
                                    <LocationInput required />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="budget" className="flex items-center text-sm font-semibold text-foreground mb-2">
                                    Budget (Optional)
                                    <InfoIcon tooltip="What is your estimated budget for this job? This helps pros know if they are a good match." />
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-muted-foreground sm:text-sm">R</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="budget"
                                        id="budget"
                                        className="block w-full rounded-lg bg-background border border-border text-foreground pl-7 pr-12 focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 border border-border rounded-lg shadow-sm text-sm font-medium text-foreground bg-muted hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-3 border border-transparent shadow-lg text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all transform hover:scale-105"
                                >
                                    {isLoading ? 'Posting...' : 'Post Job Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
