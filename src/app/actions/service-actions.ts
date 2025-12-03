'use server'

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type ServiceOfferingData = {
    title: string;
    description?: string;
    price?: number;
    pricingModel: "FIXED" | "HOURLY" | "QUOTE_BASED";
    unit?: string;
};

export async function createServiceOffering(data: ServiceOfferingData) {
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

    try {
        await db.serviceOffering.create({
            data: {
                ...data,
                providerProfileId: providerProfile.id,
            },
        });
        revalidatePath("/dashboard/profile");
        revalidatePath(`/providers/${providerProfile.id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to create service offering:", error);
        return { error: "Failed to create service offering" };
    }
}

export async function updateServiceOffering(id: string, data: ServiceOfferingData) {
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

    // Verify ownership
    const service = await db.serviceOffering.findUnique({
        where: { id },
    });

    if (!service || service.providerProfileId !== providerProfile.id) {
        return { error: "Unauthorized or service not found" };
    }

    try {
        await db.serviceOffering.update({
            where: { id },
            data,
        });
        revalidatePath("/dashboard/profile");
        revalidatePath(`/providers/${providerProfile.id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update service offering:", error);
        return { error: "Failed to update service offering" };
    }
}

export async function deleteServiceOffering(id: string) {
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

    // Verify ownership
    const service = await db.serviceOffering.findUnique({
        where: { id },
    });

    if (!service || service.providerProfileId !== providerProfile.id) {
        return { error: "Unauthorized or service not found" };
    }

    try {
        await db.serviceOffering.delete({
            where: { id },
        });
        revalidatePath("/dashboard/profile");
        revalidatePath(`/providers/${providerProfile.id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete service offering:", error);
        return { error: "Failed to delete service offering" };
    }
}

export async function getProviderServices(providerId: string) {
    try {
        const services = await db.serviceOffering.findMany({
            where: { providerProfileId: providerId },
            orderBy: { createdAt: 'desc' },
        });
        return services;
    } catch (error) {
        console.error("Failed to fetch services:", error);
        return [];
    }
}
