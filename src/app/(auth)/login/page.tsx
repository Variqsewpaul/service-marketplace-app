"use client"

import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { authenticate } from "@/actions"
import { useActionState } from "react"

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Or{" "}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/90">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" action={dispatch}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-foreground bg-muted ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-1.5 text-foreground bg-muted ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="text-sm text-red-500 text-center font-medium">
                            {errorMessage}
                        </div>
                    )}

                    <div>
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Signing in..." : "Sign in"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
