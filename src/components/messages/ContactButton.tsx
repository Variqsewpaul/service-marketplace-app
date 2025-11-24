"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { ContactModal } from "@/components/messages/ContactModal"

export function ContactButton({ providerId, providerName }: { providerId: string, providerName: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Button size="lg" className="w-full md:w-auto" onClick={() => setIsModalOpen(true)}>
                Contact Provider
            </Button>
            <ContactModal
                providerId={providerId}
                providerName={providerName}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
