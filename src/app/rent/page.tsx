"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  ShieldCheck,
  Dog,
  Clock,
  Building2,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/PropertyCard";

export default function RentPage() {
  const { properties } = usePropertyStore();

  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const rentProperties = useMemo(() => {
    return properties
      .filter((p) => p.type === "rent")
      .filter((p) => (selectedCity === "all" ? true : p.location.city === selectedCity))
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
          <h3 className="font-bold text-gray-900">Turnkey & Furnished</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Many residences feature bespoke interior architecture and custom
            furnishings ready for immediate move-in.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Dog className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Pet Accommodating</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Over 85% of our leased estates welcome pets with dedicated dog runs,
            private gardens, and pet grooming salons.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900">Verified Landlords</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Direct lease agreements with vetted institutional owners and private
            estate managers.
          </p>
        </div>
      </div>

      {/* Filter and Listings */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Active Leases Available ({rentProperties.length})
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              All prices reflect monthly rental rates inclusive of building amenities.
            </p>
          </div>

          {/* City & Type Filter Pills */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Cities" },
                { id: "Miami", label: "Miami" },
                { id: "New York", label: "New York" },
                { id: "San Francisco", label: "San Francisco" },
                { id: "Seattle", label: "Seattle" },
                { id: "Los Angeles", label: "Los Angeles" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCity(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCity === c.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Types" },
                { id: "villa", label: "Villas" },
                { id: "apartment", label: "Apartments" },
                { id: "house", label: "Houses" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedType === t.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rentProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </div>
    </div>
  );
}

