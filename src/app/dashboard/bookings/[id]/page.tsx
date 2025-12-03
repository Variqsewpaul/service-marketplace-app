import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getBookingDetails } from "@/actions/booking-actions"
import { confirmBooking } from "@/actions/booking-actions"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const result = await getBookingDetails(id)

    if (!result.success || !result.booking) {
        return (
            <div className="container-custom py-12">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
                    <p className="text-muted-foreground mb-6">This booking doesn't exist or you don't have access to it.</p>
                    <Link href="/dashboard">
                        <Button>Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const booking = result.booking
    const isCustomer = booking.customerId === session.user.id
    const isProvider = booking.providerProfile.userId === session.user.id
    const hasQuote = booking.servicePrice > 0
    const canAcceptQuote = isCustomer && hasQuote && booking.status === 'PENDING'

    const providerName = booking.providerProfile.providerType === 'BUSINESS' && booking.providerProfile.businessName
        ? booking.providerProfile.businessName
        : booking.providerProfile.user.name

    return (
        <div className="container-custom py-12">
            <div className="mb-6">
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="bg-card rounded-lg border p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">{booking.serviceTitle}</h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                                    booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                }`}>
                                {booking.status}
                            </span>
                        </div>
                    </div>

                    {booking.serviceDescription && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-muted-foreground">{booking.serviceDescription}</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h3 className="font-semibold mb-2">{isCustomer ? 'Provider' : 'Customer'}</h3>
                            <p className="text-muted-foreground">
                                {isCustomer ? providerName : booking.customer.name}
                            </p>
                        </div>
                        {booking.scheduledDate && (
                            <div>
                                <h3 className="font-semibold mb-2">Scheduled Date</h3>
                                <p className="text-muted-foreground">
                                    {new Date(booking.scheduledDate).toLocaleDateString()}
                                    {booking.scheduledTime && ` at ${booking.scheduledTime}`}
                                </p>
                            </div>
                        )}
                    </div>

                    {(booking.city || booking.district) && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Location</h3>
                            <p className="text-muted-foreground">
                                {[booking.street, booking.district, booking.city, booking.postcode].filter(Boolean).join(', ')}
                            </p>
                        </div>
                    )}

                    {booking.notes && (
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-muted-foreground">{booking.notes}</p>
                        </div>
                    )}
                </div>

                {/* Pricing Section */}
                {hasQuote && (
                    <div className="bg-card rounded-lg border p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Service Price</span>
                                <span className="font-medium">R {booking.servicePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Booking Fee</span>
                                <span className="font-medium">R {booking.bookingFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Transaction Fee</span>
                                <span className="font-medium">R {booking.transactionFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between">
                                <span className="font-semibold">Total Amount</span>
                                <span className="font-bold text-lg">R {booking.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Deposit Required</span>
                                <span className="font-medium text-blue-600">R {booking.depositAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {canAcceptQuote && (
                            <form action={async () => {
                                'use server'
                                const result = await confirmBooking(id)
                                if (result.success && result.authorizationUrl) {
                                    redirect(result.authorizationUrl)
                                }
                            }} className="mt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                    💰 Accept Quote & Pay Deposit (R {booking.depositAmount.toFixed(2)})
                                </Button>
                            </form>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="bg-card rounded-lg border p-6">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href={`/dashboard/messages/${isCustomer ? booking.providerProfile.userId : booking.customer.id}`}>
                            <Button variant="outline">
                                💬 Message {isCustomer ? 'Provider' : 'Customer'}
                            </Button>
                        </Link>
                        {isCustomer && (
                            <Link href={`/providers/${booking.providerProfile.userId}`}>
                                <Button variant="outline">
                                    👤 View Provider Profile
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
