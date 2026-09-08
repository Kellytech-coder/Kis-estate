"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { formatCurrency, formatPrice, useIsMounted } from "@/lib/utils";

export default function AdminPage() {
  const {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    inquiries,
    updateInquiryStatus,
    currentUser,
    logout,
  } = usePropertyStore();

  const mounted = useIsMounted();
  const isAdmin = mounted && currentUser?.role === "admin";

  const [activeTab, setActiveTab] = useState<"listings" | "inquiries">(
    "listings"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Property Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(1500000);
  const [newType, setNewType] = useState<ListingType>("buy");
  const [newPropertyType, setNewPropertyType] = useState<PropertyType>("house");
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

  // Calculations for KPI Cards
  const totalListings = properties.length;
  const buyListings = properties.filter((p: Property) => p.type === "buy");
  const rentListings = properties.filter((p: Property) => p.type === "rent");
  const totalVolume = buyListings.reduce((sum: number, p: Property) => sum + p.price, 0);

  // Filter listings by search
  const filteredListings = properties.filter((p: Property) => {
    const q = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.location.city.toLowerCase().includes(q) ||
      p.location.address.toLowerCase().includes(q)
    );
  });

  const handleAddPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAddress || !newCity) return;

    addProperty({
      title: newTitle,
      description: newDesc || "Exquisite architectural residence with premium finishes.",
      price: Number(newPrice),
      type: newType,
      propertyType: newPropertyType,
      location: {
        address: newAddress,
        city: newCity,
        state: newState,
        zipCode: newZip,
        country: "USA",
      },
      bedrooms: Number(newBeds),
      bathrooms: Number(newBaths),
      areaSqFt: Number(newSqFt),
      images: [newImageUrl],
      featured: newFeatured,
      amenities: newAmenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      yearBuilt: Number(newYearBuilt),
      status: "available",
      agent: {
        name: "Alex Realtor (Admin)",
        email: "alex.admin@havenestate.com",
        phone: "+1 (800) 555-0199",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        agency: "Haven Corporate Portfolio",
      },
    });

    setIsAddModalOpen(false);
    // Reset Form
    setNewTitle("");
    setNewAddress("");
  };

  // Access Control Guard
  if (mounted && !isAdmin) {
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
              The Property Management Portal requires verified administrator
              credentials. Please sign in via the executive authentication portal.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
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
            Publish listings, update statuses, monitor tour requests, and evaluate portfolio volume.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Property</span>
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = "/admin/login";
            }}
            className="p-3 text-gray-500 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 rounded-xl transition-colors"
            title="Sign out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            {buyListings.length} For Sale • {rentListings.length} Rentals
          </p>
        </div>

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
          <p className="text-xs text-gray-400">Cumulative for-sale asset value</p>
        </div>

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
          <p className="text-xs text-gray-400">Luxury leased residences</p>
        </div>

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
          <p className="text-xs text-gray-400">Scheduled client walkthroughs</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab("listings")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "listings"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Active Listings ({properties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("inquiries")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "inquiries"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Client Inquiries ({inquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Listings Table */}
      {activeTab === "listings" && (
        <div className="space-y-6">
          {/* Search Table input */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search listings by title or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                    <th className="py-4 px-6">Property</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">City</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredListings.map((prop: Property) => (
                    <tr key={prop.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={prop.images[0]}
                              alt={prop.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
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

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            prop.type === "buy"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {prop.type === "buy" ? "For Sale" : "For Rent"}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900">
                        {formatPrice(prop.price, prop.type)}
                      </td>

                      <td className="py-4 px-6 text-gray-700">
                        {prop.location.city}, {prop.location.state}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={prop.status}
                          onChange={(e) =>
                            updateProperty(prop.id, {
                              status: e.target.value as Property["status"],
                            })
                          }
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="available">Available</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                          <option value="rented">Rented</option>
                        </select>
                      </td>

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
                            onClick={() => {
                              if (confirm("Delete this listing?")) {
                                deleteProperty(prop.id);
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inquiries Table */}
      {activeTab === "inquiries" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Tour Date / Type</th>
                  <th className="py-4 px-6">Message</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiries.map((inq: Inquiry) => (
                  <tr key={inq.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{inq.userName}</div>
                      <div className="text-xs text-gray-500">{inq.userEmail}</div>
                      {inq.userPhone && (
                        <div className="text-xs text-gray-400">{inq.userPhone}</div>
                      )}
                    </td>

                    <td className="py-4 px-6 font-semibold text-gray-900">
                      <Link
                        href={`/properties/${inq.propertyId}`}
                        className="hover:text-indigo-600 line-clamp-1"
                      >
                        {inq.propertyTitle}
                      </Link>
                    </td>

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
                        <span className="text-gray-400">General Inquiry</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-600 max-w-xs truncate">
                      &quot;{inq.message}&quot;
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          updateInquiryStatus(
                            inq.id,
                            e.target.value as Inquiry["status"]
                          )
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Publish New Luxury Property
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPropertySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase text-gray-700">
                  Property Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modernist Waterfront Haven"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Listing Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ListingType)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    <option value="buy">For Sale (Buy)</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Property Category
                  </label>
                  <select
                    value={newPropertyType}
                    onChange={(e) =>
                      setNewPropertyType(e.target.value as PropertyType)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm capitalize"
                  >
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123 Ocean Drive"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={newZip}
                    onChange={(e) => setNewZip(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Beds
                  </label>
                  <input
                    type="number"
                    value={newBeds}
                    onChange={(e) => setNewBeds(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Baths
                  </label>
                  <input
                    type="number"
                    value={newBaths}
                    onChange={(e) => setNewBaths(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Sq Ft
                  </label>
                  <input
                    type="number"
                    value={newSqFt}
                    onChange={(e) => setNewSqFt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Year Built
                  </label>
                  <input
                    type="number"
                    value={newYearBuilt}
                    onChange={(e) => setNewYearBuilt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase text-gray-700">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={newAmenities}
                  onChange={(e) => setNewAmenities(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the architectural highlights, views, and materials..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={newFeatured}
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="featured-check" className="text-xs text-gray-700 font-medium">
                  Feature this property on the homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
