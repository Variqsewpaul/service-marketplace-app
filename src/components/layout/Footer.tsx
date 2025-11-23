import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container-custom py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground">ServiceMarket</h3>
                        <p className="text-sm text-muted-foreground">
                            Connecting you with the best local professionals for any job.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-3">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/services" className="hover:text-foreground">Browse Services</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-foreground">How it Works</Link></li>
                            <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-3">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-3">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} ServiceMarket. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
