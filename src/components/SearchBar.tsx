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
      if (priceTier === "under-5m") {
        maxPrice = 5000000;
      } else if (priceTier === "5m-15m") {
        minPrice = 5000000;
        maxPrice = 15000000;
      } else if (priceTier === "15m-plus") {
        minPrice = 15000000;
      }
    } else {
      if (priceTier === "under-100m") {
        maxPrice = 100000000;
      } else if (priceTier === "100m-300m") {
        minPrice = 100000000;
        maxPrice = 300000000;
      } else if (priceTier === "300m-plus") {
        minPrice = 300000000;
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
            { id: "all", label: "All Nigerian Properties" },
            { id: "buy", label: "For Sale" },
            { id: "rent", label: "For Rent" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveType(tab.id);
              setPriceTier("all");
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
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
        {/* Nigerian City / Location Input */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <label
              htmlFor="city-select"
              className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500"
            >
              Location / City
            </label>
            <select
              id="city-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer truncate"
            >
              <option value="all">All Nigerian Locations</option>
              <option value="Lekki">Lekki, Lagos</option>
              <option value="Ikoyi">Ikoyi, Lagos</option>
              <option value="Victoria Island">Victoria Island, Lagos</option>
              <option value="Ikeja">Ikeja, Lagos</option>
              <option value="Ajah">Ajah &amp; Sangotedo, Lagos</option>
              <option value="Maitama">Maitama, Abuja</option>
              <option value="Asokoro">Asokoro, Abuja</option>
              <option value="Guzape">Guzape, Abuja</option>
              <option value="Port Harcourt">Port Harcourt, Rivers</option>
              <option value="Ibadan">Ibadan, Oyo</option>
              <option value="Enugu">Enugu, Enugu</option>
              <option value="Benin City">Benin City, Edo</option>
              <option value="Asaba">Asaba, Delta</option>
              <option value="Kano">Kano, Kano</option>
              <option value="Kaduna">Kaduna, Kaduna</option>
              <option value="Owerri">Owerri, Imo</option>
            </select>
          </div>
        </div>

        {/* Nigerian Property Type Dropdown */}
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
              <option value="duplex">Duplex</option>
              <option value="terrace">Terrace Duplex</option>
              <option value="flat">Flat / Apartment</option>
              <option value="mansion">Luxury Mansion</option>
              <option value="penthouse">Penthouse</option>
              <option value="bungalow">Bungalow</option>
              <option value="house">Detached House</option>
              <option value="land">Land / Plot</option>
              <option value="commercial">Commercial Property</option>
              <option value="office">Office Space</option>
            </select>
          </div>
        </div>

        {/* Naira Price Range Dropdown */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
          <DollarSign className="w-5 h-5 text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <label
              htmlFor="price-tier-select"
              className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500"
            >
              Price Range (₦)
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
                  <option value="under-5m">Under ₦5,000,000 / yr</option>
                  <option value="5m-15m">₦5M - ₦15,000,000 / yr</option>
                  <option value="15m-plus">₦15,000,000+ / yr</option>
                </>
              ) : (
                <>
                  <option value="under-100m">Under ₦100,000,000</option>
                  <option value="100m-300m">₦100M - ₦300,000,000</option>
                  <option value="300m-plus">₦300,000,000+</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Submit Search Button */}
        <div className="w-full">
          <button
            type="submit"
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Search className="w-5 h-5" />
            <span>Search Listings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
