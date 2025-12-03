import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAllJobPosts } from "@/app/actions/job";
import LeadsPageClient from "@/components/leads/LeadsPageClient";

export default async function LeadsPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== "PROVIDER") {
        redirect("/dashboard");
    }

    const providerProfile = await db.providerProfile.findUnique({
        where: { userId: session.user.id },
        include: { unlockedLeads: true }
    });

    if (!providerProfile) {
        redirect("/onboarding");
    }

    // Fetch initial job posts filtered by provider's category
    const initialJobPosts = await getAllJobPosts({
        category: providerProfile.category || undefined,
        showAllCategories: !providerProfile.category, // Show all if no category set
    });

    return (
        <LeadsPageClient
            initialJobPosts={initialJobPosts}
            providerProfile={providerProfile}
        />
    );
}
