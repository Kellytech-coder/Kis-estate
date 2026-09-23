"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Users2,
  MapPin,
  Loader2,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { usePropertyStore } from "@/store/propertyStore";

export default function HomePage() {
  const { properties, isLoadingProperties } = usePropertyStore();
  const [featuredTab, setFeaturedTab] = useState<"all" | "buy" | "rent">("all");

  const featuredProperties = properties
    .filter((p) => p.featured)
    .filter((p) => (featuredTab === "all" ? true : p.type === featuredTab))
    .slice(0, 6);

  // If no featured exist yet, fall back to top properties
  const displayProperties =
    featuredProperties.length > 0
      ? featuredProperties
      : properties.filter((p) => (featuredTab === "all" ? true : p.type === featuredTab)).slice(0, 6);

  const cityHighlights = [
    {
      city: "Ikoyi",
      state: "Lagos",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location?.city?.toLowerCase() === "ikoyi").length,
    },
    {
      city: "Lekki",
      state: "Lagos",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location?.city?.toLowerCase() === "lekki").length,
    },
    {
      city: "Maitama",
      state: "Abuja",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location?.city?.toLowerCase() === "maitama").length,
    },
    {
      city: "Port Harcourt",
      state: "Rivers",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location?.city?.toLowerCase() === "port harcourt").length,
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center bg-gray-950 text-white overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt="Nigerian Luxury Real Estate"
            fill
            priority
            className="object-cover object-center brightness-[0.38]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-center flex flex-col items-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Collection of Premier Nigerian Real Estate</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Find Your Dream <span className="text-indigo-400">Home &amp; Sanctuary</span> in Nigeria
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-2xl font-light mb-10 leading-relaxed">
            Contemporary duplexes, serviced luxury apartments, and tranquil estates in Lagos, Abuja, Port Harcourt, and beyond. Verified titles with seamless tour scheduling.
          </p>

          {/* Floating Search Bar */}
          <div className="w-full flex justify-center">
            <SearchBar />
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mt-14 pt-10 border-t border-white/10 w-full max-w-4xl text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {properties.length > 0 ? `${properties.length}+` : "12+"}
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Verified Nigerian Listings
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                ₦50B+
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Portfolio Value
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                100%
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Title &amp; C of O Verified
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                24/7
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Real Estate Advisory
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Architectural Icons</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Featured Exclusive Residences
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setFeaturedTab("all")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                featuredTab === "all"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFeaturedTab("buy")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                featuredTab === "buy"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Sale
            </button>
            <button
              onClick={() => setFeaturedTab("rent")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                featuredTab === "rent"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Lease
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoadingProperties && properties.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading verified Nigerian residences from Firestore...</p>
          </div>
        ) : displayProperties.length === 0 ? (
          <div className="py-16 text-center bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
            <p className="text-sm font-semibold text-gray-700">No residences listed yet in this category.</p>
            <Link href="/properties" className="text-xs text-indigo-600 font-bold underline">
              View All Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-sm shadow-md transition-all group cursor-pointer"
          >
            <span>Explore All Nigerian Properties</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Explore by City Markets */}
      <section className="bg-gray-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Prime Nigerian Locations
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Explore Top Urban &amp; Waterfront Markets
            </h2>
            <p className="text-gray-400 text-sm font-light">
              From waterfront Banana Island &amp; Lekki duplexes to prestigious Maitama hills mansions in Abuja.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cityHighlights.map((market) => (
              <Link
                key={market.city}
                href={`/properties?city=${encodeURIComponent(market.city)}`}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-lg border border-white/10 hover:border-white/30 transition-all cursor-pointer"
              >
                <Image
                  src={market.image}
                  alt={market.city}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {market.city}, {market.state}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {market.city}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {market.count} Available Properties
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Verified Title Documents &amp; Due Diligence
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Every property undergoes title search at the State Lands Registry (Governor&apos;s Consent, C of O, Gazette) before approval.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Private Scheduled Physical &amp; Video Tours
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Schedule direct physical inspections with verified property owners or experience interactive 4K video walkthroughs.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Trusted Buyer &amp; Seller Advisory
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Full legal documentation assistance, deed of assignment processing, and secure escrow management.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
