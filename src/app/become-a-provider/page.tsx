import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function BecomeProviderPage() {
    return (
        <div className="container-custom py-20 text-center">
            <h1 className="text-4xl font-bold mb-6">Become a Service Provider</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our community of professionals and grow your business.
                Showcase your skills, connect with customers, and get paid securely.
            </p>
            <div className="flex justify-center gap-4">
                <Link href="/onboarding">
                    <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/">
                    <Button variant="outline" size="lg">Back to Home</Button>
                </Link>
            </div>
        </div>
    )
}
