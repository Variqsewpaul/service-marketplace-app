"use client"

import { Button } from "@/components/ui/Button"
import { updateProviderProfile } from "@/actions/profile"
import { useActionState } from "react"

export function ProviderProfileForm({ initialData }: { initialData: any }) {
    const [state, dispatch, isPending] = useActionState(updateProviderProfile, undefined)

    return (
        <form action={dispatch} className="space-y-6 max-w-xl">
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                    Bio
                </label>
                <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    defaultValue={initialData?.bio || ""}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Tell us about yourself and your services..."
                />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground">
                    Category
                </label>
                <select
                    id="category"
                    name="category"
                    defaultValue={initialData?.category || ""}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <option value="">Select a category</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="moving">Moving</option>
                </select>
            </div>

            <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-foreground">
                    Hourly Rate ($)
                </label>
                <input
                    type="number"
                    id="hourlyRate"
                    name="hourlyRate"
                    min="0"
                    step="0.01"
                    defaultValue={initialData?.hourlyRate || ""}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
            </div>

            <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Profile"}
            </Button>
        </form>
    )
}
