import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                console.log("Authorize called with:", credentials?.email)
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials")
                    return null
                }

                const email = credentials.email as string
                const password = credentials.password as string

                const user = await db.user.findUnique({
                    where: {
                        email,
                    },
                })

                if (!user || !user.password) {
                    console.log("User not found or no password")
                    return null
                }

                const passwordsMatch = await bcrypt.compare(password, user.password)

                if (!passwordsMatch) {
                    console.log("Password mismatch")
                    return null
                }

                console.log("User authorized:", user.id)
                return user
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;

                // Fetch user role from database
                const user = await db.user.findUnique({
                    where: { id: token.sub },
                    select: { role: true }
                });

                if (user) {
                    session.user.role = user.role;
                }
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        },
    },
})

