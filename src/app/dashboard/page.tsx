"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Calendar,
  User as UserIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import PropertyCard from "@/components/PropertyCard";
import { useIsMounted } from "@/lib/utils";

export default function DashboardPage() {
  const {
    properties,
    favorites,
    inquiries,
    currentUser,
    login,
  } = usePropertyStore();

  const [activeTab, setActiveTab] = useState<"favorites" | "tours" | "settings">(
    "favorites"
  );
  const mounted = useIsMounted();

  // Profile Form state
  const [userName, setUserName] = useState(currentUser?.name || "Jane Buyer");
  const [userEmail, setUserEmail] = useState(
    currentUser?.email || "jane.buyer@example.com"
  );
  const [profileSaved, setProfileSaved] = useState(false);

  // If no user is logged in, default to Jane Buyer demo user or prompt
  const user = currentUser || {
    id: "guest",
    name: "Jane Buyer",
    email: "jane.buyer@example.com",
    role: "user" as const,
  };

  const favoriteProperties = properties.filter((p) =>
    favorites.includes(p.id)
  );

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    login(userEmail, user.role, userName);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-100 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">
                {user.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 capitalize">
                {user.role} Member
              </span>
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
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
            <div className="text-xs text-gray-500 font-medium">Tours & Inquiries</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
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
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "tours"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Tours & Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Preferences</span>
        </button>
      </div>

      {/* Tab 1: Saved Favorites */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          {favoriteProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteProperties.map((property) => (
                <div key={property.id} className="relative group">
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 px-6 text-center bg-white rounded-3xl border border-dashed border-gray-300 space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                You haven&apos;t saved any properties yet
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Explore our catalog of luxury estates, penthouses, and apartments,
                and click the heart icon to save your favorites here.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
              >
                <span>Browse All Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Tours & Inquiries */}
      {activeTab === "tours" && (
        <div className="space-y-6">
          {inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    {inq.propertyImage && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={inq.propertyImage}
                          alt={inq.propertyTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            inq.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : inq.status === "completed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {inq.status}
                        </span>
                        {inq.tourType && (
                          <span className="text-xs text-indigo-600 font-medium capitalize">
                            {inq.tourType} Tour
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-gray-900">
                        {inq.propertyTitle}
                      </h4>

                      {inq.tourDate && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>
                            Scheduled: {inq.tourDate} at {inq.tourTime || "10:00 AM"}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-gray-500 italic pt-1">
                        &quot;{inq.message}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                    <Link
                      href={`/properties/${inq.propertyId}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-indigo-600 font-semibold text-xs rounded-xl border border-gray-200 transition-colors"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 px-6 text-center bg-white rounded-3xl border border-dashed border-gray-300 space-y-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                No tour inquiries requested
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                When you request private in-person or video walkthroughs from a
                property page, your appointments will appear here.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
              >
                <span>Find Properties to Tour</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Settings & Preferences */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Account Preferences
            </h3>
            <p className="text-xs text-gray-500">
              Manage your personal details and property notification alerts.
            </p>
          </div>

          {profileSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile information successfully updated.</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Full Display Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Contact Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Notifications
              </h4>
              <label className="flex items-center gap-3 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Email me when saved properties change status or drop in price</span>
              </label>
              <label className="flex items-center gap-3 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Send SMS reminders 2 hours before scheduled tours</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

