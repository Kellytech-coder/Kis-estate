"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  ShieldCheck,
  Dog,
  Clock,
  Building2,
  Loader2,
  SearchX,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/PropertyCard";

export default function RentPage() {
  const { properties, isLoadingProperties } = usePropertyStore();

  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const rentProperties = useMemo(() => {
    return properties
      .filter((p) => p.type === "rent")
      .filter((p) => (selectedCity === "all" ? true : p.location?.city === selectedCity))
      .filter((p) => (selectedType === "all" ? true : p.propertyType === selectedType));
  }, [properties, selectedCity, selectedType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Luxury Lease Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Curated Luxury Rental Residences
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Experience elevated living without long-term acquisition. Explore
            designer waterfront villas, high-rise penthouses, and chic urban lofts
            available for monthly and annual lease.
          </p>
        </div>
      </div>

      {/* Renter Concierge Advantages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">24-Hour Approval</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Streamlined digital application process with rapid verification and
            instant background validation.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Turnkey &amp; Furnished</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Many residences feature bespoke interior architecture and custom
            furnishings ready for immediate move-in.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Dog className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Pet Friendly</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Select properties welcome pets with private gardens, dog parks, and on-site pet spa amenities.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Dedicated Concierge</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Full-service tenant concierge for maintenance, deliveries, and priority reservations.
          </p>
        </div>
      </div>

      {/* Rental Residences Catalog */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Available Luxury Residences For Lease
            </h2>
            <p className="text-xs text-gray-500">
              Showing {rentProperties.length} verified rentals nationwide
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Market:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Cities</option>
                <option value="Miami">Miami</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Seattle">Seattle</option>
                <option value="Los Angeles">Los Angeles</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="villa">Villas</option>
                <option value="apartment">Apartments</option>
                <option value="house">Houses</option>
              </select>
            </div>
          </div>
        </div>

        {isLoadingProperties && properties.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading rental portfolio from database...</p>
          </div>
        ) : rentProperties.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 p-8 space-y-3 shadow-sm">
            <SearchX className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-900 text-sm">No rentals match your selected filters</h3>
            <button
              onClick={() => {
                setSelectedCity("all");
                setSelectedType("all");
              }}
              className="text-xs text-emerald-600 font-bold underline"
            >
              Reset filters
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
