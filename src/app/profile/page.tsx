import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ProviderProfileForm } from "@/components/profile/ProviderProfileForm"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            customerProfile: true,
            providerProfile: true,
        },
    })

    if (!user) {
        redirect("/login")
    }

    if (!user.role || user.role === "CUSTOMER" && !user.customerProfile && !user.providerProfile) {
        // If no role or profile, redirect to onboarding. 
        // Note: schema default is CUSTOMER, so we check for profile existence too.
        // But wait, if they are CUSTOMER by default but haven't gone through onboarding, 
        // they might not have a customerProfile entry if we only create it in updateRole.
        // So checking for profile existence is key.
        redirect("/onboarding")
    }

    return (
        <div className="container-custom py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and profile information.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                    <a href="#" className="text-primary font-semibold">
                        General
                    </a>
                    <a href="#" className="hover:text-foreground transition-colors">
                        Security
                    </a>
                    {user.role === "PROVIDER" && (
                        <a href="#" className="hover:text-foreground transition-colors">
                            Services
                        </a>
                    )}
                </nav>

                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <div className="mt-1 p-2 bg-muted rounded-md">{user.name}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <div className="mt-1 p-2 bg-muted rounded-md">{user.email}</div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Role</label>
                                <div className="mt-1 p-2 bg-muted rounded-md">{user.role}</div>
                            </div>
                        </div>
                    </div>

                    {user.role === "PROVIDER" && user.providerProfile && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">Provider Details</h2>
                            <ProviderProfileForm initialData={user.providerProfile} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
