import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ProviderProfileForm } from "@/components/profile/ProviderProfileForm"
import ServiceManager from "@/components/dashboard/ServiceManager"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { getConversations } from "@/actions/messages"
import PayoutAccountClient from "@/components/payment/PayoutAccountClient"
import { getSubaccountStatus } from "@/actions/paystack-subaccounts"
import CustomerPaymentHistory from "@/components/payment/CustomerPaymentHistory"

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const session = await auth()
    const { tab = "general" } = await searchParams

    if (!session?.user) {
        redirect("/login")
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: {
            customerProfile: true,
            providerProfile: {
                include: {
                    portfolioItems: true,
                    serviceOfferings: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            },
        },
    })

    if (!user) {
        redirect("/login")
    }

    if (!user.role || user.role === "CUSTOMER" && !user.customerProfile && !user.providerProfile) {
        redirect("/onboarding")
    }

    // Get payout account status if provider
    let accountStatus = null;
    if (user.role === "PROVIDER") {
        accountStatus = await getSubaccountStatus();
    }

    // Get customer transactions if customer
    let customerTransactions: any[] = [];
    if (user.role === "CUSTOMER") {
        customerTransactions = await db.transaction.findMany({
            where: { customerId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                booking: {
                    select: {
                        id: true,
                        serviceTitle: true,
                        providerProfile: {
                            select: {
                                businessName: true,
                                user: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    return (
        <div className="container-custom py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and profile information.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[250px_1fr]">
                <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
                    <Link
                        href="/profile?tab=general"
                        className={`transition-colors ${tab === "general" ? "text-primary font-semibold" : "hover:text-foreground"}`}
                    >
                        General
                    </Link>
                    <Link
                        href="/profile?tab=security"
                        className={`transition-colors ${tab === "security" ? "text-primary font-semibold" : "hover:text-foreground"}`}
                    >
                        Security
                    </Link>
                    {user.role === "PROVIDER" && (
                        <>
                            <Link
                                href="/profile?tab=services"
                                className={`transition-colors ${tab === "services" ? "text-primary font-semibold" : "hover:text-foreground"}`}
                            >
                                Services
                            </Link>
                            <Link
                                href="/profile?tab=messages"
                                className={`transition-colors ${tab === "messages" ? "text-primary font-semibold" : "hover:text-foreground"}`}
                            >
                                Messages
                            </Link>
                            <Link
                                href="/profile?tab=payouts"
                                className={`transition-colors ${tab === "payouts" ? "text-primary font-semibold" : "hover:text-foreground"}`}
                            >
                                Payouts
                            </Link>
                        </>
                    )}
                    {user.role === "CUSTOMER" && (
                        <Link
                            href="/profile?tab=payments"
                            className={`transition-colors ${tab === "payments" ? "text-primary font-semibold" : "hover:text-foreground"}`}
                        >
                            Payments
                        </Link>
                    )}
                </nav>

                <div className="space-y-6">
                    {tab === "general" && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <div className="mt-1 p-2 bg-muted rounded-md">{user.name}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <div className="mt-1 p-2 bg-muted rounded-md">{user.email}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <div className="mt-1 p-2 bg-muted rounded-md">{user.role}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === "security" && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                            <p className="text-muted-foreground mb-4">Manage your password and linked accounts.</p>

                            <div className="space-y-4">
                                <div className="p-4 border rounded-md">
                                    <h3 className="font-medium mb-2">Linked Accounts</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Connect your social accounts for easier login.</p>
                                    {/* This is likely where the "Add Account" button should be */}
                                    <Button variant="outline">Add Account</Button>
                                </div>

                                <div className="p-4 border rounded-md">
                                    <h3 className="font-medium mb-2">Password</h3>
                                    <Button variant="outline">Change Password</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === "services" && user.role === "PROVIDER" && user.providerProfile && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Provider Details</h2>
                                <Link href={`/providers/${user.id}`} target="_blank">
                                    <Button variant="outline" size="sm">
                                        👁️ Preview Public Profile
                                    </Button>
                                </Link>
                            </div>
                            <ProviderProfileForm initialData={user.providerProfile} />

                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <ServiceManager services={user.providerProfile.serviceOfferings} />
                            </div>
                        </div>
                    )}

                    {tab === "payouts" && user.role === "PROVIDER" && accountStatus && !('error' in accountStatus) && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">Payout Settings</h2>
                            <p className="text-muted-foreground mb-6">
                                Manage your banking details to receive payments from customers.
                            </p>
                            <PayoutAccountClient accountStatus={accountStatus as any} />
                        </div>
                    )}

                    {tab === "payments" && user.role === "CUSTOMER" && (
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
                            <p className="text-muted-foreground mb-6">
                                View your past transactions and payments.
                            </p>
                            <CustomerPaymentHistory transactions={customerTransactions} />
                        </div>
                    )}

                    {tab === "messages" && user.role === "PROVIDER" && (async () => {
                        const conversations = await getConversations()

                        return (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-4">Messages</h2>

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
                                                            <h3 className="font-semibold">{conv.partner.name || conv.partner.email}</h3>
                                                            {conv.unreadCount > 0 && (
                                                                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                                                    {conv.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {conv.messages[0] && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {conv.messages[0].content}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {conv.messages[0] && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(conv.messages[0].createdAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                        <p className="text-sm text-muted-foreground">No messages yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Customers can contact you through your public profile
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })()}
                </div>
            </div>
        </div>
    )
}
