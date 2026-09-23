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
  User as UserIcon,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/PropertyCard";
import { useIsMounted } from "@/lib/utils";
import { authApi } from "@/lib/api";

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

  const [activeTab, setActiveTab] = useState<"favorites" | "tours" | "profile">("favorites");
  const mounted = useIsMounted();

  // Profile Edit State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      void fetchInquiries();
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setPreferredCity(currentUser.preferredCity || "Lagos");
    }
  }, [currentUser, fetchInquiries]);

  const favoriteProperties = properties.filter((p) =>
    favorites.includes(p.id)
  );

  const isSeller =
    currentUser?.role?.toUpperCase() === "SELLER_PROPERTY_OWNER" ||
    currentUser?.role?.toUpperCase() === "SELLER";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      await authApi.updateProfile({
        name,
        phone,
        preferredCity,
      });
      setProfileMsg({ type: "success", text: "Your profile details have been updated successfully!" });
    } catch (err: unknown) {
      setProfileMsg({ type: "error", text: (err as Error)?.message || "Failed to update profile." });
    } finally {
      setIsSavingProfile(false);
    }
  };

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
            Create an account or sign in to access your saved favorite Nigerian residences, scheduled tour walkthroughs, and personal inquiries.
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {currentUser?.name || "Client Member"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 capitalize">
                {isSeller ? "Property Owner / Seller" : "Buyer / Renter"}
              </span>
            </div>
            <p className="text-sm text-gray-500">{currentUser?.email}</p>
          </div>
        </div>

        {/* Quick Stats & Seller CTA */}
        <div className="flex flex-wrap items-center gap-6 self-stretch md:self-auto justify-around border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
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
          {isSeller && (
            <Link
              href="/seller"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Seller Studio</span>
            </Link>
          )}
          <button
            onClick={() => void logout()}
            title="Sign Out"
            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "favorites"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Residences ({mounted ? favorites.length : 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("tours")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "tours"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Inquiries &amp; Tours ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* TAB 1: SAVED FAVORITES */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          {favoriteProperties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Saved Residences Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore our curated portfolio of Nigerian luxury properties in Lagos, Abuja, Port Harcourt, and click the heart icon on any property card to save it here.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <span>Browse Nigerian Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY INQUIRIES & TOURS */}
      {activeTab === "tours" && (
        <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Scheduled Tours &amp; Direct Inquiries
              </h3>
              <p className="text-xs text-gray-500">
                Private viewing requests and agent inquiry history
              </p>
            </div>
            <Link
              href="/properties"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Book Another Tour
            </Link>
          </div>

          {inquiries.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Clock className="w-8 h-8 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-800">No Tour Inquiries Submitted</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                You haven&apos;t scheduled any private property tours yet. Find a property you like and book a viewing appointment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-6 hover:bg-gray-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 block">
                        {inq.propertyTitle}
                      </span>
                      <h4 className="text-sm font-extrabold text-gray-900">
                        {inq.tourType === "video" ? "4K Virtual Video Walkthrough" : "Private In-Person Tour"}
                      </h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize self-start sm:self-auto ${
                        inq.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : inq.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {inq.tourDate && (
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Date: {inq.tourDate}
                      </span>
                    )}
                    {inq.tourTime && (
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        Time: {inq.tourTime}
                      </span>
                    )}
                    <Link
                      href={`/properties/${inq.propertyId}`}
                      className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
                    >
                      <span>View Residence</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    &ldquo;{inq.message}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900">Personal Profile Settings</h3>
            <p className="text-xs text-gray-500">
              Manage your personal contact details and preferred Nigerian real estate locations.
            </p>
          </div>

          {profileMsg && (
            <div
              className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {profileMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ""}
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Nigerian Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Preferred Nigerian City / Area
              </label>
              <input
                type="text"
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                placeholder="e.g. Lekki, Ikoyi, Maitama, Port Harcourt"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Profile...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
