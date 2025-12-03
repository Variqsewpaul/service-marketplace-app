'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAllJobPosts } from '@/app/actions/job';
import LeadCard from '@/components/leads/LeadCard';
import LeadFilters from '@/components/leads/LeadFilters';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';


type JobPost = {
    id: string;
    title: string;
    description: string;
    location: string | null;
    street?: string | null;
    district?: string | null;
    city?: string | null;
    postcode?: string | null;
    category: string;
    budget: number | null;
    createdAt: Date;
    customer: {
        id: string;
        name: string | null;
        image: string | null;
    };
};

type Lead = {
    id: string;
    jobPostId: string;
    providerProfileId: string;
    status: string;
    unlockedAt: Date;
};

type ProviderProfile = {
    id: string;
    userId: string;
    category: string | null;
    subscriptionTier: string;
    unlockedLeads: Lead[];
};

type LeadsPageClientProps = {
    initialJobPosts: JobPost[];
    providerProfile: ProviderProfile;
};

export default function LeadsPageClient({ initialJobPosts, providerProfile }: LeadsPageClientProps) {
    const router = useRouter();
    const [jobPosts, setJobPosts] = useState<JobPost[]>(initialJobPosts);
    const [isLoading, setIsLoading] = useState(false);

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState(providerProfile.category || 'Plumbing');
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [location, setLocation] = useState('');

    // Create a set of unlocked job IDs for efficient lookup
    const unlockedJobIds = new Set(providerProfile.unlockedLeads.map(lead => lead.jobPostId));

    // Fetch jobs when filters change
    useEffect(() => {
        async function fetchJobs() {
            setIsLoading(true);
            const trimmedLocation = location.trim();

            const jobs = await getAllJobPosts({
                category: selectedCategory,
                location: trimmedLocation || undefined,
                showAllCategories,
            });

            setJobPosts(jobs as JobPost[]);
            setIsLoading(false);
        }
        fetchJobs();
    }, [selectedCategory, showAllCategories, location]);

    function handleClearFilters() {
        setSelectedCategory(providerProfile.category || 'Plumbing');
        setShowAllCategories(false);
        setLocation('');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Available Leads</h1>
                        <p className="mt-2 text-gray-600">
                            Browse and unlock leads to grow your business.
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <p className="text-sm text-gray-500">Your Subscription</p>
                        <p className="text-2xl font-bold text-primary">{providerProfile.subscriptionTier}</p>
                        <Link href="/dashboard/subscription">
                            <Button variant="outline" size="sm" className="mt-2 w-full">
                                Manage Plan
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <LeadFilters
                    selectedCategory={selectedCategory}
                    showAllCategories={showAllCategories}
                    location={location}
                    onCategoryChange={setSelectedCategory}
                    onShowAllCategoriesChange={setShowAllCategories}
                    onLocationChange={setLocation}
                    onClearFilters={handleClearFilters}
                    providerCategory={providerProfile.category || undefined}
                />

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-2 text-gray-600">Loading leads...</p>
                    </div>
                )}

                {/* Job Posts */}
                {!isLoading && jobPosts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobPosts.map((job) => (
                            <LeadCard
                                key={job.id}
                                job={job}
                                isUnlocked={unlockedJobIds.has(job.id)}
                            />
                        ))}
                    </div>
                ) : !isLoading ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-dashed shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads available</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            {showAllCategories
                                ? "No leads available in any category right now. Check back soon!"
                                : `No leads available in ${selectedCategory} right now. Try enabling "Show All Categories" to see more opportunities.`
                            }
                        </p>
                        {!showAllCategories && (
                            <Button
                                variant="outline"
                                onClick={() => setShowAllCategories(true)}
                            >
                                Show All Categories
                            </Button>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
