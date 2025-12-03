import { ServiceOffering } from "@prisma/client";

export default function ServiceList({ services }: { services: ServiceOffering[] }) {
    if (services.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden text-slate-100">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <h2 className="text-xl font-semibold text-white">Services & Pricing</h2>
            </div>
            <div className="divide-y divide-slate-800">
                {services.map((service) => (
                    <div key={service.id} className="p-6 hover:bg-slate-800/50 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-medium text-white text-lg">{service.title}</h3>
                                {service.description && (
                                    <p className="text-slate-400 mt-1">{service.description}</p>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <div className="font-semibold text-primary text-lg">
                                    {service.pricingModel === 'QUOTE_BASED' ? (
                                        'Contact for Quote'
                                    ) : (
                                        <>
                                            R{service.price}
                                            <span className="text-sm text-slate-400 font-normal">
                                                {service.pricingModel === 'HOURLY' ? '/hr' : service.unit ? ` ${service.unit}` : ''}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                                    {service.pricingModel === 'FIXED' ? 'Fixed Price' :
                                        service.pricingModel === 'HOURLY' ? 'Hourly Rate' : 'Estimate'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
