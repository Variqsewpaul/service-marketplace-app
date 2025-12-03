import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getConversations } from "@/actions/messages"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { prisma } from "@/lib/prisma"
import PayoutOnboardingModal from "@/components/payouts/PayoutOnboardingModal"
import { getSubaccountStatus } from "@/actions/paystack-subaccounts"

// Helper function to calculate dynamic job status
function getJobDisplayStatus(job: any) {
    // Check terminal states first
    if (job.status === 'CANCELLED') {
        return { text: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: '❌' }
    }
    if (job.status === 'COMPLETED') {
        return { text: 'Completed', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: '✅' }
    }
    if (job.status === 'IN_PROGRESS') {
        return { text: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔨' }
    }

    // Check for interested providers
    const interestedCount = job.leads?.length || 0
    if (interestedCount > 0) {
        return {
            text: `${interestedCount} Provider${interestedCount > 1 ? 's' : ''} Interested`,
            color: 'bg-green-50 text-green-700 border-green-200',
            icon: '👥'
        }
    }

    // Default: awaiting interest
    return { text: 'Awaiting Interest', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '⏳' }
}

export default async function CustomerDashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin")
    }

    // Get conversations
    const conversations = await getConversations()

    // Check if user is a provider
    const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId: session.user.id },
    })
    const isProvider = !!providerProfile

    // Get job posts
    const { getCustomerJobPosts } = await import("@/app/actions/job")
    const jobPosts = await getCustomerJobPosts()

    // Get payout account status if provider
    let accountStatus = null;
    if (isProvider) {
        accountStatus = await getSubaccountStatus();
    }

    return (
        <div className="min-h-screen bg-background">
            {isProvider && accountStatus && !('error' in accountStatus) && (
                <PayoutOnboardingModal accountStatus={accountStatus as any} />
            )}

            <div className="container-custom py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">My Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {session.user.name || session.user.email}
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Job Posts Section (Customer Only) */}
                        {!isProvider && (
                            <div className="rounded-lg border bg-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-semibold">My Job Posts</h2>
                                    <Link href="/post-job">
                                        <Button>+ Post a Job</Button>
                                    </Link>
                                </div>

                                {jobPosts.length > 0 ? (
                                    <div className="space-y-4">
                                        {jobPosts.map((job) => {
                                            const displayStatus = getJobDisplayStatus(job)
                                            return (
                                                <div key={job.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{job.title}</h3>
                                                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${displayStatus.color}`}>
                                                                {displayStatus.icon}
                                                                {displayStatus.text}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(job.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>

                                                    {/* Providers Section */}
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                                            Responses ({job.leads.length})
                                                        </p>
                                                        {job.leads.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {job.leads.map((lead) => {
                                                                    const booking = lead.providerProfile.providedBookings?.[0];
                                                                    const hasQuote = booking && booking.servicePrice > 0;
                                                                    const isConfirmed = booking?.status === 'CONFIRMED' || booking?.status === 'IN_PROGRESS' || booking?.status === 'COMPLETED';
                                                                    const providerName = lead.providerProfile.providerType === 'BUSINESS' && lead.providerProfile.businessName
                                                                        ? lead.providerProfile.businessName
                                                                        : (lead.providerProfile.user.name || "Provider");

                                                                    return (
                                                                        <div key={lead.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                                            <div className="flex items-start justify-between mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Link
                                                                                        href={`/providers/${lead.providerProfile.userId}`}
                                                                                        className="font-medium text-gray-900 hover:text-primary"
                                                                                    >
                                                                                        {providerName}
                                                                                    </Link>
                                                                                    {hasQuote && (
                                                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                                                            Quote: R {booking.servicePrice.toFixed(2)}
                                                                                        </span>
                                                                                    )}
                                                                                    {isConfirmed && (
                                                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                                                                                                booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                                                                                    'bg-green-100 text-green-700'
                                                                                            }`}>
                                                                                            {booking.status === 'COMPLETED' ? '✓ Completed' :
                                                                                                booking.status === 'IN_PROGRESS' ? '🔨 In Progress' :
                                                                                                    '✅ Confirmed'}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Quote Details */}
                                                                            {hasQuote && !isConfirmed && (
                                                                                <div className="mb-2 text-sm text-gray-600">
                                                                                    <p>Total: R {booking.totalAmount.toFixed(2)} (Deposit: R {booking.depositAmount.toFixed(2)})</p>
                                                                                </div>
                                                                            )}

                                                                            {/* Booking Progress */}
                                                                            {isConfirmed && booking && (
                                                                                <div className="mb-3">
                                                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                                        <span className={booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED' ? 'text-green-600 font-medium' : ''}>
                                                                                            ✓ Deposit Paid
                                                                                        </span>
                                                                                        <span className="text-gray-400">→</span>
                                                                                        <span className={booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED' ? 'text-purple-600 font-medium' : ''}>
                                                                                            {booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED' ? '✓' : '○'} Job Started
                                                                                        </span>
                                                                                        <span className="text-gray-400">→</span>
                                                                                        <span className={booking.status === 'COMPLETED' ? 'text-gray-600 font-medium' : ''}>
                                                                                            {booking.status === 'COMPLETED' ? '✓' : '○'} Completed
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Action Buttons */}
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <Link href={`/dashboard/messages/${lead.providerProfile.userId}`}>
                                                                                    <Button variant="outline" size="sm" className="text-xs">
                                                                                        💬 Message
                                                                                    </Button>
                                                                                </Link>

                                                                                {hasQuote && !isConfirmed && (
                                                                                    <Link href={`/dashboard/bookings/${booking.id}`}>
                                                                                        <Button variant="default" size="sm" className="text-xs bg-blue-600 hover:bg-blue-700">
                                                                                            💰 Accept Quote
                                                                                        </Button>
                                                                                    </Link>
                                                                                )}

                                                                                {isConfirmed && booking && (
                                                                                    <Link href={`/dashboard/bookings/${booking.id}`}>
                                                                                        <Button variant="outline" size="sm" className="text-xs">
                                                                                            📋 View Booking
                                                                                        </Button>
                                                                                    </Link>
                                                                                )}

                                                                                {!hasQuote && !isConfirmed && (
                                                                                    <span className="text-xs text-gray-500 italic py-1">
                                                                                        Awaiting quote...
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">No providers have contacted yet.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-2xl">📝</span>
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                            Create your first job post to start receiving quotes from qualified professionals.
                                        </p>
                                        <Link href="/post-job">
                                            <Button size="lg" className="px-8">
                                                Post a Job Now
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Messages Section */}
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-semibold">Messages</h2>
                                {conversations.length > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {conversations.length > 0 ? (
                                <div className="space-y-3">
                                    {conversations.map((conv: any) => (
                                        <Link
                                            key={conv.partner.id}
                                            href={`/dashboard/messages/${conv.partner.id}`}
                                            className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">
                                                            {conv.partner.name || conv.partner.email}
                                                        </h3>
                                                        {conv.unreadCount > 0 && (
                                                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                                                {conv.unreadCount} new
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conv.messages[0] && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {conv.messages[0].content}
                                                        </p>
                                                    )}
                                                </div>
                                                {conv.messages[0] && (
                                                    <span className="text-xs text-muted-foreground ml-4">
                                                        {new Date(conv.messages[0].createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-4">No messages yet</p>
                                    <Link href="/services">
                                        <Button>Browse Service Providers</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Recent Providers */}
                        {conversations.length > 0 && (
                            <div className="rounded-lg border bg-card p-6">
                                <h2 className="text-2xl font-semibold mb-4">Recent Providers</h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {conversations.slice(0, 4).map((conv: any) => (
                                        <Link
                                            key={conv.partner.id}
                                            href={`/providers/${conv.partner.id}`}
                                            className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <p className="font-medium">{conv.partner.name || conv.partner.email}</p>
                                            <p className="text-sm text-muted-foreground">View Profile →</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Provider Tools */}
                        {isProvider && (
                            <div className="rounded-lg border bg-card p-6 border-blue-200 bg-blue-50/50">
                                <h3 className="font-semibold mb-4 text-blue-900">Provider Tools</h3>
                                <div className="space-y-3">
                                    <Link href="/leads" className="block">
                                        <Button variant="default" className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                                            🔍 Find Leads
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/bookings" className="block">
                                        <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 text-gray-900">
                                            📅 My Bookings
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/earnings" className="block">
                                        <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 text-gray-900">
                                            💰 Earnings
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/subscription" className="block">
                                        <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 text-gray-900">
                                            ⭐ Subscription
                                        </Button>
                                    </Link>
                                    <Link href="/settings/payout-account" className="block">
                                        <Button variant="outline" className="w-full justify-start bg-white hover:bg-blue-50 text-gray-900">
                                            🏦 Payout Settings
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                {!isProvider && (
                                    <>
                                        <Link href="/post-job" className="block">
                                            <Button variant="default" className="w-full justify-start">
                                                📝 Post a Job
                                            </Button>
                                        </Link>
                                        <Link href="/dashboard/bookings" className="block">
                                            <Button variant="outline" className="w-full justify-start">
                                                📅 My Bookings
                                            </Button>
                                        </Link>
                                        <Link href="/profile?tab=payments" className="block">
                                            <Button variant="outline" className="w-full justify-start">
                                                💳 Billing & Payments
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                <Link href="/services" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        🔍 Browse Services
                                    </Button>
                                </Link>
                                <Link href="/profile" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        👤 Edit Profile
                                    </Button>
                                </Link>
                                {!isProvider && (
                                    <Link href="/become-a-provider" className="block">
                                        <Button variant="outline" className="w-full justify-start">
                                            🚀 Become a Provider
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Account</h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Name</p>
                                    <p className="font-medium">{session.user.name || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="font-medium">{session.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
