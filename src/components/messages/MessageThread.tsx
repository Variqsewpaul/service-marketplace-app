"use client"

import { useActionState, useState, useCallback, useRef, useEffect } from "react"
import { sendMessage, deleteConversation } from "@/actions/messages"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

function formatTimestamp(date: Date) {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
        return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInDays === 1) {
        return 'Yesterday'
    } else if (diffInDays < 7) {
        return messageDate.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
}

export function MessageThread({
    messages,
    partnerId,
    partnerName,
    currentUserId
}: {
    messages: any[],
    partnerId: string,
    partnerName: string,
    currentUserId?: string
}) {
    const [state, dispatch, isPending] = useActionState(sendMessage, undefined)
    const [content, setContent] = useState("")
    const [attachments, setAttachments] = useState<string[]>([])
    const [messageType, setMessageType] = useState("TEXT")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this conversation?")) {
            await deleteConversation(partnerId)
            router.push("/dashboard/messages")
        }
    }

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        const reader = new FileReader()

        reader.onload = (event) => {
            const result = event.target?.result as string
            setAttachments([result])

            // Determine message type
            if (file.type.startsWith('image/')) {
                setMessageType('IMAGE')
                setContent(`Sent an image: ${file.name}`)
            } else if (file.type === 'application/pdf') {
                setMessageType('FILE')
                setContent(`Sent a file: ${file.name}`)
            }
        }

        reader.readAsDataURL(file)
    }, [])

    const handleSubmit = async (formData: FormData) => {
        if (attachments.length > 0) {
            formData.set('attachments', JSON.stringify(attachments))
            formData.set('messageType', messageType)
        }

        await dispatch(formData)
        setContent("")
        setAttachments([])
        setMessageType("TEXT")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    // Group messages by sender
    const groupedMessages: any[] = []
    let currentGroup: any = null

    messages.forEach((message, index) => {
        const isSender = currentUserId ? message.senderId === currentUserId : message.senderId !== partnerId

        if (!currentGroup || currentGroup.isSender !== isSender) {
            currentGroup = {
                isSender,
                sender: isSender ? "You" : partnerName,
                messages: [message]
            }
            groupedMessages.push(currentGroup)
        } else {
            currentGroup.messages.push(message)
        }
    })

    return (
        <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="border-b p-4 bg-muted/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                        {partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-semibold">{partnerName}</h3>
                        <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                >
                    Delete Chat
                </Button>
            </div>

            {/* Privacy Warning */}
            <div className="bg-yellow-50 border-b border-yellow-100 p-2 text-center">
                <p className="text-xs text-yellow-800">
                    🔒 For your safety, contact details are hidden until a booking is confirmed.
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
                {groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex} className={`flex flex-col ${group.isSender ? 'items-end' : 'items-start'}`}>
                        {/* Sender name */}
                        {!group.isSender && (
                            <p className="text-xs text-muted-foreground mb-1 px-3">{group.sender}</p>
                        )}

                        {/* Messages in group */}
                        <div className="space-y-1 max-w-[70%]">
                            {group.messages.map((message: any) => {
                                const attachmentData = message.attachments ? JSON.parse(message.attachments) : []

                                return (
                                    <div
                                        key={message.id}
                                        className={`rounded-2xl px-4 py-2 ${group.isSender
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted rounded-tl-sm"
                                            }`}
                                    >
                                        {/* Image attachment */}
                                        {message.messageType === 'IMAGE' && attachmentData[0] && (
                                            <div className="mb-2">
                                                <img
                                                    src={attachmentData[0]}
                                                    alt="Attachment"
                                                    className="rounded-lg max-w-full h-auto max-h-64 object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* File attachment */}
                                        {message.messageType === 'FILE' && attachmentData[0] && (
                                            <div className="mb-2 flex items-center gap-2 p-2 rounded bg-background/10">
                                                <span className="text-2xl">📄</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{message.content.replace('Sent a file: ', '')}</p>
                                                    <a
                                                        href={attachmentData[0]}
                                                        download
                                                        className="text-xs underline"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {/* Text content */}
                                        {message.messageType === 'TEXT' && (
                                            <p className="text-sm break-words">{message.content}</p>
                                        )}

                                        {/* Timestamp */}
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <p className={`text-xs ${group.isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {formatTimestamp(message.createdAt)}
                                            </p>
                                            {group.isSender && (
                                                <span className="text-xs">
                                                    {message.read ? '✓✓' : '✓'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form action={handleSubmit} className="border-t p-4 bg-background">
                <input type="hidden" name="receiverId" value={partnerId} />

                {/* File preview */}
                {attachments.length > 0 && (
                    <div className="mb-2 p-2 border rounded-lg">
                        {messageType === 'IMAGE' ? (
                            <img src={attachments[0]} alt="Preview" className="max-h-32 rounded" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">📄</span>
                                <p className="text-sm">{content}</p>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setAttachments([])
                                setMessageType("TEXT")
                                setContent("")
                                if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                            className="text-xs text-destructive mt-1"
                        >
                            Remove
                        </button>
                    </div>
                )}

                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Attach file"
                    >
                        📎
                    </button>
                    <input
                        type="text"
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        required={attachments.length === 0}
                        disabled={attachments.length > 0}
                    />
                    <Button
                        type="submit"
                        disabled={isPending || (!content.trim() && attachments.length === 0)}
                        className="rounded-lg"
                    >
                        {isPending ? "..." : "Send"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
