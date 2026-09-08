"use client";

import { useState, useMemo } from "react";
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  SearchX,
  RotateCcw,
} from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilter from "@/components/PropertyFilter";
import { usePropertyStore } from "@/store/propertyStore";

export default function PropertiesPage() {
  const { properties, filters, resetFilters } = usePropertyStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Apply filters and sorting
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => {
        // Keyword Search
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = prop.title.toLowerCase().includes(q);
          const matchDesc = prop.description.toLowerCase().includes(q);
          const matchCity = prop.location.city.toLowerCase().includes(q);
          const matchAddr = prop.location.address.toLowerCase().includes(q);
          const matchAmenity = prop.amenities.some((a) =>
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
        if (filters.city !== "all" && prop.location.city !== filters.city) {
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
        if (filters.sortBy === "newest")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        // default "featured": featured items first, then newer
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [properties, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Heading */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Explore Properties
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Browse luxury homes, penthouses, and private estates available for sale
          and rent.
        </p>
      </div>

      {/* Controls Bar: Count, Mobile filter toggle, View mode switcher */}
      <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            Showing {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "Property" : "Properties"}
          </span>
          {filters.type !== "all" && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700 capitalize">
              {filters.type === "buy" ? "For Sale" : "For Rent"}
            </span>
          )}
          {filters.city !== "all" && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
              {filters.city}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            Filters
          </button>

          {/* View Mode Toggle (Grid vs List) */}
          <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-28">
          <PropertyFilter />
        </aside>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-6 space-y-4 animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <PropertyFilter />
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl text-center shadow"
              >
                Apply & View Results
              </button>
            </div>
          </div>
        )}

        {/* Property Grid or Empty State */}
        <div className="lg:col-span-3">
          {filteredProperties.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  className={viewMode === "list" ? "sm:flex-row sm:aspect-auto" : ""}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 px-6 text-center bg-white rounded-2xl border border-dashed border-gray-300 space-y-4">
              <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <SearchX className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                No properties match your filters
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Try widening your price range, choosing different bedroom options,
                or removing specific location filters.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

