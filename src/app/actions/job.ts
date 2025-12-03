'use server'

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SUBSCRIPTION_TIERS } from "@/lib/pricing-config";
import { SubscriptionTier } from "@/types/monetization";

export type JobPostData = {
    title: string;
    description: string;
    street?: string;
    district?: string;
    city?: string;
    postcode?: string;
    category: string;
    budget?: number;
};

export async function createJobPost(data: JobPostData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        const jobPost = await db.jobPost.create({
            data: {
                ...data,
                customerId: session.user.id,
            },
        });
        revalidatePath("/dashboard");
        return { success: true, jobPost };
    } catch (error) {
        console.error("Failed to create job post:", error);
        return { error: "Failed to create job post" };
    }
}

export async function getCustomerJobPosts() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const jobPosts = await db.jobPost.findMany({
            where: { customerId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                leads: {
                    include: {
                        providerProfile: {
                            select: {
                                id: true,
                                providerType: true,
                                businessName: true,
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                },
                                userId: true,
                                // Include bookings for this provider and customer
                                providedBookings: {
                                    where: {
                                        customerId: session.user.id
                                    },
                                    orderBy: {
                                        createdAt: 'desc'
                                    },
                                    take: 1 // Get the most recent booking
                                }
                            }
                        }
                    }
                }
            }
        });
        return jobPosts;
    } catch (error) {
        console.error("Failed to fetch customer job posts:", error);
        return [];
    }
}

export async function getAllJobPosts(filter?: {
    category?: string,
    location?: string,
    showAllCategories?: boolean
}) {
    try {
        const where: any = { status: 'OPEN' };

        // Only apply category filter if showAllCategories is not true
        if (filter?.category && !filter?.showAllCategories) {
            where.category = filter.category;
        }

        // Improved location filtering - search across all location fields
        if (filter?.location) {
            const locationSearch = filter.location.toLowerCase().trim();
            where.OR = [
                { street: { contains: locationSearch } },
                { district: { contains: locationSearch } },
                { city: { contains: locationSearch } },
                { postcode: { contains: locationSearch } },
                // Also search old location field for backward compatibility
                { location: { contains: locationSearch } },
            ];
        }

        const jobPosts = await db.jobPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    select: { id: true, name: true, image: true }
                }
            }
        });
        return jobPosts;
    } catch (error) {
        console.error("Failed to fetch all job posts:", error);
        return [];
    }
}

export async function unlockLead(jobPostId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const providerProfile = await db.providerProfile.findUnique({
        where: { userId: session.user.id },
    });

    if (!providerProfile) {
        return { error: "Provider profile not found" };
    }

    // Check if already unlocked
    const existingLead = await db.lead.findUnique({
        where: {
            jobPostId_providerProfileId: {
                jobPostId,
                providerProfileId: providerProfile.id
            }
        }
    });

    if (existingLead) {
        return { success: true, lead: existingLead, message: "Already unlocked" };
    }

    // Check subscription limits
    const tierInfo = SUBSCRIPTION_TIERS[providerProfile.subscriptionTier as SubscriptionTier];

    if (tierInfo.leadLimit !== undefined) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const leadsThisMonth = await db.lead.count({
            where: {
                providerProfileId: providerProfile.id,
                unlockedAt: {
                    gte: startOfMonth
                }
            }
        });

        if (leadsThisMonth >= tierInfo.leadLimit) {
            return { error: `You have reached your limit of ${tierInfo.leadLimit} leads this month. Upgrade to Pro for unlimited leads.` };
        }
    }

    try {
        // Create lead
        const result = await db.lead.create({
            data: {
                jobPostId,
                providerProfileId: providerProfile.id,
                status: "UNLOCKED"
            }
        });

        revalidatePath("/leads");
        revalidatePath("/dashboard/provider");
        revalidatePath("/dashboard");
        return { success: true, lead: result };
    } catch (error) {
        console.error("Failed to unlock lead:", error);
        return { error: "Failed to unlock lead" };
    }
}
