import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ContactButton } from "@/components/messages/ContactButton"
import ServiceList from "@/components/providers/ServiceList"
import { shouldRevealContact, maskContactInfo } from "@/lib/contact-reveal"
import { BookingStatus, SubscriptionTier } from "@/types/monetization"
import { SUBSCRIPTION_TIERS } from "@/lib/pricing-config"
import BookingButton from "@/components/booking/BookingButton"

export default async function ProviderPublicPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    const provider = await db.user.findUnique({
        where: { id, role: "PROVIDER" },
        include: {
            providerProfile: {
                include: {
                    portfolioItems: {
                        orderBy: { createdAt: "desc" as const }
                    },
                    serviceOfferings: {
                        orderBy: { createdAt: "desc" as const }
                    }
                }
            }
        }
    })

    if (!provider || !provider.providerProfile) {
        notFound()
    }

    const profile = provider.providerProfile
    const skills = profile.skills?.split(",").map((s: string) => s.trim()).filter(Boolean) || []

    // Check if contact should be revealed
    let hasConfirmedBooking = false
    if (session?.user?.id && session.user.id !== provider.id) {
        const confirmedBooking = await prisma.booking.findFirst({
            where: {
                customerId: session.user.id,
                providerId: profile.id,
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED] },
            },
        })
        hasConfirmedBooking = !!confirmedBooking
    }

    const revealContact = shouldRevealContact(
        session?.user?.id || '',
        provider.id,
        hasConfirmedBooking,
        profile.autoRevealContact
    )

    // Mask contact info if not revealed
    const displayProfile = revealContact ? profile : maskContactInfo(profile)

    // Determine display name and image
    const isBusiness = (profile as any).providerType === "BUSINESS"
    const displayName = isBusiness ? (profile as any).businessName || provider.name : provider.name
    const displayImage = isBusiness ? ((profile as any).businessLogo || profile.profilePicture) : profile.profilePicture
    const displayBio = isBusiness ? ((profile as any).businessDescription || profile.bio) : profile.bio

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b">
                <div className="container-custom py-16">
                    {session?.user?.id === provider.id && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3 text-yellow-800">
                            <span className="text-xl">👁️</span>
                            <div>
                                <p className="font-semibold">You are viewing your own public profile</p>
                                <p className="text-sm">Contact details and hidden information are visible to you. Customers will not see this until they pay a deposit.</p>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-lg bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary border-4 border-background shadow-lg overflow-hidden">
                            {displayImage ? (
                                <img src={displayImage} alt={displayName || "Provider"} className="w-full h-full object-contain bg-white" />
                            ) : (
                                displayName?.charAt(0).toUpperCase() || "P"
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold tracking-tight">{displayName}</h1>
                                {isBusiness && (
                                    <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                                        BUSINESS
                                    </span>
                                )}
                                {profile.subscriptionTier === SubscriptionTier.PRO && (
                                    <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                                        ⭐ PRO
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 mb-4">
                                {profile.category && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                                        {profile.category.replace("_", " ").toUpperCase()}
                                    </span>
                                )}
                                {profile.location && (
                                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                        📍 {profile.location}
                                    </span>
                                )}
                                {isBusiness && (profile as any).yearsInBusiness && (
                                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                        📅 {(profile as any).yearsInBusiness} Years in Business
                                    </span>
                                )}
                            </div>
                            {displayBio && (
                                <p className="text-lg text-muted-foreground max-w-2xl">{displayBio}</p>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col gap-3">

                            <ContactButton providerId={provider.id} providerName={displayName || "Provider"} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-12">
                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                    {/* Left Column - Portfolio & Skills */}
                    <div className="space-y-8">
                        {/* Business Details Section */}
                        {isBusiness && (
                            <div className="rounded-lg border bg-card p-6">
                                <h2 className="text-xl font-bold mb-4">Business Details</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {(profile as any).businessAddress && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Address</div>
                                            <div>{(profile as any).businessAddress}</div>
                                        </div>
                                    )}
                                    {(profile as any).numberOfEmployees && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Team Size</div>
                                            <div>{(profile as any).numberOfEmployees} Employees</div>
                                        </div>
                                    )}
                                    {(profile as any).businessRegNumber && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Registration Number</div>
                                            <div className="font-mono text-sm">{(profile as any).businessRegNumber}</div>
                                        </div>
                                    )}
                                    {(profile as any).taxNumber && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Tax/VAT Number</div>
                                            <div className="font-mono text-sm">{(profile as any).taxNumber}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Service Offerings */}
                        <ServiceList services={(profile as any).serviceOfferings || []} />

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Skills & Expertise</h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill: string, idx: number) => (
                                        <span key={idx} className="px-3 py-1 rounded-md bg-muted text-sm font-medium">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Portfolio */}
                        {profile.portfolioItems && profile.portfolioItems.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {profile.portfolioItems.map((item: any) => (
                                        <div key={item.id} className="rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                                            {item.imageUrl && (
                                                <div className="aspect-video bg-muted relative overflow-hidden">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!profile.portfolioItems || profile.portfolioItems.length === 0) && skills.length === 0 && !isBusiness && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>This provider hasn't added any portfolio items yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Contact Info */}
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-card p-6 sticky top-6">
                            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>

                            {!revealContact && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
                                    🔒 Contact details will be revealed after you confirm a booking
                                </div>
                            )}

                            <div className="space-y-4">
                                {displayProfile.contactEmail && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                                        {revealContact ? (
                                            <a href={`mailto:${displayProfile.contactEmail}`} className="text-primary hover:underline break-all">
                                                {displayProfile.contactEmail}
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">{displayProfile.contactEmail}</span>
                                        )}
                                    </div>
                                )}
                                {displayProfile.contactPhone && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Phone</div>
                                        {revealContact ? (
                                            <a href={`tel:${displayProfile.contactPhone}`} className="text-primary hover:underline">
                                                {displayProfile.contactPhone}
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">{displayProfile.contactPhone}</span>
                                        )}
                                    </div>
                                )}
                                {profile.location && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Service Area</div>
                                        <p>{profile.location}</p>
                                    </div>
                                )}
                                {profile.hourlyRate && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Hourly Rate</div>
                                        <p className="text-lg font-bold text-primary">R{profile.hourlyRate}/hr</p>
                                    </div>
                                )}
                            </div>

                            <BookingButton
                                providerId={profile.id}
                                providerName={displayName || 'Provider'}
                                providerTier={profile.subscriptionTier as SubscriptionTier}
                                defaultServicePrice={profile.hourlyRate || undefined}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
