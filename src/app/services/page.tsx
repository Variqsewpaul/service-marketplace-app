import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ProviderSearch } from "@/components/providers/ProviderSearch"

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ search?: string, category?: string }> }) {
    const { search, category } = await searchParams

    // Build where clause for filtering
    const whereClause: any = {
        role: "PROVIDER",
        providerProfile: {
            isNot: null
        }
    }

    // Add search filter
    if (search) {
        whereClause.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { providerProfile: { bio: { contains: search, mode: "insensitive" } } }
        ]
    }

    // Add category filter
    if (category && category !== "all") {
        whereClause.providerProfile = {
            ...whereClause.providerProfile,
            category
        }
    }

    const providers = await db.user.findMany({
        where: whereClause,
        include: {
            providerProfile: {
                select: {
                    bio: true,
                    category: true,
                    location: true,
                    hourlyRate: true,
                    profilePicture: true,
                    skills: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Find Service Providers</h1>
                    <p className="text-muted-foreground">
                        Browse and connect with trusted professionals in your area
                    </p>
                </div>

                <ProviderSearch />

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {providers.map((provider) => {
                        const profile = provider.providerProfile
                        if (!profile) return null

                        return (
                            <Link
                                key={provider.id}
                                href={`/providers/${provider.id}`}
                                className="group rounded-lg border bg-card hover:shadow-lg transition-all overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0 overflow-hidden">
                                            {profile.profilePicture ? (
                                                <img src={profile.profilePicture} alt={provider.name || "Provider"} className="w-full h-full object-cover" />
                                            ) : (
                                                provider.name?.charAt(0).toUpperCase() || "P"
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                                                {provider.name}
                                            </h3>
                                            {profile.category && (
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    {profile.category.replace("_", " ")}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {profile.bio && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {profile.bio}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                        {profile.location && (
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                📍 {profile.location}
                                            </span>
                                        )}
                                        {profile.hourlyRate && (
                                            <span className="font-semibold text-primary">
                                                R{profile.hourlyRate}/hr
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {providers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No providers found. Try adjusting your search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
