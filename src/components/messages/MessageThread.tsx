"use client"

import { useActionState, useState } from "react"
import { sendMessage } from "@/actions/messages"
import { Button } from "@/components/ui/Button"

export function MessageThread({
    messages,
    partnerId,
    partnerName
}: {
    messages: any[],
    partnerId: string,
    partnerName: string
}) {
    const [state, dispatch, isPending] = useActionState(sendMessage, undefined)
    const [content, setContent] = useState("")

    const handleSubmit = (formData: FormData) => {
        dispatch(formData)
        setContent("")
    }

    return (
        <div className="flex flex-col h-[600px]">
            <div className="border-b p-4">
                <h3 className="font-semibold">{partnerName}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.senderId === partnerId ? "justify-start" : "justify-end"}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${message.senderId === partnerId
                                    ? "bg-muted"
                                    : "bg-primary text-primary-foreground"
                                }`}
                        >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <form action={handleSubmit} className="border-t p-4">
                <input type="hidden" name="receiverId" value={partnerId} />
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                    />
                    <Button type="submit" disabled={isPending || !content.trim()}>
                        {isPending ? "Sending..." : "Send"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
