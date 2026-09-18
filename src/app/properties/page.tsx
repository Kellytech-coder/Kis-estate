"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  SearchX,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilter from "@/components/PropertyFilter";
import { usePropertyStore } from "@/store/propertyStore";

export default function PropertiesPage() {
  const {
    properties,
    isLoadingProperties,
    propertiesError,
    fetchProperties,
    filters,
    resetFilters,
  } = usePropertyStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Re-fetch on mount if empty
  useEffect(() => {
    if (properties.length === 0) {
      void fetchProperties();
    }
  }, [fetchProperties, properties.length]);

  // Apply client-side filters and sorting
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        // Keyword Search
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchDesc = prop.description.toLowerCase().includes(q);
          const matchCity = prop.location?.city?.toLowerCase()?.includes(q);
          const matchAddr = prop.location?.address?.toLowerCase()?.includes(q);
          const matchAmenity = prop.amenities?.some((a) =>
            a.toLowerCase().includes(q)
          );
          if (
            !matchTitle &&
            !matchDesc &&
            !matchCity &&
            !matchAddr &&
            !matchAmenity
          ) {
            return false;
          }
        }

        // Type: buy | rent
        if (filters.type !== "all" && prop.type !== filters.type) {
          return false;
        }

        // Property Type: house, villa, etc.
        if (
          filters.propertyType !== "all" &&
          prop.propertyType !== filters.propertyType
        ) {
          return false;
        }

        // City
        if (filters.city !== "all" && prop.location?.city !== filters.city) {
          return false;
        }

        // Bedrooms
        if (filters.bedrooms !== "any") {
          const minBeds = parseInt(filters.bedrooms);
          if (filters.bedrooms === "4+") {
            if (prop.bedrooms < 4) return false;
          } else if (prop.bedrooms !== minBeds) {
            return false;
          }
        }

        // Bathrooms
        if (filters.bathrooms !== "any") {
          const minBaths = parseInt(filters.bathrooms);
          if (filters.bathrooms === "4+") {
            if (prop.bathrooms < 4) return false;
          } else if (prop.bathrooms !== minBaths) {
            return false;
          }
        }

        // Price Range
        if (filters.minPrice !== null && prop.price < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== null && prop.price > filters.maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "price-asc") return a.price - b.price;
        if (filters.sortBy === "price-desc") return b.price - a.price;
        if (filters.sortBy === "newest") {
          const dateA = new Date(a.createdAt).getTime() || 0;
          const dateB = new Date(b.createdAt).getTime() || 0;
          return dateB - dateA;
        }
        return b.featured ? 1 : -1;
      });
  }, [properties, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Explore Properties
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover verified luxury estates, modern penthouses, and architectural homes.
          </p>
        </div>

        {/* View Switcher & Mobile Filter Trigger */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-xs border border-indigo-100"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Grid / List View Toggles */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-28">
          <PropertyFilter />
        </div>

        {/* Properties Grid / Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Count & Quick Reset */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing{" "}
              <strong className="text-gray-900">
                {filteredProperties.length}
              </strong>{" "}
              properties
            </span>
            {(filters.search ||
              filters.type !== "all" ||
              filters.propertyType !== "all" ||
              filters.city !== "all" ||
              filters.minPrice !== null ||
              filters.maxPrice !== null) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Error Banner */}
          {propertiesError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-700 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{propertiesError}</span>
              </div>
              <button
                onClick={() => void fetchProperties()}
                className="font-bold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoadingProperties && properties.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">
                Fetching properties from database...
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  No Properties Match Your Search
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your price range, city, or property type filters to explore more available estates.
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          ) : (
            /* Properties List / Grid */
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "flex flex-col gap-6"
              }
            >
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-bold text-gray-900 text-base">
                  Filter Properties
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <PropertyFilter />
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all"
              >
                Apply &amp; View {filteredProperties.length} Properties
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
