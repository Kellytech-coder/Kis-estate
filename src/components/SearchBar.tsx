"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Home, DollarSign } from "lucide-react";
import { usePropertyStore, ListingType } from "@/store/propertyStore";

interface SearchBarProps {
  initialType?: "all" | ListingType;
  compact?: boolean;
}

export default function SearchBar({
  initialType = "all",
  compact = false,
}: SearchBarProps) {
  const router = useRouter();
  const { filters, setFilters } = usePropertyStore();

  const [activeType, setActiveType] = useState<"all" | ListingType>(
    initialType !== "all" ? initialType : filters.type || "all"
  );
  const [city, setCity] = useState(filters.city || "all");
  const [propertyType, setPropertyType] = useState(filters.propertyType || "all");
  const [priceTier, setPriceTier] = useState<string>("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    if (activeType === "rent") {
      if (priceTier === "under-3k") {
        maxPrice = 3000;
      } else if (priceTier === "3k-6k") {
        minPrice = 3000;
        maxPrice = 6000;
      } else if (priceTier === "6k-plus") {
        minPrice = 6000;
      }
    } else {
      if (priceTier === "under-1m") {
        maxPrice = 1000000;
      } else if (priceTier === "1m-3m") {
        minPrice = 1000000;
        maxPrice = 3000000;
      } else if (priceTier === "3m-plus") {
        minPrice = 3000000;
      }
    }

    setFilters({
      type: activeType,
      city,
      propertyType,
      search: filters.search,
      minPrice,
      maxPrice,
    });

    if (activeType === "buy") {
      router.push("/buy");
    } else if (activeType === "rent") {
      router.push("/rent");
    } else {
      router.push("/properties");
    }
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100/80 p-3 sm:p-5 transition-all ${
        compact ? "max-w-4xl" : "max-w-5xl"
      }`}
    >
      {/* Type Toggle Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(
          [
            { id: "all", label: "All Properties" },
            { id: "buy", label: "Buy" },
            { id: "rent", label: "Rent" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveType(tab.id);
              setPriceTier("all");
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              activeType === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Search Form Inputs */}
      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2 items-center"
      >
        {/* City / Location Input */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <label
              htmlFor="city-select"
              className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500"
            >
              Location
            </label>
            <select
              id="city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">All Cities</option>
              <option value="New York">New York, NY</option>
              <option value="Beverly Hills">Beverly Hills, CA</option>
              <option value="Miami">Miami, FL</option>
              <option value="Austin">Austin, TX</option>
              <option value="San Francisco">San Francisco, CA</option>
              <option value="Seattle">Seattle, WA</option>
              <option value="Chicago">Chicago, IL</option>
              <option value="Los Angeles">Los Angeles, CA</option>
            </select>
          </div>
        </div>

        {/* Property Type Dropdown */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <Home className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <label
              htmlFor="property-type-select"
              className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500"
            >
              Property Type
            </label>
            <select
              id="property-type-select"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer capitalize truncate"
            >
              <option value="all">All Property Types</option>
              <option value="villa">Luxury Villa</option>
              <option value="house">Single Family House</option>
              <option value="apartment">Modern Apartment</option>
              <option value="penthouse">Sky Penthouse</option>
              <option value="condo">Luxury Condo</option>
              <option value="townhouse">Historic Townhouse</option>
            </select>
          </div>
        </div>

        {/* Price Range Dropdown */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <DollarSign className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <label
              htmlFor="price-tier-select"
              className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500"
            >
              Price Range
            </label>
            <select
              id="price-tier-select"
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">Any Price</option>
              {activeType === "rent" ? (
                <>
                  <option value="under-3k">Under $3,000 / mo</option>
                  <option value="3k-6k">$3,000 - $6,000 / mo</option>
                  <option value="6k-plus">$6,000+ / mo</option>
                </>
              ) : (
                <>
                  <option value="under-1m">Under $1,000,000</option>
                  <option value="1m-3m">$1,000,000 - $3,000,000</option>
                  <option value="3m-plus">$3,000,000+</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Submit Search Button */}
        <div className="w-full">
          <button
            type="submit"
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
          >
            <Search className="w-5 h-5" />
            <span>Search Properties</span>
          </button>
        </div>
      </form>
    </div>
  );
}

