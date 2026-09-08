"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Building,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  X,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  LogOut,
} from "lucide-react";

import {
  usePropertyStore,
  Property,
  PropertyType,
  ListingType,
  Inquiry,
} from "@/store/propertyStore";

import { formatCurrency, formatPrice } from "@/lib/utils";

/**
 * IMPORTANT:
 * The browser talks to the Node.js backend on port 4000.
 *
 * PostgreSQL is NOT accessed directly by the browser.
 * PostgreSQL normally runs on port 5432 and is accessed only
 * by the backend.
 */
const API_URL = "http://localhost:4000";

type AuthUser = {
  id?: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "AGENT";
};

type AuthMeResponse = {
  user?: AuthUser;
  error?: {
    message?: string;
  };
  message?: string;
};

export default function AdminPage() {
  const router = useRouter();

  const {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    inquiries,
    updateInquiryStatus,
    login,
    logout,
  } = usePropertyStore();

  const [authorizationChecked, setAuthorizationChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<"listings" | "inquiries">(
    "listings"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // =========================================
  // NEW PROPERTY FORM STATE
  // =========================================

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(1500000);

  const [newType, setNewType] = useState<ListingType>("buy");

  const [newPropertyType, setNewPropertyType] =
    useState<PropertyType>("house");

  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Beverly Hills");
  const [newState, setNewState] = useState("CA");
  const [newZip, setNewZip] = useState("90210");

  const [newBeds, setNewBeds] = useState(4);
  const [newBaths, setNewBaths] = useState(3);
  const [newSqFt, setNewSqFt] = useState(3200);
  const [newYearBuilt, setNewYearBuilt] = useState(2023);

  const [newImageUrl, setNewImageUrl] = useState(
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  );

  const [newFeatured, setNewFeatured] = useState(true);

  const [newAmenities, setNewAmenities] = useState(
    "Smart Home, Swimming Pool, Wine Cellar, 2-Car Garage"
  );

  // =========================================
  // VERIFY ADMINISTRATOR
  // =========================================

  useEffect(() => {
    let isMounted = true;

    const verifyAdministrator = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        let body: AuthMeResponse = {};

        try {
          body = (await response.json()) as AuthMeResponse;
        } catch {
          body = {};
        }

        if (
          response.ok &&
          body.user &&
          body.user.role === "ADMIN"
        ) {
          if (!isMounted) return;

          login(
            body.user.email,
            "admin",
            body.user.name
          );

          setIsAdmin(true);
          return;
        }

        if (isMounted) {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error(
          "Administrator verification failed:",
          error
        );

        if (isMounted) {
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setAuthorizationChecked(true);
        }
      }
    };

    void verifyAdministrator();

    return () => {
      isMounted = false;
    };
  }, [login]);

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      logout();
      setIsAdmin(false);
      router.replace("/admin/login");
      setIsLoggingOut(false);
    }
  };

  // =========================================
  // KPI CALCULATIONS
  // =========================================

  const totalListings = properties.length;

  const buyListings = properties.filter(
    (property: Property) => property.type === "buy"
  );

  const rentListings = properties.filter(
    (property: Property) => property.type === "rent"
  );

  const totalVolume = buyListings.reduce(
    (sum: number, property: Property) =>
      sum + Number(property.price),
    0
  );

  // =========================================
  // SEARCH
  // =========================================

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredListings = properties.filter(
    (property: Property) => {
      if (!normalizedSearchTerm) {
        return true;
      }

      return (
        property.title
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        property.location.city
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        property.location.address
          .toLowerCase()
          .includes(normalizedSearchTerm) ||
        property.location.state
          .toLowerCase()
          .includes(normalizedSearchTerm)
      );
    }
  );

  // =========================================
  // ADD PROPERTY
  // =========================================

  const handleAddPropertySubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const title = newTitle.trim();
    const address = newAddress.trim();
    const city = newCity.trim();

    if (!title || !address || !city) {
      return;
    }

    if (newPrice <= 0) {
      return;
    }

    if (newBeds < 0 || newBaths < 0 || newSqFt <= 0) {
      return;
    }

    addProperty({
      title,

      description:
        newDesc.trim() ||
        "Exquisite architectural residence with premium finishes.",

      price: Number(newPrice),

      type: newType,

      propertyType: newPropertyType,

      location: {
        address,
        city,
        state: newState.trim(),
        zipCode: newZip.trim(),
        country: "USA",
      },

      bedrooms: Number(newBeds),

      bathrooms: Number(newBaths),

      areaSqFt: Number(newSqFt),

      images: newImageUrl.trim()
        ? [newImageUrl.trim()]
        : [],

      featured: newFeatured,

      amenities: newAmenities
        .split(",")
        .map((amenity) => amenity.trim())
        .filter(Boolean),

      yearBuilt: Number(newYearBuilt),

      status: "available",

      agent: {
        name: "Platform Administrator",
        email: "admin@company.invalid",
        phone: "+1 (800) 555-0199",

        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",

        agency: "Haven Corporate Portfolio",
      },
    });

    // Close modal
    setIsAddModalOpen(false);

    // Reset form
    setNewTitle("");
    setNewDesc("");
    setNewPrice(1500000);
    setNewType("buy");
    setNewPropertyType("house");
    setNewAddress("");
    setNewCity("Beverly Hills");
    setNewState("CA");
    setNewZip("90210");
    setNewBeds(4);
    setNewBaths(3);
    setNewSqFt(3200);
    setNewYearBuilt(2023);

    setNewImageUrl(
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    );

    setNewFeatured(true);

    setNewAmenities(
      "Smart Home, Swimming Pool, Wine Cellar, 2-Car Garage"
    );
  };

  // =========================================
  // AUTHORIZATION LOADING
  // =========================================

  if (!authorizationChecked) {
    return (
      <div
        className="min-h-[75vh] flex items-center justify-center"
        aria-busy="true"
      >
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-gray-500 font-medium">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // ACCESS DENIED
  // =========================================

  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 text-center shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Access Restricted
            </h2>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              The Property Management Portal requires verified
              administrator credentials. Please sign in via the
              administrator authentication portal.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              href="/admin/login"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-100 transition-all block text-center"
            >
              Sign In with Admin Credentials
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-900 font-medium block text-center transition-colors"
            >
              Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // ADMIN DASHBOARD
  // =========================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Portal
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Property Management Portal
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Publish listings, update statuses, monitor tour requests,
            and evaluate portfolio volume.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-3 text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sign out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =====================================
          KPI CARDS
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Listings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">
              Total Active Portfolio
            </span>

            <Building className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="text-3xl font-black text-gray-900">
            {totalListings}
          </div>

          <p className="text-xs text-gray-400">
            {buyListings.length} For Sale •{" "}
            {rentListings.length} Rentals
          </p>
        </div>

        {/* Sale Volume */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">
              Sale Portfolio Volume
            </span>

            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="text-3xl font-black text-gray-900">
            {formatCurrency(totalVolume)}
          </div>

          <p className="text-xs text-gray-400">
            Cumulative for-sale asset value
          </p>
        </div>

        {/* Rentals */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">
              Rental Inventory
            </span>

            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>

          <div className="text-3xl font-black text-gray-900">
            {rentListings.length}
          </div>

          <p className="text-xs text-gray-400">
            Luxury leased residences
          </p>
        </div>

        {/* Inquiries */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">
              Inquiries & Tours
            </span>

            <Users className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="text-3xl font-black text-gray-900">
            {inquiries.length}
          </div>

          <p className="text-xs text-gray-400">
            Scheduled client walkthroughs
          </p>
        </div>
      </div>

      {/* =====================================
          TABS
      ====================================== */}

      <div className="flex items-center gap-2 border-b border-gray-200 pb-px">

        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "listings"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building className="w-4 h-4" />

          <span>
            Active Listings ({properties.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inquiries")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "inquiries"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />

          <span>
            Client Inquiries ({inquiries.length})
          </span>
        </button>
      </div>

      {/* =====================================
          LISTINGS TAB
      ====================================== */}

      {activeTab === "listings" && (
        <div className="space-y-6">

          {/* Search */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="search"
                placeholder="Search listings by title or city..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-4 px-6">
                      Property
                    </th>

                    <th className="py-4 px-6">
                      Type
                    </th>

                    <th className="py-4 px-6">
                      Price
                    </th>

                    <th className="py-4 px-6">
                      City
                    </th>

                    <th className="py-4 px-6">
                      Status
                    </th>

                    <th className="py-4 px-6 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredListings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 px-6 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Search className="w-8 h-8 text-gray-300" />

                          <p className="text-sm font-semibold text-gray-500">
                            No properties found
                          </p>

                          <p className="text-xs text-gray-400">
                            Try another search term or add a new property.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredListings.map(
                      (prop: Property) => (
                        <tr
                          key={prop.id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >

                          {/* Property */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">

                              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">

                                {prop.images?.[0] ? (
                                  <Image
                                    src={prop.images[0]}
                                    alt={prop.title}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Building className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">

                                <Link
                                  href={`/properties/${prop.id}`}
                                  className="font-bold text-gray-900 hover:text-indigo-600 line-clamp-1"
                                >
                                  {prop.title}
                                </Link>

                                <span className="text-xs text-gray-400 block truncate max-w-xs">
                                  {prop.location.address}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                prop.type === "buy"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {prop.type === "buy"
                                ? "For Sale"
                                : "For Rent"}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-6 font-bold text-gray-900">
                            {formatPrice(
                              prop.price,
                              prop.type
                            )}
                          </td>

                          {/* City */}
                          <td className="py-4 px-6 text-gray-700">
                            {prop.location.city},{" "}
                            {prop.location.state}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <select
                              value={prop.status}
                              onChange={(e) =>
                                updateProperty(
                                  prop.id,
                                  {
                                    status:
                                      e.target
                                        .value as Property["status"],
                                  }
                                )
                              }
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="available">
                                Available
                              </option>

                              <option value="pending">
                                Pending
                              </option>

                              <option value="sold">
                                Sold
                              </option>

                              <option value="rented">
                                Rented
                              </option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">

                              <Link
                                href={`/properties/${prop.id}`}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                                title="Preview Listing"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => {
                                  const confirmed =
                                    window.confirm(
                                      "Delete this listing?"
                                    );

                                  if (confirmed) {
                                    deleteProperty(
                                      prop.id
                                    );
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                                title="Delete Listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          INQUIRIES TAB
      ====================================== */}

      {activeTab === "inquiries" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">

              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">
                    Client
                  </th>

                  <th className="py-4 px-6">
                    Property
                  </th>

                  <th className="py-4 px-6">
                    Tour Date / Type
                  </th>

                  <th className="py-4 px-6">
                    Message
                  </th>

                  <th className="py-4 px-6">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {inquiries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 px-6 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-8 h-8 text-gray-300" />

                        <p className="text-sm font-semibold text-gray-500">
                          No client inquiries
                        </p>

                        <p className="text-xs text-gray-400">
                          New property inquiries and tour requests
                          will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inquiries.map(
                    (inq: Inquiry) => (
                      <tr
                        key={inq.id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >

                        {/* Client */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">
                            {inq.userName}
                          </div>

                          <div className="text-xs text-gray-500">
                            {inq.userEmail}
                          </div>

                          {inq.userPhone && (
                            <div className="text-xs text-gray-400">
                              {inq.userPhone}
                            </div>
                          )}
                        </td>

                        {/* Property */}
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          <Link
                            href={`/properties/${inq.propertyId}`}
                            className="hover:text-indigo-600 line-clamp-1"
                          >
                            {inq.propertyTitle}
                          </Link>
                        </td>

                        {/* Tour */}
                        <td className="py-4 px-6 text-xs">
                          {inq.tourDate ? (
                            <div>
                              <span className="font-semibold text-gray-800">
                                {inq.tourDate}
                              </span>

                              <span className="text-gray-500 block capitalize">
                                {inq.tourType} Tour
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              General Inquiry
                            </span>
                          )}
                        </td>

                        {/* Message */}
                        <td className="py-4 px-6 text-xs text-gray-600 max-w-xs">
                          <div className="truncate">
                            &quot;{inq.message}&quot;
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <select
                            value={inq.status}
                            onChange={(e) =>
                              updateInquiryStatus(
                                inq.id,
                                e.target
                                  .value as Inquiry["status"]
                              )
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="completed">
                              Completed
                            </option>
                          </select>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================
          ADD PROPERTY MODAL
      ====================================== */}

      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-property-title"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">

              <h3
                id="add-property-title"
                className="text-xl font-bold text-gray-900"
              >
                Publish New Luxury Property
              </h3>

              <button
                type="button"
                onClick={() =>
                  setIsAddModalOpen(false)
                }
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleAddPropertySubmit}
              className="space-y-4"
            >

              {/* Title */}
              <div className="space-y-1">
                <label
                  htmlFor="property-title"
                  className="block text-xs font-semibold uppercase text-gray-700"
                >
                  Property Title
                </label>

                <input
                  id="property-title"
                  type="text"
                  required
                  placeholder="e.g. Modernist Waterfront Haven"
                  value={newTitle}
                  onChange={(e) =>
                    setNewTitle(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Listing + Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="space-y-1">
                  <label
                    htmlFor="listing-type"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Listing Type
                  </label>

                  <select
                    id="listing-type"
                    value={newType}
                    onChange={(e) =>
                      setNewType(
                        e.target.value as ListingType
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="buy">
                      For Sale (Buy)
                    </option>

                    <option value="rent">
                      For Rent
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="property-category"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Property Category
                  </label>

                  <select
                    id="property-category"
                    value={newPropertyType}
                    onChange={(e) =>
                      setNewPropertyType(
                        e.target.value as PropertyType
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm capitalize"
                  >
                    <option value="villa">
                      Villa
                    </option>

                    <option value="house">
                      House
                    </option>

                    <option value="apartment">
                      Apartment
                    </option>

                    <option value="penthouse">
                      Penthouse
                    </option>

                    <option value="condo">
                      Condo
                    </option>

                    <option value="townhouse">
                      Townhouse
                    </option>
                  </select>
                </div>

              </div>

              {/* Price + City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="space-y-1">
                  <label
                    htmlFor="property-price"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Price ($)
                  </label>

                  <input
                    id="property-price"
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={(e) =>
                      setNewPrice(
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="property-city"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    City
                  </label>

                  <input
                    id="property-city"
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) =>
                      setNewCity(e.target.value)
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

                <div className="sm:col-span-2 space-y-1">
                  <label
                    htmlFor="property-address"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Street Address
                  </label>

                  <input
                    id="property-address"
                    type="text"
                    required
                    placeholder="123 Ocean Drive"
                    value={newAddress}
                    onChange={(e) =>
                      setNewAddress(
                        e.target.value
                      )
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="property-state"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    State
                  </label>

                  <input
                    id="property-state"
                    type="text"
                    value={newState}
                    onChange={(e) =>
                      setNewState(e.target.value)
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="property-zip"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Zip Code
                  </label>

                  <input
                    id="property-zip"
                    type="text"
                    value={newZip}
                    onChange={(e) =>
                      setNewZip(e.target.value)
                    }
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                <div className="space-y-1">
                  <label
                    htmlFor="property-beds"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Beds
                  </label>

                  <input
                    id="property-beds"
                    type="number"
                    min={0}
                    value={newBeds}
                    onChange={(e) =>
                      setNewBeds(
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="property-baths"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Baths
                  </label>

                  <input
                    id="property-baths"
                    type="number"
                    min={0}
                    value={newBaths}
                    onChange={(e) =>
                      setNewBaths(
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="property-sqft"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Sq Ft
                  </label>

                  <input
                    id="property-sqft"
                    type="number"
                    min={1}
                    value={newSqFt}
                    onChange={(e) =>
                      setNewSqFt(
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="property-year"
                    className="block text-xs font-semibold uppercase text-gray-700"
                  >
                    Year Built
                  </label>

                  <input
                    id="property-year"
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    value={newYearBuilt}
                    onChange={(e) =>
                      setNewYearBuilt(
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label
                  htmlFor="property-image"
                  className="block text-xs font-semibold uppercase text-gray-700"
                >
                  Image URL
                </label>

                <input
                  id="property-image"
                  type="url"
                  value={newImageUrl}
                  onChange={(e) =>
                    setNewImageUrl(
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              {/* Amenities */}
              <div className="space-y-1">
                <label
                  htmlFor="property-amenities"
                  className="block text-xs font-semibold uppercase text-gray-700"
                >
                  Amenities (comma-separated)
                </label>

                <input
                  id="property-amenities"
                  type="text"
                  value={newAmenities}
                  onChange={(e) =>
                    setNewAmenities(
                      e.target.value
                    )
                  }
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label
                  htmlFor="property-description"
                  className="block text-xs font-semibold uppercase text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="property-description"
                  rows={3}
                  value={newDesc}
                  onChange={(e) =>
                    setNewDesc(e.target.value)
                  }
                  placeholder="Describe the architectural highlights, views, and materials..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={newFeatured}
                  onChange={(e) =>
                    setNewFeatured(
                      e.target.checked
                    )
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />

                <label
                  htmlFor="featured-check"
                  className="text-xs text-gray-700 font-medium"
                >
                  Feature this property on the homepage
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">

                <button
                  type="button"
                  onClick={() =>
                    setIsAddModalOpen(false)
                  }
                  className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow"
                >
                  Publish Property
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}