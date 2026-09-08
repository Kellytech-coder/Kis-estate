"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Heart,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Property, usePropertyStore } from "@/store/propertyStore";
import { formatPrice, formatNumber, useIsMounted } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export default function PropertyCard({ property, className = "" }: PropertyCardProps) {
  const { toggleFavorite, isFavorite } = usePropertyStore();
  const mounted = useIsMounted();

  const favorited = mounted ? isFavorite(property.id) : false;

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${className}`}
    >
      {/* Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Badges - Top Left */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-sm ${
              property.type === "buy"
                ? "bg-indigo-600/90 text-white"
                : "bg-emerald-600/90 text-white"
            }`}
          >
            {property.type === "buy" ? "For Sale" : "For Rent"}
          </span>

          {property.featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}

          {property.status !== "available" && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600/90 text-white backdrop-blur-md uppercase">
              {property.status}
            </span>
          )}
        </div>

        {/* Favorite Button - Top Right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 ${
            favorited
              ? "bg-white text-rose-500 shadow-md scale-110"
              : "bg-white/80 text-gray-700 hover:bg-white hover:text-rose-500 hover:scale-110"
          }`}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>

        {/* Property Type Badge - Bottom Left on Image */}
        <div className="absolute bottom-3 left-3.5">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-black/60 text-white backdrop-blur-md capitalize">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        {/* Price & Status */}
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <div className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {formatPrice(property.price, property.type)}
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/properties/${property.id}`}
          className="group-hover:text-indigo-600 transition-colors"
        >
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 leading-snug">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5 mb-4">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="truncate">
            {property.location.address}, {property.location.city},{" "}
            {property.location.state}
          </span>
        </div>

        {/* Specs Bar (Beds, Baths, SqFt) */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-gray-50 rounded-xl text-gray-700 text-xs font-medium mt-auto mb-4 border border-gray-100">
          <div className="flex items-center justify-center gap-1.5">
            <Bed className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-x border-gray-200">
            <Bath className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Square className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{formatNumber(property.areaSqFt)} sqft</span>
          </div>
        </div>

        {/* Card Footer: Agent info & View details */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden relative bg-gray-200 shrink-0">
              <Image
                src={property.agent.avatar}
                alt={property.agent.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-gray-600 font-medium truncate max-w-[120px]">
              {property.agent.name}
            </span>
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-700 group/btn"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

