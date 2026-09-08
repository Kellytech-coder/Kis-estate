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
  TrendingUp,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { usePropertyStore } from "@/store/propertyStore";

export default function HomePage() {
  const { properties, setFilter } = usePropertyStore();
  const [featuredTab, setFeaturedTab] = useState<"all" | "buy" | "rent">("all");

  const featuredProperties = properties
    .filter((p) => p.featured)
    .filter((p) => (featuredTab === "all" ? true : p.type === featuredTab))
    .slice(0, 6);

  const cityHighlights = [
    {
      city: "Beverly Hills",
      state: "CA",
      image:
        "https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location.city === "Beverly Hills").length,
    },
    {
      city: "New York",
      state: "NY",
      image:
        "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location.city === "New York").length,
    },
    {
      city: "Miami",
      state: "FL",
      image:
        "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location.city === "Miami").length,
    },
    {
      city: "Austin",
      state: "TX",
      image:
        "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=800&q=80",
      count: properties.filter((p) => p.location.city === "Austin").length,
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
            alt="Luxury Architecture"
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
            <span>Curated Collection of Premier Real Estate</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Find Your Next <span className="text-indigo-400">Sanctuary</span> in
            the City or Coast
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-2xl font-light mb-10 leading-relaxed">
            Unrivaled luxury homes, modern high-rise penthouses, and tranquil
            estates. Verified properties with seamless tour scheduling.
          </p>

          {/* Floating Search Bar */}
          <div className="w-full flex justify-center">
            <SearchBar />
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 mt-14 pt-10 border-t border-white/10 w-full max-w-4xl text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                1,500+
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Curated Listings
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                $4.2B+
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Property Volume Sold
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                99.2%
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Client Satisfaction
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                24/7
              </div>
              <div className="text-xs text-gray-400 font-medium mt-0.5">
                Concierge Advisory
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Highlights</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Featured Exclusive Residences
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start md:self-auto">
            {(
              [
                { id: "all", label: "All Properties" },
                { id: "buy", label: "For Sale" },
                { id: "rent", label: "For Rent" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFeaturedTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  featuredTab === tab.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md transition-all hover:gap-3"
          >
            <span>Explore All {properties.length} Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Explore Top Cities */}
      <section className="bg-gray-50 py-20 border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Explore Premier Destinations
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Browse top luxury neighborhoods and vibrant metropolitan centers
              where we maintain active private portfolios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cityHighlights.map((dest) => (
              <Link
                key={dest.city}
                href={`/properties?city=${encodeURIComponent(dest.city)}`}
                onClick={() => setFilter("city", dest.city)}
                className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
              >
                <Image
                  src={dest.image}
                  alt={dest.city}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {dest.city}, {dest.state}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{dest.city}</h3>
                  <p className="text-xs text-gray-300 mt-1">
                    {dest.count > 0
                      ? `${dest.count} Active Properties`
                      : "Curated Listings Available"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Why Discerning Clients Choose HavenEstate
          </h2>
          <p className="text-gray-600 text-base mt-3">
            A boutique real estate service with modern technology and white-glove
            personalized representation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              100% Verified Listings
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every home undergoes extensive due diligence and high-resolution
              inspection before listing.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Private Scheduled Tours
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Book private in-person walkthroughs or guided 4K virtual tours on
              your schedule.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Transparent Pricing
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              No hidden fees or surprises. View full comps, HOA records, and
              historical valuations.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Dedicated Elite Agents
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Work with the top 1% producing agents in each metro area with deep
              local insight.
            </p>
          </div>
        </div>
      </section>

      {/* Property Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-8 sm:p-14 lg:p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              For Property Owners & Investors
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Looking to Sell or Lease Your Luxury Residence?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Partner with HavenEstate to market your property to qualified high-net-worth
              buyers and corporate tenants worldwide.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/admin"
              className="px-6 py-3.5 bg-white text-indigo-900 font-bold rounded-xl text-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              List a Property
            </Link>
            <Link
              href="/properties"
              className="px-6 py-3.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold rounded-xl text-center border border-indigo-500/50 transition-colors"
            >
              Browse Network
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

