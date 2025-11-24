import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { getConversationMessages } from "@/actions/messages"
import { MessageThread } from "@/components/messages/MessageThread"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function ConversationPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const session = await auth()
    const { partnerId } = await params

    if (!session?.user) {
        redirect("/auth/signin")
    }

    // Get partner info
    const partner = await db.user.findUnique({
        where: { id: partnerId },
        select: { id: true, name: true, email: true }
    })

    if (!partner) {
        notFound()
    }

    // Get messages
    const messages = await getConversationMessages(partnerId)

    return (
        <div className="min-h-screen bg-background">
            <div className="container-custom py-12">
                <div className="mb-6">
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <MessageThread
                            messages={messages}
                            partnerId={partnerId}
                            partnerName={partner.name || partner.email || "Provider"}
                            currentUserId={session.user.id}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
