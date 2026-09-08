"use client";

import {
  usePropertyStore,
  PropertyType,
  FilterState,
} from "@/store/propertyStore";
import {
  RotateCcw,
  SlidersHorizontal,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";

interface PropertyFilterProps {
  className?: string;
  hideTypeSelect?: boolean; // When rendered on /buy or /rent pages
}

const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: "house", label: "House" },
  { id: "apartment", label: "Apartment" },
  { id: "villa", label: "Villa" },
  { id: "penthouse", label: "Penthouse" },
  { id: "condo", label: "Condo" },
  { id: "townhouse", label: "Townhouse" },
];

const CITIES = [
  "New York",
  "Beverly Hills",
  "Miami",
  "Austin",
  "San Francisco",
  "Seattle",
  "Chicago",
  "Los Angeles",
];

export default function PropertyFilter({
  className = "",
  hideTypeSelect = false,
}: PropertyFilterProps) {
  const { filters, setFilter, resetFilters } = usePropertyStore();

  // Compute active filters count
  let activeFiltersCount = 0;
  if (filters.search) activeFiltersCount++;
  if (filters.type !== "all" && !hideTypeSelect) activeFiltersCount++;
  if (filters.propertyType !== "all") activeFiltersCount++;
  if (filters.city !== "all") activeFiltersCount++;
  if (filters.bedrooms !== "any") activeFiltersCount++;
  if (filters.bathrooms !== "any") activeFiltersCount++;
  if (filters.minPrice !== null) activeFiltersCount++;
  if (filters.maxPrice !== null) activeFiltersCount++;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-6 ${className}`}
    >
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-base">Filter Properties</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          Keyword Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search by title, street, or feature..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Listing Type (Buy vs Rent) */}
      {!hideTypeSelect && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
            Listing Intent
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl">
            {(
              [
                { id: "all", label: "All" },
                { id: "buy", label: "Buy" },
                { id: "rent", label: "Rent" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter("type", item.id)}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filters.type === item.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* City / Location */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          City / Metro
        </label>
        <div className="relative">
          <select
            value={filters.city}
            onChange={(e) => setFilter("city", e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Available Cities</option>
            {CITIES.map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          Property Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFilter("propertyType", "all")}
            className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
              filters.propertyType === "all"
                ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>All Types</span>
            {filters.propertyType === "all" && <Check className="w-3.5 h-3.5" />}
          </button>
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt.id}
              type="button"
              onClick={() => setFilter("propertyType", pt.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                filters.propertyType === pt.id
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{pt.label}</span>
              {filters.propertyType === pt.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                setFilter(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                setFilter(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          Bedrooms
        </label>
        <div className="flex rounded-xl bg-gray-100 p-1">
          {["any", "1", "2", "3", "4+"].map((bed) => (
            <button
              key={bed}
              type="button"
              onClick={() => setFilter("bedrooms", bed)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filters.bedrooms === bed
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {bed === "any" ? "Any" : bed}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          Bathrooms
        </label>
        <div className="flex rounded-xl bg-gray-100 p-1">
          {["any", "1", "2", "3", "4+"].map((bath) => (
            <button
              key={bath}
              type="button"
              onClick={() => setFilter("bathrooms", bath)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filters.bathrooms === bath
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {bath === "any" ? "Any" : bath}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
          Sort Results By
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilter("sortBy", e.target.value as FilterState["sortBy"])
            }
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Listed</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
