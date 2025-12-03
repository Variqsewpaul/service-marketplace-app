'use client';

import { SERVICE_CATEGORIES } from '@/lib/constants';

type LeadFiltersProps = {
    selectedCategory: string;
    showAllCategories: boolean;
    location: string;
    onCategoryChange: (category: string) => void;
    onShowAllCategoriesChange: (showAll: boolean) => void;
    onLocationChange: (location: string) => void;
    onClearFilters: () => void;
    providerCategory?: string;
};

export default function LeadFilters({
    selectedCategory,
    showAllCategories,
    location,
    onCategoryChange,
    onShowAllCategoriesChange,
    onLocationChange,
    onClearFilters,
    providerCategory,
}: LeadFiltersProps) {
    const hasActiveFilters = location || (selectedCategory !== providerCategory) || showAllCategories;

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filter Leads</h2>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Category Filter */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        disabled={showAllCategories}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {SERVICE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    {providerCategory && selectedCategory === providerCategory && !showAllCategories && (
                        <p className="mt-1 text-xs text-gray-500">
                            Showing leads matching your category
                        </p>
                    )}
                </div>

                {/* Location Filter */}
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => onLocationChange(e.target.value)}
                        placeholder="e.g. Johannesburg"
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-400"
                    />
                </div>

                {/* Show All Categories Toggle */}
                <div className="flex items-end">
                    <label className="flex items-center cursor-pointer w-full">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={showAllCategories}
                                onChange={(e) => onShowAllCategoriesChange(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            Show All Categories
                        </span>
                    </label>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                        {showAllCategories && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                All Categories
                            </span>
                        )}
                        {!showAllCategories && selectedCategory !== providerCategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {selectedCategory}
                            </span>
                        )}
                        {location && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                📍 {location}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
