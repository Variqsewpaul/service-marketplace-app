"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"

export function ProviderSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [search, setSearch] = useState(searchParams.get("search") || "")
    const [category, setCategory] = useState(searchParams.get("category") || "all")

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (category && category !== "all") params.set("category", category)
        router.push(`/services?${params.toString()}`)
    }

    const handleReset = () => {
        setSearch("")
        setCategory("all")
        router.push("/services")
    }

    return (
        <div className="bg-muted/30 p-6 rounded-lg space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_200px_auto]">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or keywords..."
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="all">All Categories</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="moving">Moving</option>
                    <option value="security">Security</option>
                    <option value="painting">Painting</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="pest_control">Pest Control</option>
                    <option value="appliance_repair">Appliance Repair</option>
                    <option value="tutoring">Tutoring</option>
                    <option value="personal_training">Personal Training</option>
                    <option value="event_planning">Event Planning</option>
                    <option value="photography">Photography</option>
                    <option value="web_development">Web Development</option>
                </select>

                <div className="flex gap-2">
                    <Button onClick={handleSearch}>Search</Button>
                    <Button variant="outline" onClick={handleReset}>Reset</Button>
                </div>
            </div>
        </div>
    )
}
