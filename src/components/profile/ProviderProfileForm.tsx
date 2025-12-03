"use client"

import { Button } from "@/components/ui/Button"
import { updateProviderProfile, addPortfolioItem, deletePortfolioItem } from "@/actions/profile"
import { useActionState, useState, useCallback, useEffect } from "react"
import { SERVICE_CATEGORIES } from "@/lib/constants"

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

    // State for custom category
    const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "");
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    // Check if initial category is not in the standard list
    const standardCategories = SERVICE_CATEGORIES;

    useEffect(() => {
        if (initialData?.category && !standardCategories.includes(initialData.category)) {
            setIsCustomCategory(true);
            setSelectedCategory("other");
        }
    }, [initialData]);

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

    {/* Helper Component for Labels with Tooltips */ }
    const InfoLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
        <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-foreground">
                {label}
            </label>
            <div className="group relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border border-muted-foreground/50 text-muted-foreground text-[10px] flex items-center justify-center cursor-help transition-colors hover:border-primary hover:text-primary">
                    i
                </div>
                {/* Tooltip with improved visibility - dark background and white text */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded shadow-lg border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-8 max-w-xl">
            <form action={async (formData) => {
                // If custom category is selected, use the custom input value
                if (isCustomCategory) {
                    const customValue = formData.get("customCategory") as string;
                    if (customValue) {
                        formData.set("category", customValue);
                    }
                }
                await dispatch(formData);
            }} className="space-y-6">
                {/* Provider Type Selection */}
                <div className="space-y-3">
                    <InfoLabel
                        label="I am registering as:"
                        tooltip="Choose 'Individual' if you work alone, or 'Business' if you represent a registered company."
                    />
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
                            <InfoLabel
                                label="Business Logo"
                                tooltip="Upload your official company logo. This will be displayed on your profile."
                            />
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
                            <InfoLabel
                                label="Business Name"
                                tooltip="The registered name of your company as it appears on official documents."
                            />
                            <input
                                type="text"
                                id="businessName"
                                name="businessName"
                                required={providerType === "BUSINESS"}
                                defaultValue={initialData?.businessName || ""}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="e.g. Acme Plumbing Solutions (Pty) Ltd"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InfoLabel
                                    label="Registration Number"
                                    tooltip="Your CIPC registration number (e.g. 2023/123456/07)."
                                />
                                <input
                                    type="text"
                                    id="businessRegNumber"
                                    name="businessRegNumber"
                                    defaultValue={initialData?.businessRegNumber || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="e.g. 2023/123456/07"
                                />
                            </div>
                            <div>
                                <InfoLabel
                                    label="Tax/VAT Number"
                                    tooltip="Your SARS Tax or VAT reference number."
                                />
                                <input
                                    type="text"
                                    id="taxNumber"
                                    name="taxNumber"
                                    defaultValue={initialData?.taxNumber || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="e.g. 4123456789"
                                />
                            </div>
                        </div>

                        <div>
                            <InfoLabel
                                label="Business Address"
                                tooltip="The physical address of your business headquarters."
                            />
                            <input
                                type="text"
                                id="businessAddress"
                                name="businessAddress"
                                defaultValue={initialData?.businessAddress || ""}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="e.g. 123 Main Street, Sandton, Johannesburg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InfoLabel
                                    label="Number of Employees"
                                    tooltip="Total number of staff members currently employed."
                                />
                                <input
                                    type="number"
                                    id="numberOfEmployees"
                                    name="numberOfEmployees"
                                    min="1"
                                    defaultValue={initialData?.numberOfEmployees || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="e.g. 5"
                                />
                            </div>
                            <div>
                                <InfoLabel
                                    label="Years in Business"
                                    tooltip="How many years has your company been operating?"
                                />
                                <input
                                    type="number"
                                    id="yearsInBusiness"
                                    name="yearsInBusiness"
                                    min="0"
                                    defaultValue={initialData?.yearsInBusiness || ""}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="e.g. 3"
                                />
                            </div>
                        </div>

                        <div>
                            <InfoLabel
                                label="Business Description"
                                tooltip="A detailed description of your company, its mission, and what sets it apart."
                            />
                            <textarea
                                id="businessDescription"
                                name="businessDescription"
                                rows={3}
                                defaultValue={initialData?.businessDescription || ""}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="e.g. We are a family-owned plumbing business specializing in residential repairs and renovations with over 10 years of experience..."
                            />
                        </div>
                    </div>
                )}

                {/* Profile Picture - Show different label for business */}
                <div>
                    <InfoLabel
                        label={providerType === "BUSINESS" ? "Representative Profile Picture" : "Profile Picture"}
                        tooltip="A clear photo of yourself (or the business representative) to build trust with customers."
                    />
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
                    <InfoLabel
                        label={providerType === "BUSINESS" ? "Representative Bio" : "Bio"}
                        tooltip="Tell customers about your experience, qualifications, and why they should hire you."
                    />
                    <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        defaultValue={initialData?.bio || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder={providerType === "BUSINESS" ? "I am the lead coordinator for Acme Plumbing..." : "I am a certified electrician with 5 years of experience in..."}
                    />
                </div>

                <div>
                    <InfoLabel
                        label="Category"
                        tooltip="Select the primary category that best describes the services you offer."
                    />
                    <select
                        id="category"
                        name="category"
                        value={isCustomCategory ? "other" : selectedCategory}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "other") {
                                setIsCustomCategory(true);
                                setSelectedCategory("other");
                            } else {
                                setIsCustomCategory(false);
                                setSelectedCategory(value);
                            }
                        }}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="">Select a category</option>
                        {standardCategories.map(cat => (
                            <option key={cat} value={cat}>{cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                        ))}
                        <option value="other">Other (Specify)</option>
                    </select>

                    {isCustomCategory && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                            <label htmlFor="customCategory" className="block text-xs text-muted-foreground mb-1">
                                Please specify your category:
                            </label>
                            <input
                                type="text"
                                id="customCategory"
                                name="customCategory"
                                required={isCustomCategory}
                                defaultValue={!standardCategories.includes(initialData?.category || "") ? initialData?.category || "" : ""}
                                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="e.g. Interior Design"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <InfoLabel
                        label="Skills (comma separated)"
                        tooltip="List specific skills or services you offer, separated by commas (e.g. Leak detection, Geyser installation)."
                    />
                    <input
                        type="text"
                        id="skills"
                        name="skills"
                        defaultValue={initialData?.skills || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="e.g. Pipe fitting, Leak detection, Geyser maintenance"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InfoLabel
                            label="Contact Email"
                            tooltip="The email address where customers can reach you."
                        />
                        <input
                            type="email"
                            id="contactEmail"
                            name="contactEmail"
                            defaultValue={initialData?.contactEmail || ""}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="e.g. contact@mybusiness.com"
                        />
                    </div>
                    <div>
                        <InfoLabel
                            label="Contact Phone"
                            tooltip="The phone number where customers can call or WhatsApp you."
                        />
                        <input
                            type="tel"
                            id="contactPhone"
                            name="contactPhone"
                            defaultValue={initialData?.contactPhone || ""}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="e.g. 082 123 4567"
                        />
                    </div>
                </div>

                <div>
                    <InfoLabel
                        label="Location"
                        tooltip="The city or area where you primarily offer your services."
                    />
                    <input
                        type="text"
                        id="location"
                        name="location"
                        defaultValue={initialData?.location || ""}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="e.g. Sandton, Johannesburg"
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
