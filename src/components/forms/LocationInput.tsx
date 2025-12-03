'use client';

type LocationInputProps = {
    street?: string;
    district?: string;
    city?: string;
    postcode?: string;
    required?: boolean;
    onChange?: (location: { street?: string; district?: string; city?: string; postcode?: string }) => void;
};

export default function LocationInput({
    street = '',
    district = '',
    city = '',
    postcode = '',
    required = false,
    onChange
}: LocationInputProps) {
    const handleChange = (field: string, value: string) => {
        if (onChange) {
            onChange({
                street: field === 'street' ? value : street,
                district: field === 'district' ? value : district,
                city: field === 'city' ? value : city,
                postcode: field === 'postcode' ? value : postcode,
            });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="street" className="block text-sm font-medium text-foreground mb-2">
                    Street Address {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="text"
                    id="street"
                    name="street"
                    defaultValue={street}
                    required={required}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className="block w-full rounded-lg bg-background border border-border text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                    placeholder="e.g. 123 Main Street"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="district" className="block text-sm font-medium text-foreground mb-2">
                        District/Suburb
                    </label>
                    <input
                        type="text"
                        id="district"
                        name="district"
                        defaultValue={district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className="block w-full rounded-lg bg-background border border-border text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                        placeholder="e.g. Sandton"
                    />
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                        City/Town {required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        defaultValue={city}
                        required={required}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="block w-full rounded-lg bg-background border border-border text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                        placeholder="e.g. Johannesburg"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="postcode" className="block text-sm font-medium text-foreground mb-2">
                    Postcode
                </label>
                <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    defaultValue={postcode}
                    onChange={(e) => handleChange('postcode', e.target.value)}
                    className="block w-full rounded-lg bg-background border border-border text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-3 hover:border-primary/50 transition-colors"
                    placeholder="e.g. 2196"
                />
            </div>
        </div>
    );
}
