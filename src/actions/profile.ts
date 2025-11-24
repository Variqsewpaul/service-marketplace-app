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
    const skills = formData.get("skills") as string
    const contactEmail = formData.get("contactEmail") as string
    const contactPhone = formData.get("contactPhone") as string
    const location = formData.get("location") as string
    const profilePicture = formData.get("profilePicture") as string

    await db.providerProfile.update({
        where: { userId: session.user.id },
        data: {
            bio,
            hourlyRate,
            category,
            skills,
            contactEmail,
            contactPhone,
            location,
            profilePicture,
        },
    })

    revalidatePath("/profile")
    return { message: "Profile updated successfully" }
}

export async function addPortfolioItem(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const imageUrl = formData.get("imageUrl") as string

    const profile = await db.providerProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) throw new Error("Profile not found")

    await db.portfolioItem.create({
        data: {
            title,
            description,
            imageUrl,
            providerProfileId: profile.id,
        },
    })

    revalidatePath("/profile")
    return { message: "Portfolio item added" }
}

export async function deletePortfolioItem(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const itemId = formData.get("itemId") as string

    // Verify ownership
    const item = await db.portfolioItem.findUnique({
        where: { id: itemId },
        include: { providerProfile: true }
    })

    if (!item || item.providerProfile.userId !== session.user.id) {
        throw new Error("Unauthorized")
    }

    await db.portfolioItem.delete({ where: { id: itemId } })
    revalidatePath("/profile")
}
