import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getConversations } from "@/actions/messages"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default async function CustomerDashboard() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/signin")
    }

    // Get conversations
    const conversations = await getConversations()

    return (
        <div className="min-h-screen bg-background">
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
                        {/* Quick Actions */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
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
                                <div>
                                    <p className="text-muted-foreground">Role</p>
                                    <p className="font-medium capitalize">{session.user.role || "Customer"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
