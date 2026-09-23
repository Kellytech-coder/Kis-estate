"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Building2,
  Loader2,
  SearchX,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/PropertyCard";

const NIGERIAN_CITIES = [
  "all",
  "Lekki",
  "Ikoyi",
  "Victoria Island",
  "Ikeja",
  "Ajah",
  "Maitama",
  "Asokoro",
  "Guzape",
  "Port Harcourt",
  "Ibadan",
  "Enugu",
];

export default function RentPage() {
  const { properties, isLoadingProperties } = usePropertyStore();

  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const rentProperties = useMemo(() => {
    return properties
      .filter((p) => p.type === "rent")
      .filter((p) => {
        if (selectedCity === "all") return true;
        const c = p.location?.city?.toLowerCase() || "";
        return c.includes(selectedCity.toLowerCase());
      })
      .filter((p) => (selectedType === "all" ? true : p.propertyType === selectedType));
  }, [properties, selectedCity, selectedType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nigerian Luxury Rental Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Curated Serviced Residences For Rent
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Experience premium living in Nigeria&apos;s prime business and diplomatic districts. Explore serviced penthouses in Victoria Island, waterfront duplexes in Ikoyi &amp; Lekki, and executive apartments in Asokoro, Abuja.
          </p>
        </div>
      </div>

      {/* Renter Concierge Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">24/7 Guaranteed Power</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            All listed rental residences feature dual central generators, dedicated transformers, and solar inverter backup.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Furnished &amp; Serviced</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Turnkey executive options with fitted Italian kitchens, high-speed fiber internet, and professional facility management.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Verified Landlords</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Direct lease agreements with verified property owners. Zero hidden agency disputes or double-letting scams.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Instant Tour Bookings</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Schedule physical inspection dates or direct 4K video walkthroughs with property hosts in seconds.
          </p>
        </div>
      </div>

      {/* Rental Residences Catalog */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Available Residences For Rent (₦ / Year)
            </h2>
            <p className="text-xs text-gray-500">
              Showing {rentProperties.length} verified rental listings across Nigeria
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {NIGERIAN_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === city
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {city === "all" ? "All Cities" : city}
              </button>
            ))}
          </div>
        </div>

        {isLoadingProperties && properties.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading verified Nigerian rental properties...</p>
          </div>
        ) : rentProperties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
            <SearchX className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-lg font-bold text-gray-900">No rental properties found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We couldn&apos;t find any rental properties matching &ldquo;{selectedCity}&rdquo;. Try selecting All Cities.
            </p>
            <button
              onClick={() => setSelectedCity("all")}
              className="py-2 px-4 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Clear City Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
