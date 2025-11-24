"use client"

import { useState, useActionState } from "react"
import { sendMessage } from "@/actions/messages"
import { Button } from "@/components/ui/Button"

export function ContactModal({
    providerId,
    providerName,
    isOpen,
    onClose
}: {
    providerId: string
    providerName: string
    isOpen: boolean
    onClose: () => void
}) {
    const [state, dispatch, isPending] = useActionState(sendMessage, undefined)
    const [message, setMessage] = useState("")

    const handleSubmit = async (formData: FormData) => {
        formData.set("messageType", "TEXT")
        await dispatch(formData)
        if (!state?.error) {
            setMessage("")
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Contact {providerName}</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="receiverId" value={providerId} />

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium mb-2">
                            Your Message
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            required
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Hi, I'm interested in your services..."
                        />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-destructive">{state.error}</p>
                    )}

                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !message.trim()}>
                            {isPending ? "Sending..." : "Send Message"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
