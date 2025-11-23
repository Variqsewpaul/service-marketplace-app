import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { RoleSelection } from "@/components/profile/RoleSelection"
import { db } from "@/lib/db"

export default async function OnboardingPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Check if user already has a role
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    })

    // If user already has a role (and it's not the default if we set one, but we didn't set a default in schema other than CUSTOMER maybe? Let's check schema)
    // Schema says @default("CUSTOMER"). Wait, if it defaults to CUSTOMER, then everyone is a customer.
    // I should probably change the default or check if they have a profile created.
    // In the action I create a profile. So checking for profile existence is better.

    const customerProfile = await db.customerProfile.findUnique({ where: { userId: session.user.id } })
    const providerProfile = await db.providerProfile.findUnique({ where: { userId: session.user.id } })

    if (customerProfile || providerProfile) {
        redirect("/profile")
    }

    return (
        <div className="container-custom py-12 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                    Welcome to ServiceMarket!
                </h1>
                <p className="text-lg text-muted-foreground">
                    To get started, please tell us how you plan to use the platform.
                </p>
            </div>

            <RoleSelection />
        </div>
    )
}
