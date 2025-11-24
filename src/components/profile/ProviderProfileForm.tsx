"use client"

import { Button } from "@/components/ui/Button"
import { updateProviderProfile, addPortfolioItem, deletePortfolioItem } from "@/actions/profile"
import { useActionState, useState, useCallback } from "react"

export function ProviderProfileForm({ initialData }: { initialData: any }) {
    const [state, dispatch, isPending] = useActionState(updateProviderProfile, undefined)
    const [portfolioState, dispatchPortfolio, isPortfolioPending] = useActionState(addPortfolioItem, undefined)

    // Drag & Drop State for portfolio
    const [isDragging, setIsDragging] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string>("")

    // Profile picture state
    const [profilePicPreview, setProfilePicPreview] = useState<string>(initialData?.profilePicture || "")

    // Provider type state
    const [providerType, setProviderType] = useState<string>(initialData?.providerType || "INDIVIDUAL")

    // Business logo state
    const [businessLogoPreview, setBusinessLogoPreview] = useState<string>(initialData?.businessLogo || "")

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setPreviewUrl(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setPreviewUrl(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const handleProfilePicChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setProfilePicPreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    const handleBusinessLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setBusinessLogoPreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [])

    return (
        <div className="space-y-8 max-w-xl">
            <form action={dispatch} className="space-y-6">
                {/* Provider Type Selection */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">
                        I am registering as:
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 flex-1 hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                                type="radio"
                                name="providerType"
                                value="INDIVIDUAL"
                                defaultChecked={!initialData?.providerType || initialData?.providerType === "INDIVIDUAL"}
                                onChange={() => setProviderType("INDIVIDUAL")}
                                className="w-4 h-4 text-primary"
                            />
                            <div>
                                <span className="font-medium block">Individual</span>
                                <span className="text-xs text-muted-foreground">I offer services myself</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 flex-1 hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                                type="radio"
                                name="providerType"
                                value="BUSINESS"
                                defaultChecked={initialData?.providerType === "BUSINESS"}
                                onChange={() => setProviderType("BUSINESS")}
                                className="w-4 h-4 text-primary"
                            />
                            <div>
                                <span className="font-medium block">Business</span>
                                <span className="text-xs text-muted-foreground">I represent a company</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Business Fields - Only shown if providerType is BUSINESS */}
                {providerType === "BUSINESS" && (
                    <div className="space-y-6 border-l-2 border-primary/20 pl-4 ml-1 animate-in fade-in slide-in-from-top-2">
                        <h3 className="font-semibold text-lg">Business Details</h3>

                        {/* Business Logo */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Business Logo
                            </label>
                            <div
                                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors hover:border-primary/50"
                                onClick={() => document.getElementById("business-logo-upload")?.click()}
                            >
                                <input
                                    type="file"
                                    id="business-logo-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleBusinessLogoChange}
                                />
                                <input type="hidden" name="businessLogo" value={businessLogoPreview} />

                                {businessLogoPreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-32 h-32 rounded-md overflow-hidden bg-muted object-contain">
                                            <img src={businessLogoPreview} alt="Business Logo" className="w-full h-full object-contain" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-4xl">🏢</div>
                                        <p className="text-sm font-medium">Add Business Logo</p>
                                        <p className="text-xs text-muted-foreground">Click to select</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-foreground">
                                Business Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                id="businessName"
                                name="businessName"
                                required={providerType === "BUSINESS"}
                                defaultValue={initialData?.businessName || ""}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="businessRegNumber" className="block text-sm font-medium text-foreground">
                                    Registration Number
                                </label>
                                <input
                                    type="text"
                                    id="businessRegNumber"
                                    name="businessRegNumber"
                                    defaultValue={initialData?.businessRegNumber || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                            <div>
                                <label htmlFor="taxNumber" className="block text-sm font-medium text-foreground">
                                    Tax/VAT Number
                                </label>
                                <input
                                    type="text"
                                    id="taxNumber"
                                    name="taxNumber"
                                    defaultValue={initialData?.taxNumber || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="businessAddress" className="block text-sm font-medium text-foreground">
                                Business Address
                            </label>
                            <input
                                type="text"
                                id="businessAddress"
                                name="businessAddress"
                                defaultValue={initialData?.businessAddress || ""}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-foreground">
                                    Number of Employees
                                </label>
                                <input
                                    type="number"
                                    id="numberOfEmployees"
                                    name="numberOfEmployees"
                                    min="1"
                                    defaultValue={initialData?.numberOfEmployees || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                            <div>
                                <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-foreground">
                                    Years in Business
                                </label>
                                <input
                                    type="number"
                                    id="yearsInBusiness"
                                    name="yearsInBusiness"
                                    min="0"
                                    defaultValue={initialData?.yearsInBusiness || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="businessDescription" className="block text-sm font-medium text-foreground">
                                Business Description
                            </label>
                            <textarea
                                id="businessDescription"
                                name="businessDescription"
                                rows={3}
                                defaultValue={initialData?.businessDescription || ""}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Describe your company..."
                            />
                        </div>
                    </div>
                )}

                {/* Profile Picture - Show different label for business */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        {providerType === "BUSINESS" ? "Representative Profile Picture" : "Profile Picture"}
                    </label>
                    <div
                        className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors hover:border-primary/50"
                        onClick={() => document.getElementById("profile-pic-upload")?.click()}
                    >
                        <input
                            type="file"
                            id="profile-pic-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                        />
                        <input type="hidden" name="profilePicture" value={profilePicPreview} />

                        {profilePicPreview ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
                                    <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <p className="text-xs text-muted-foreground">Click to change</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-4xl">👤</div>
                                <p className="text-sm font-medium">Add Profile Picture</p>
                                <p className="text-xs text-muted-foreground">Click to select</p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-foreground">
                        {providerType === "BUSINESS" ? "Representative Bio" : "Bio"}
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={initialData?.bio || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder={providerType === "BUSINESS" ? "Tell us about yourself as the representative..." : "Tell us about yourself and your services..."}
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-foreground">
                        Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        defaultValue={initialData?.category || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Select a category</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="landscaping">Landscaping</option>
                        <option value="moving">Moving</option>
                        <option value="security">Security</option>
                        <option value="painting">Painting</option>
                        <option value="carpentry">Carpentry</option>
                        <option value="pest_control">Pest Control</option>
                        <option value="appliance_repair">Appliance Repair</option>
                        <option value="tutoring">Tutoring</option>
                        <option value="personal_training">Personal Training</option>
                        <option value="event_planning">Event Planning</option>
                        <option value="photography">Photography</option>
                        <option value="web_development">Web Development</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-foreground">
                        Skills (comma separated)
                    </label>
                    <input
                        type="text"
                        id="skills"
                        name="skills"
                        defaultValue={initialData?.skills || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="e.g. Pipe fitting, Leak detection"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="contactEmail" className="block text-sm font-medium text-foreground">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            defaultValue={initialData?.contactEmail || ""}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-foreground">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            defaultValue={initialData?.contactPhone || ""}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-foreground">
                        Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        defaultValue={initialData?.location || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="e.g. Johannesburg, Gauteng"
                    />
                </div>

                <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-foreground">
                        Hourly Rate (R)
                    </label>
                    <input
                        type="number"
                        id="hourlyRate"
                        name="hourlyRate"
                        min="0"
                        step="0.01"
                        defaultValue={initialData?.hourlyRate || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                </div>

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Profile"}
                </Button>
            </form>

            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Portfolio</h3>

                <div className="grid gap-4 mb-6">
                    {initialData?.portfolioItems?.map((item: any) => (
                        <div key={item.id} className="border rounded-md p-4 flex justify-between items-start gap-4">
                            <div className="flex gap-4 flex-1">
                                {item.imageUrl && (
                                    <div className="w-24 h-24 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                                        <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-semibold">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            </div>
                            <form action={deletePortfolioItem}>
                                <input type="hidden" name="itemId" value={item.id} />
                                <Button variant="ghost" size="sm" type="submit" className="text-destructive hover:text-destructive">
                                    Delete
                                </Button>
                            </form>
                        </div>
                    ))}
                    {(!initialData?.portfolioItems || initialData.portfolioItems.length === 0) && (
                        <p className="text-sm text-muted-foreground italic">No portfolio items yet.</p>
                    )}
                </div>

                <div className="bg-muted/30 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-3">Add New Item</h4>
                    <form action={(formData) => {
                        setPreviewUrl("")
                        dispatchPortfolio(formData)
                    }} className="space-y-3">
                        <div>
                            <input
                                type="text"
                                name="title"
                                placeholder="Project Title"
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <textarea
                                name="description"
                                placeholder="Description"
                                rows={2}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Drag & Drop Area */}
                        <div
                            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("file-upload")?.click()}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <input type="hidden" name="imageUrl" value={previewUrl} />

                            {previewUrl ? (
                                <div className="space-y-2">
                                    <div className="relative w-full h-48 rounded-md overflow-hidden bg-muted">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Click or drag to replace</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-4xl">📷</div>
                                    <p className="text-sm font-medium">Drag & drop an image here, or click to select</p>
                                    <p className="text-xs text-muted-foreground">Supports JPG, PNG, GIF</p>
                                </div>
                            )}
                        </div>

                        <Button type="submit" variant="secondary" size="sm" disabled={isPortfolioPending}>
                            {isPortfolioPending ? "Adding..." : "Add Item"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
