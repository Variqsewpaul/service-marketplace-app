import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { auth, signOut } from "@/auth"

export async function Navbar() {
    const session = await auth()

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container-custom flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary">ServiceMarket</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/services" className="hover:text-foreground transition-colors">
                            Find Services
                        </Link>
                        <Link href="/become-a-provider" className="hover:text-foreground transition-colors">
                            Become a Provider
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                Hello, {session.user.name || session.user.email}
                            </span>
                            <form
                                action={async () => {
                                    "use server"
                                    await signOut()
                                }}
                            >
                                <Button variant="ghost" size="sm">
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">
                                    Sign up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
