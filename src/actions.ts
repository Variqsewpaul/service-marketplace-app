"use server"



import { signIn } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

export async function authenticate(prevState: any, formData: FormData) {
    try {
        console.log("Attempting sign in...")
        formData.set("redirectTo", "/")
        await signIn("credentials", formData)
        console.log("Sign in successful (should have redirected)")
    } catch (error) {
        if ((error as Error).message.includes("NEXT_REDIRECT")) {
            throw error;
        }
        console.log("Sign in error:", error)
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }
}

export async function register(prevState: any, formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
        return "Missing fields"
    }

    const existingUser = await db.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return "User already exists"
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    })

    // Attempt to sign in after registration
    try {
        formData.set("redirectTo", "/onboarding")
        await signIn("credentials", formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }
}
