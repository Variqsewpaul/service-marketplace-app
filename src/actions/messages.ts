"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function sendMessage(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const receiverId = formData.get("receiverId") as string
    const content = formData.get("content") as string

    if (!receiverId || !content) {
        return { error: "Missing required fields" }
    }

    await db.message.create({
        data: {
            senderId: session.user.id,
            receiverId,
            content,
        },
    })

    revalidatePath("/profile")
    return { success: true }
}

export async function getConversations() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Get all messages where user is sender or receiver
    const messages = await db.message.findMany({
        where: {
            OR: [
                { senderId: session.user.id },
                { receiverId: session.user.id },
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

    messages.forEach((message) => {
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
                { senderId: session.user.id, receiverId: partnerId },
                { senderId: partnerId, receiverId: session.user.id },
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
