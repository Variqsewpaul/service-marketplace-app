'use client';

import { useState } from 'react';
import { createServiceOffering, deleteServiceOffering, ServiceOfferingData } from '@/app/actions/service-actions';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

type ServiceOffering = {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    pricingModel: string;
    unit: string | null;
};

export default function ServiceManager({ services }: { services: ServiceOffering[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState<ServiceOfferingData>({
        title: '',
        description: '',
        price: 0,
        pricingModel: 'FIXED',
        unit: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createServiceOffering(formData);
            setIsAdding(false);
            setFormData({
                title: '',
                description: '',
                price: 0,
                pricingModel: 'FIXED',
                unit: '',
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to add service');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await deleteServiceOffering(id);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to delete service');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-foreground">Service Offerings</h2>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    variant={isAdding ? "outline" : "default"}
                >
                    {isAdding ? 'Cancel' : 'Add New Service'}
                </Button>
            </div>

            {isAdding && (
                <div className="bg-card border rounded-lg p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Service Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="e.g., Toilet Installation"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                rows={3}
                                placeholder="Describe what's included..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Pricing Model</label>
                                <select
                                    value={formData.pricingModel}
                                    onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value as any })}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="FIXED">Fixed Price</option>
                                    <option value="HOURLY">Hourly Rate</option>
                                    <option value="QUOTE_BASED">Contact for Quote</option>
                                </select>
                            </div>

                            {formData.pricingModel !== 'QUOTE_BASED' && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">
                                        {formData.pricingModel === 'HOURLY' ? 'Hourly Rate (R)' : 'Price (R)'}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="0.00"
                                    />
                                </div>
                            )}
                        </div>

                        {formData.pricingModel === 'FIXED' && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Unit (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.unit || ''}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="e.g., per item, per sq meter"
                                />
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Service'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {services.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No services added yet.</p>
                        <p className="text-sm text-muted-foreground mt-1">Add your first service to get started.</p>
                    </div>
                ) : (
                    services.map((service) => (
                        <div key={service.id} className="flex justify-between items-start p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                            <div>
                                <h3 className="font-medium text-foreground">{service.title}</h3>
                                {service.description && <p className="text-sm text-muted-foreground mt-1">{service.description}</p>}
                                <div className="mt-2 text-sm font-medium text-primary">
                                    {service.pricingModel === 'QUOTE_BASED' ? (
                                        'Contact for Quote'
                                    ) : (
                                        <>
                                            R{service.price}
                                            {service.pricingModel === 'HOURLY' ? '/hr' : service.unit ? ` ${service.unit}` : ''}
                                        </>
                                    )}
                                </div>
                            </div>
                            <Button
                                onClick={() => handleDelete(service.id)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                Delete
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
