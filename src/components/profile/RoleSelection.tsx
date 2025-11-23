"use client"

import { Button } from "@/components/ui/Button"
import { updateRole } from "@/actions/profile"
import { useTransition } from "react"

export function RoleSelection() {
    const [isPending, startTransition] = useTransition()

    const handleSelectRole = (role: "CUSTOMER" | "PROVIDER") => {
        startTransition(async () => {
            await updateRole(role)
        })
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center text-center space-y-4 hover:border-primary transition-colors cursor-pointer" onClick={() => handleSelectRole("CUSTOMER")}>
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <h3 className="text-xl font-bold">I want to Hire</h3>
                <p className="text-muted-foreground">
                    Find the best service providers for your needs.
                </p>
                <Button className="w-full" variant="outline" disabled={isPending}>
                    Select Customer
                </Button>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center text-center space-y-4 hover:border-primary transition-colors cursor-pointer" onClick={() => handleSelectRole("PROVIDER")}>
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                </div>
                <h3 className="text-xl font-bold">I want to Work</h3>
                <p className="text-muted-foreground">
                    Offer your services and grow your business.
                </p>
                <Button className="w-full" variant="outline" disabled={isPending}>
                    Select Provider
                </Button>
            </div>
        </div>
    )
}
