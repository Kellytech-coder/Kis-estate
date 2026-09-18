"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  LogIn,
  Loader2,
  LogOut,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/PropertyCard";
import { useIsMounted } from "@/lib/utils";

export default function DashboardPage() {
  const {
    properties,
    favorites,
    inquiries,
    fetchInquiries,
    currentUser,
    isLoadingUser,
    logout,
  } = usePropertyStore();

  const [activeTab, setActiveTab] = useState<"favorites" | "tours">("favorites");
  const mounted = useIsMounted();

  useEffect(() => {
    if (currentUser) {
      void fetchInquiries();
    }
  }, [currentUser, fetchInquiries]);

  const favoriteProperties = properties.filter((p) =>
    favorites.includes(p.id)
  );

  // 1. Loading State
  if (isLoadingUser && !mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading user dashboard...</p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!currentUser && mounted) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <LogIn className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Sign In to Access Dashboard
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Create an account or sign in to access your saved favorite residences, scheduled tour walkthroughs, and personal inquiries.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center py-2 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            Don&apos;t have an account? Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-100 shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {currentUser?.name || "Client Member"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 capitalize">
                {currentUser?.role || "user"} Member
              </span>
            </div>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>
        </div>

        {/* Quick Stats & Signout */}
        <div className="flex items-center gap-6 self-stretch md:self-auto justify-around border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <div className="text-2xl font-black text-gray-900">
              {mounted ? favorites.length : 0}
            </div>
            <div className="text-xs text-gray-500 font-medium">Saved Homes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gray-900">
              {inquiries.length}
            </div>
            <div className="text-xs text-gray-500 font-medium">Tours &amp; Inquiries</div>
          </div>
          <button
            onClick={() => void logout()}
            className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-5 py-3 font-bold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "favorites"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Residences ({mounted ? favoriteProperties.length : 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("tours")}
          className={`px-5 py-3 font-bold text-xs border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "tours"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tour Schedules &amp; Requests ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: FAVORITES */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          {favoriteProperties.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  No Saved Properties Yet
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click the heart icon on any estate or rental to bookmark it here for quick review.
                </p>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                <span>Browse Available Residences</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TOURS & INQUIRIES */}
      {activeTab === "tours" && (
        <div className="space-y-6">
          {inquiries.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  No Tour Requests Scheduled
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When you request a private viewing or live video walkthrough, your itinerary will be tracked here.
                </p>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                <span>Schedule a Private Tour</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                        {inq.tourType || "inquiry"}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base">
                        {inq.propertyTitle}
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${
                        inq.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : inq.status === "completed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  {inq.tourDate && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl">
                      <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        Date: {inq.tourDate} {inq.tourTime ? `at ${inq.tourTime}` : ""}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 italic bg-gray-50/60 p-3 rounded-xl">
                    &ldquo;{inq.message}&rdquo;
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/properties/${inq.propertyId}`}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      <span>View Property Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
