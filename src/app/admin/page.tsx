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
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  usePropertyStore,
  PropertyType,
  ListingType,
  Inquiry,
} from "@/store/propertyStore";
import { authApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();

  const {
    properties,
    isLoadingProperties,
    fetchProperties,
    addProperty,
    deleteProperty,
    inquiries,
    isLoadingInquiries,
    fetchInquiries,
    updateInquiryStatus,
    deleteInquiry,
    logout,
  } = usePropertyStore();

  const [authorizationChecked, setAuthorizationChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeTab, setActiveTab] = useState<"listings" | "inquiries">(
    "listings"
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(1500000);
  const [newType, setNewType] = useState<ListingType>("buy");
  const [newPropertyType, setNewPropertyType] = useState<PropertyType>("house");
  const [newAddress, setNewAddress] = useState("");
  const [newCity, setNewCity] = useState("Beverly Hills");
  const [newBeds, setNewBeds] = useState(4);
  const [newBaths, setNewBaths] = useState(3);
  const [newSqFt, setNewSqFt] = useState(3200);
  const [newImageUrl, setNewImageUrl] = useState(
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  );
  const [newFeatured, setNewFeatured] = useState(true);
  const [newAmenities, setNewAmenities] = useState(
    "Smart Home, Swimming Pool, Wine Cellar, 2-Car Garage"
  );

  // 1. Verify Admin Status via Backend
  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const res = await authApi.getMe();
        if (isMounted) {
          if (res.user && (res.user.role === "ADMIN" || res.user.role === "admin")) {
            setIsAdmin(true);
            void fetchProperties();
            void fetchInquiries();
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Verification failed:", err);
        if (isMounted) setIsAdmin(false);
      } finally {
        if (isMounted) setAuthorizationChecked(true);
      }
    };

    void verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [fetchProperties, fetchInquiries]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  // KPI Calculations
  const totalListings = properties.length;
  const buyListings = properties.filter((p) => p.type === "buy");
  const rentListings = properties.filter((p) => p.type === "rent");
  const totalVolume = buyListings.reduce((sum, p) => sum + Number(p.price || 0), 0);

  // Search Filter
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredListings = properties.filter((p) => {
    if (!normalizedSearch) return true;
    return (
      p.title.toLowerCase().includes(normalizedSearch) ||
      p.location?.city?.toLowerCase().includes(normalizedSearch) ||
      p.location?.address?.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!newTitle.trim() || !newAddress.trim() || !newCity.trim()) {
      setSubmitError("Please fill in title, address, and city.");
      return;
    }

    if (newPrice <= 0) {
      setSubmitError("Please provide a valid property price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const amenitiesList = newAmenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      await addProperty({
        title: newTitle.trim(),
        description: newDesc.trim() || "Exquisite architectural residence with premium finishes.",
        price: Number(newPrice),
        type: newType,
        propertyType: newPropertyType,
        location: {
          address: newAddress.trim(),
          city: newCity.trim(),
          state: "CA",
          zipCode: "90210",
          country: "USA",
        },
        bedrooms: Number(newBeds),
        bathrooms: Number(newBaths),
        areaSqFt: Number(newSqFt),
        yearBuilt: new Date().getFullYear(),
        images: [newImageUrl.trim()],
        featured: newFeatured,
        amenities: amenitiesList.length > 0 ? amenitiesList : ["Smart Home", "Pool"],
        status: "available",
      });

      setActionSuccess("Property published successfully to database!");
      setTimeout(() => setActionSuccess(""), 4000);

      setIsAddModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewAddress("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to create property on server.";
      console.error("Error creating property:", err);
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteProperty(id);
      setActionSuccess("Property deleted successfully.");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete property.";
      alert(errMsg);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: Inquiry["status"]) => {
    try {
      await updateInquiryStatus(id, status);
      setActionSuccess("Inquiry status updated.");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update inquiry status.";
      alert(errMsg);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry record?")) return;
    try {
      await deleteInquiry(id);
      setActionSuccess("Inquiry deleted.");
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete inquiry.";
      alert(errMsg);
    }
  };

  // 1. Loading State
  if (!authorizationChecked) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">
          Verifying administrator authorization...
        </p>
      </div>
    );
  }

  // 2. Restricted State for Non-Admins
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-red-100 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Access Restricted
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              This console requires verified administrator privileges. Your current session does not have access.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-md transition-all"
            >
              <span>Authenticate as Administrator</span>
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center text-xs text-gray-500 hover:text-gray-900 py-2 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                KIS-Estate Admin Console
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  LIVE API
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Connected to Firebase Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                void fetchProperties();
                void fetchInquiries();
              }}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingProperties || isLoadingInquiries ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-red-800 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Success Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Listings
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {totalListings}
            </div>
            <div className="text-xs text-gray-500">
              {buyListings.length} Buy • {rentListings.length} Rent
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Active Portfolio Value
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {formatCurrency(totalVolume)}
            </div>
            <div className="text-xs text-gray-500">
              Aggregate value for sale
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Client Inquiries
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {inquiries.length}
            </div>
            <div className="text-xs text-gray-500">
              {inquiries.filter((i) => i.status === "pending").length} pending review
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Featured Estates
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {properties.filter((p) => p.featured).length}
            </div>
            <div className="text-xs text-gray-500">
              Promoted on Homepage
            </div>
          </div>
        </div>

        {/* Main Console Section */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
          {/* Tabs & Search Toolbar */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setActiveTab("listings")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "listings"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Property Listings ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "inquiries"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Inquiries &amp; Tours ({inquiries.length})
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {activeTab === "listings" && (
                <>
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Property</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TAB 1: LISTINGS */}
          {activeTab === "listings" && (
            <div className="overflow-x-auto">
              {isLoadingProperties && properties.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">Loading listings from Firestore...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <Building className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-800">No properties found</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    {searchTerm
                      ? "No properties match your search term. Try a different keyword."
                      : "Your database is empty. Click 'Add Property' to create your first listing."}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3.5 px-6">Property</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Specs</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredListings.map((prop) => (
                      <tr key={prop.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-gray-100">
                              <Image
                                src={
                                  prop.images?.[0] ||
                                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
                                }
                                alt={prop.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="space-y-0.5 max-w-[200px] sm:max-w-xs truncate">
                              <span className="font-bold text-gray-900 block truncate">
                                {prop.title}
                              </span>
                              <span className="text-[11px] text-gray-400 capitalize block">
                                {prop.propertyType} {prop.featured && "• ⭐ Featured"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              prop.type === "buy"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            For {prop.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          {formatCurrency(prop.price)}
                          {prop.type === "rent" && <span className="text-gray-400 font-normal">/mo</span>}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {prop.bedrooms} beds • {prop.bathrooms} baths • {prop.areaSqFt} sqft
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {prop.location?.city || "USA"}, {prop.location?.state || ""}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 capitalize">
                            {prop.status || "available"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <Link
                            href={`/properties/${prop.id}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 inline-block transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProperty(prop.id, prop.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 inline-block transition-colors cursor-pointer"
                            title="Delete Property"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: INQUIRIES */}
          {activeTab === "inquiries" && (
            <div className="overflow-x-auto">
              {isLoadingInquiries && inquiries.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs text-gray-500">Loading inquiries from database...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <Users className="w-10 h-10 text-gray-300 mx-auto" />
                  <h3 className="text-sm font-bold text-gray-800">No inquiries yet</h3>
                  <p className="text-xs text-gray-500">
                    Client tour bookings and property inquiries will appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3.5 px-6">Client</th>
                      <th className="py-3.5 px-4">Property</th>
                      <th className="py-3.5 px-4">Tour / Details</th>
                      <th className="py-3.5 px-4">Message</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6 space-y-0.5">
                          <span className="font-bold text-gray-900 block">{inq.userName}</span>
                          <span className="text-gray-500 block">{inq.userEmail}</span>
                          {inq.userPhone && (
                            <span className="text-[11px] text-gray-400 block">{inq.userPhone}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-800">
                          {inq.propertyTitle || inq.propertyId}
                        </td>
                        <td className="py-4 px-4 text-gray-600 space-y-0.5">
                          <span className="capitalize font-semibold block text-indigo-600">
                            {inq.tourType || "inquiry"}
                          </span>
                          {inq.tourDate && (
                            <span className="text-gray-500 block">
                              📅 {inq.tourDate} {inq.tourTime && `at ${inq.tourTime}`}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600 max-w-xs truncate">
                          &ldquo;{inq.message}&rdquo;
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={inq.status}
                            onChange={(e) =>
                              handleUpdateInquiryStatus(
                                inq.id,
                                e.target.value as Inquiry["status"]
                              )
                            }
                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 inline-block transition-colors cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add New Property to Database</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {submitError}
              </div>
            )}

            <form onSubmit={handleAddPropertySubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase">Property Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Modernist Waterfront Villa"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">Listing Purpose</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ListingType)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="buy">For Sale (Buy)</option>
                    <option value="rent">For Lease (Rent)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">Property Type</label>
                  <select
                    value={newPropertyType}
                    onChange={(e) => setNewPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">Bedrooms</label>
                  <input
                    type="number"
                    value={newBeds}
                    onChange={(e) => setNewBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">Bathrooms</label>
                  <input
                    type="number"
                    value={newBaths}
                    onChange={(e) => setNewBaths(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">Area (Sq Ft)</label>
                  <input
                    type="number"
                    value={newSqFt}
                    onChange={(e) => setNewSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="1420 Loma Vista Dr"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Beverly Hills"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase">Image URL</label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={newAmenities}
                  onChange={(e) => setNewAmenities(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 uppercase">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Architectural features, views, finishes..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newFeatured}
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="featured" className="font-semibold text-gray-700 cursor-pointer">
                  Feature this property on Homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold inline-flex items-center gap-2 shadow-md shadow-indigo-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Publish Listing</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}