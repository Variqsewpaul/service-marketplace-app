import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Find the Perfect <span className="text-primary">Professional</span><br />
            for Your Needs
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            From home repairs to personal training, connect with trusted experts in your area.
            Book services instantly with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/services">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Find a Service
              </Button>
            </Link>
            <Link href="/become-a-provider">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                Become a Provider
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Search</h3>
              <p className="text-muted-foreground">Find exactly what you need with our advanced search and filtering system.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Booking</h3>
              <p className="text-muted-foreground">Book appointments directly through the platform with real-time availability.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">Pay safely and securely for services with our integrated payment system.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
