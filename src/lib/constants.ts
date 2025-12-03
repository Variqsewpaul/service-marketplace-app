// Service Categories organized by industry
export const SERVICE_CATEGORIES = [
    // Home Services
    'Plumbing',
    'Electrical',
    'HVAC',
    'Roofing',
    'Painting',
    'Carpentry',
    'Flooring',
    'Tiling',

    // Cleaning & Maintenance
    'House Cleaning',
    'Office Cleaning',
    'Carpet Cleaning',
    'Window Cleaning',
    'Gardening',
    'Landscaping',
    'Pool Maintenance',

    // Moving & Logistics
    'Moving Services',
    'Delivery',
    'Storage',
    'Packing',

    // Personal Services
    'Tutoring',
    'Personal Training',
    'Beauty & Hair',
    'Photography',
    'Event Planning',

    // Professional Services
    'IT Support',
    'Web Development',
    'Graphic Design',
    'Accounting',
    'Legal Services',
    'Marketing',

    // Automotive
    'Auto Repair',
    'Car Wash',
    'Mobile Mechanic',

    // Other
    'Handyman',
    'Pet Services',
    'Catering',
    'Other'
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
