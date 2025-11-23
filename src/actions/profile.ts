"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateRole(role: "CUSTOMER" | "PROVIDER") {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    await db.user.update({
        where: { id: session.user.id },
        data: { role },
    })

    // Create empty profile based on role
    if (role === "CUSTOMER") {
        await db.customerProfile.create({
            data: { userId: session.user.id },
        })
    } else {
        await db.providerProfile.create({
            data: { userId: session.user.id },
        })
    }

    redirect("/profile")
}

export async function updateProviderProfile(prevState: any, formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const bio = formData.get("bio") as string
    const hourlyRate = parseFloat(formData.get("hourlyRate") as string)
    const category = formData.get("category") as string

    await db.providerProfile.update({
        where: { userId: session.user.id },
        data: {
            bio,
            hourlyRate,
            category,
        },
    })

    revalidatePath("/profile")
    redirect("/profile")
}
