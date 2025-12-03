"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { maskSensitiveContent, containsSensitiveContent } from "@/lib/privacy"

export async function sendMessage(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const receiverId = formData.get("receiverId") as string
    let content = formData.get("content") as string
    const messageType = formData.get("messageType") as string || "TEXT"
    const attachments = formData.get("attachments") as string || null

    if (!receiverId || !content) {
        return { error: "Missing required fields" }
    }

    // Privacy Check: Mask contact info if no confirmed booking exists
    if (containsSensitiveContent(content)) {
        // Check for any confirmed or in-progress booking between these two users
        // We need to check both directions:
        // 1. Sender is Customer, Receiver is Provider
        // 2. Sender is Provider, Receiver is Customer

        const hasActiveBooking = await db.booking.findFirst({
            where: {
                OR: [
                    // Case 1: Sender is Customer, Receiver is Provider
                    {
                        customerId: session.user.id,
                        providerProfile: {
                            userId: receiverId
                        },
                        status: {
                            in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"]
                        }
                    },
                    // Case 2: Sender is Provider, Receiver is Customer
                    {
                        customerId: receiverId,
                        providerProfile: {
                            userId: session.user.id
                        },
                        status: {
                            in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"]
                        }
                    }
                ]
            }
        })

        if (!hasActiveBooking) {
            const originalContent = content;
            content = maskSensitiveContent(content);

            // Log for debugging
            console.log('[PRIVACY FILTER] Contact info blocked:', {
                senderId: session.user.id,
                receiverId,
                originalLength: originalContent.length,
                maskedLength: content.length,
                hasBooking: false
            });

            // Create message with masked content
            await db.message.create({
                data: {
                    senderId: session.user.id,
                    receiverId,
                    content,
                    messageType,
                    attachments,
                },
            });

            revalidatePath("/profile");
            revalidatePath("/dashboard");

            // Return warning to user
            return {
                success: true,
                warning: "⚠️ Contact information has been hidden. You can share contact details after the booking deposit is paid."
            }
        }
    }

    await db.message.create({
        data: {
            senderId: session.user.id,
            receiverId,
            content,
            messageType,
            attachments,
        },
    })

    revalidatePath("/profile")
    revalidatePath("/dashboard")
    return { success: true }
}

export async function getConversations() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Get all messages where user is sender or receiver
    const messages = await db.message.findMany({
        where: {
            OR: [
                { senderId: session.user.id, deletedBySender: false },
                { receiverId: session.user.id, deletedByReceiver: false },
            ],
        },
        include: {
            sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    })

    // Group by conversation partner
    const conversationsMap = new Map()

    messages.forEach((message: any) => {
        const partnerId = message.senderId === session.user.id ? message.receiverId : message.senderId
        const partner = message.senderId === session.user.id ? message.receiver : message.sender

        if (!conversationsMap.has(partnerId)) {
            conversationsMap.set(partnerId, {
                partner,
                messages: [],
                unreadCount: 0,
            })
        }

        const conversation = conversationsMap.get(partnerId)
        conversation.messages.push(message)

        if (!message.read && message.receiverId === session.user.id) {
            conversation.unreadCount++
        }
    })

    return Array.from(conversationsMap.values())
}

export async function markAsRead(messageId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await db.message.updateMany({
        where: {
            id: messageId,
            receiverId: session.user.id,
        },
        data: { read: true },
    })

    revalidatePath("/profile")
}

export async function getConversationMessages(partnerId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const messages = await db.message.findMany({
        where: {
            OR: [
                { senderId: session.user.id, receiverId: partnerId, deletedBySender: false },
                { senderId: partnerId, receiverId: session.user.id, deletedByReceiver: false },
            ],
        },
        include: {
            sender: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
    })

    // Mark all messages from partner as read
    await db.message.updateMany({
        where: {
            senderId: partnerId,
            receiverId: session.user.id,
            read: false,
        },
        data: { read: true },
    })

    return messages
}

export async function deleteConversation(partnerId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Update messages where user is sender
    await db.message.updateMany({
        where: {
            senderId: session.user.id,
            receiverId: partnerId,
        },
        data: { deletedBySender: true },
    })

    // Update messages where user is receiver
    await db.message.updateMany({
        where: {
            senderId: partnerId,
            receiverId: session.user.id,
        },
        data: { deletedByReceiver: true },
    })

    revalidatePath("/dashboard/messages")
    revalidatePath(`/dashboard/messages/${partnerId}`)
    return { success: true }
}
