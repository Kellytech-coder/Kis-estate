"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Briefcase,
  Eye,
  MapPin,
  Phone,
  Mail,
  Home,
  Upload,
  Camera,
  ImageIcon,
} from "lucide-react";
import { usePropertyStore, Property, PropertyType, ListingType, Inquiry } from "@/store/propertyStore";
import { propertiesApi, inquiriesApi, authApi } from "@/lib/api";
import { formatCurrency, formatPrice, useIsMounted } from "@/lib/utils";
import { uploadMultiplePropertyImages, validateImageFile } from "@/lib/storage";

const NIGERIAN_STATES = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Oyo",
  "Enugu",
  "Delta",
  "Edo",
  "Kano",
  "Kaduna",
  "Imo",
  "Anambra",
  "Ogun",
  "Akwa Ibom",
];

const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: "duplex", label: "Duplex" },
  { id: "terrace", label: "Terrace Duplex" },
  { id: "flat", label: "Flat / Apartment" },
  { id: "bungalow", label: "Bungalow" },
  { id: "house", label: "Detached House" },
  { id: "mansion", label: "Luxury Mansion" },
  { id: "penthouse", label: "Penthouse" },
  { id: "land", label: "Land / Plot" },
  { id: "commercial", label: "Commercial Property" },
  { id: "office", label: "Office Space" },
  { id: "shop", label: "Shop / Retail" },
];

const POPULAR_AMENITIES = [
  "24/7 Power Supply",
  "Swimming Pool",
  "Smart Home Automation",
  "Water Treatment Plant",
  "CCTV Surveillance",
  "Security Gatehouse",
  "Boys Quarters (BQ)",
  "Solar Inverter Backup",
  "Fitted Modern Kitchen",
  "Elevator / Lift",
  "Ample Parking Space",
  "Gymnasium",
];

export default function SellerPortalPage() {
  const { currentUser, isLoadingUser } = usePropertyStore();
  const mounted = useIsMounted();

  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"properties" | "inquiries" | "profile">("properties");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<ListingType>("buy");
  const [propertyType, setPropertyType] = useState<PropertyType>("duplex");
  const [state, setState] = useState("Lagos");
  const [city, setCity] = useState("Lekki");
  const [lga, setLga] = useState("Eti-Osa");
  const [address, setAddress] = useState("");
  const [bedrooms, setBedrooms] = useState("4");
  const [bathrooms, setBathrooms] = useState("4");
  const [parking, setParking] = useState("3");
  const [areaSqFt, setAreaSqFt] = useState("3500");
  const [yearBuilt, setYearBuilt] = useState(String(new Date().getFullYear()));
  const [status, setStatus] = useState<Property["status"]>("available");
  const [imageUrl, setImageUrl] = useState("");
  const [imageList, setImageList] = useState<string[]>([
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "24/7 Power Supply",
    "Fitted Modern Kitchen",
    "Security Gatehouse",
  ]);

  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAgency, setProfileAgency] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Check role
  const isSellerOrAdmin =
    currentUser?.role?.toUpperCase() === "SELLER_PROPERTY_OWNER" ||
    currentUser?.role?.toUpperCase() === "SELLER" ||
    currentUser?.role?.toUpperCase() === "ADMIN";

  const loadSellerData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      const [propRes, inqRes] = await Promise.all([
        propertiesApi.getMyProperties(),
        inquiriesApi.getAll(),
      ]);

      if (propRes?.data) {
        setMyProperties(propRes.data);
      }

      if (inqRes?.data) {
        // Filter inquiries that match seller's properties
        const myPropIds = new Set((propRes?.data || []).map((p) => p.id));
        const sellerInquiries = inqRes.data.filter((inq) => myPropIds.has(inq.propertyId));
        setMyInquiries(sellerInquiries);
      }
    } catch (err: unknown) {
      console.error("Failed to load seller data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfilePhone(currentUser.phone || "");
      setProfileAgency(currentUser.agencyName || "");
      void loadSellerData();
    }
  }, [currentUser, loadSellerData]);

  // Add image URL to list
  const handleAddImageUrl = () => {
    if (imageUrl.trim() && !imageList.includes(imageUrl.trim())) {
      setImageList([...imageList, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageList(imageList.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");

  // Upload Real Image Files from Device to Firebase Storage
  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check validation first
    for (const f of fileArray) {
      const val = validateImageFile(f);
      if (!val.valid) {
        setFeedbackMsg({ type: "error", text: val.error || "Invalid file." });
        return;
      }
    }

    setIsUploadingImages(true);
    setUploadProgressText(`Uploading ${fileArray.length} image(s) to Firebase Storage...`);

    try {
      const uploadedMetas = await uploadMultiplePropertyImages(
        fileArray,
        "properties",
        (completed, total) => {
          setUploadProgressText(`Uploaded ${completed} of ${total} images...`);
        }
      );

      const newUrls = uploadedMetas.map((m) => m.url);
      setImageList((prev) => [...prev, ...newUrls]);
      setFeedbackMsg({
        type: "success",
        text: `Successfully uploaded ${newUrls.length} image(s) to Firebase Storage!`,
      });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to upload image(s).";
      console.error("Storage upload failed:", err);
      setFeedbackMsg({ type: "error", text: errMsg });
    } finally {
      setIsUploadingImages(false);
      setUploadProgressText("");
      // Reset input
      e.target.value = "";
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingPropertyId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setType("buy");
    setPropertyType("duplex");
    setState("Lagos");
    setCity("Lekki");
    setLga("Eti-Osa");
    setAddress("");
    setBedrooms("4");
    setBathrooms("4");
    setParking("3");
    setAreaSqFt("3500");
    setYearBuilt(String(new Date().getFullYear()));
    setStatus("available");
    setImageList([]);
    setSelectedAmenities([
      "24/7 Power Supply",
      "Fitted Modern Kitchen",
      "Security Gatehouse",
    ]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (property: Property) => {
    setEditingPropertyId(property.id);
    setTitle(property.title);
    setDescription(property.description);
    setPrice(String(property.price));
    setType(property.type);
    setPropertyType(property.propertyType);
    setState(property.location?.state || "Lagos");
    setCity(property.location?.city || "Lekki");
    setLga(property.location?.lga || "Eti-Osa");
    setAddress(property.location?.address || "");
    setBedrooms(String(property.bedrooms || 0));
    setBathrooms(String(property.bathrooms || 0));
    setParking(String(property.parking || 0));
    setAreaSqFt(String(property.areaSqFt || 0));
    setYearBuilt(String(property.yearBuilt || new Date().getFullYear()));
    setStatus(property.status);
    setImageList(property.images || []);
    setSelectedAmenities(property.amenities || []);
    setIsModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || Number(price) <= 0) {
      setFeedbackMsg({ type: "error", text: "Please provide a valid property title and price in Naira (₦)." });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const propertyPayload: Partial<Property> = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      type,
      propertyType,
      location: {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        lga: lga.trim(),
        country: "Nigeria",
      },
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      parking: Number(parking) || 0,
      areaSqFt: Number(areaSqFt) || 0,
      yearBuilt: Number(yearBuilt) || new Date().getFullYear(),
      status,
      images: imageList.length > 0 ? imageList : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: selectedAmenities,
      agent: {
        name: currentUser?.name || "Property Owner",
        email: currentUser?.email || "kelechiawa11@gmail.com",
        phone: currentUser?.phone || "+234 800 000 0000",
        agency: currentUser?.agencyName || "KIS-Estate Partner",
      },
    };

    try {
      if (editingPropertyId) {
        await propertiesApi.update(editingPropertyId, propertyPayload);
        setFeedbackMsg({ type: "success", text: "Property listing updated successfully!" });
      } else {
        await propertiesApi.create(propertyPayload);
        setFeedbackMsg({ type: "success", text: "New Nigerian property listing published successfully!" });
      }
      setIsModalOpen(false);
      await loadSellerData();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Failed to save property. Please try again.";
      setFeedbackMsg({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this property listing?")) return;
    try {
      await propertiesApi.delete(id);
      setMyProperties(myProperties.filter((p) => p.id !== id));
      setFeedbackMsg({ type: "success", text: "Listing deleted successfully." });
    } catch (err: unknown) {
      setFeedbackMsg({ type: "error", text: (err as Error)?.message || "Failed to delete listing." });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Property["status"]) => {
    try {
      await propertiesApi.update(id, { status: newStatus });
      setMyProperties(
        myProperties.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err: unknown) {
      alert("Failed to update status: " + ((err as Error)?.message || ""));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setFeedbackMsg(null);
    try {
      await authApi.updateProfile({
        name: profileName,
        phone: profilePhone,
        agencyName: profileAgency,
      });
      setFeedbackMsg({ type: "success", text: "Seller profile information updated successfully!" });
    } catch (err: unknown) {
      setFeedbackMsg({ type: "error", text: (err as Error)?.message || "Failed to update profile." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Portfolio total metrics
  const stats = useMemo(() => {
    const totalListed = myProperties.length;
    const active = myProperties.filter((p) => p.status === "available").length;
    const portfolioValue = myProperties.reduce((sum, p) => sum + (p.price || 0), 0);
    const inquiriesCount = myInquiries.length;
    return { totalListed, active, portfolioValue, inquiriesCount };
  }, [myProperties, myInquiries]);

  if (!mounted || isLoadingUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading Seller Studio...</p>
      </div>
    );
  }

  // Not signed in
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Briefcase className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Seller Studio Login</h2>
          <p className="text-xs text-gray-500">
            Sign in with your Property Owner / Seller account to list and manage real estate across Nigeria.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center py-2 text-xs text-gray-500 hover:text-gray-900 font-medium"
          >
            Register as Seller / Property Owner
          </Link>
        </div>
      </div>
    );
  }

  // Logged in as Buyer/Renter, not Seller
  if (!isSellerOrAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Buyer / Renter Account</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your current account is registered as a <strong>Buyer / Renter</strong>. To create and manage property listings, you need a <strong>Seller / Property Owner</strong> account.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="py-2.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl"
          >
            Go to Buyer Dashboard
          </Link>
          <Link
            href="/register"
            className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200"
          >
            Register as Seller / Owner
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Property Owner &amp; Seller Studio (Nigeria)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {currentUser.agencyName || currentUser.name || "Seller Portal"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Manage your verified Nigerian real estate listings, inquiries, and client appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-900/50 transition-all cursor-pointer hover:scale-105 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Global Alerts */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-medium animate-in fade-in ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Total Listed</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {stats.totalListed}
          </div>
          <div className="text-[11px] text-gray-400">Properties on KIS-Estate</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Active Listings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats.active}
          </div>
          <div className="text-[11px] text-gray-400">Publicly browsable</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Inquiries Received</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {stats.inquiriesCount}
          </div>
          <div className="text-[11px] text-gray-400">Client tour requests</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
            <span>Portfolio Value</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 truncate">
            {formatCurrency(stats.portfolioValue)}
          </div>
          <div className="text-[11px] text-gray-400">Estimated total list value</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("properties")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "properties"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          My Properties ({myProperties.length})
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "inquiries"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Client Inquiries ({myInquiries.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          Seller Profile
        </button>
      </div>

      {/* TAB 1: PROPERTIES */}
      {activeTab === "properties" && (
        <div className="space-y-4">
          {isLoadingData ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-gray-500">Loading your property listings from Firestore...</p>
            </div>
          ) : myProperties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No properties listed yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                You haven&apos;t published any real estate listings yet. Click the button below to add your first property in Lagos, Abuja, or across Nigeria.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                + Add First Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    {/* Image Preview */}
                    <div className="relative h-48 w-full bg-gray-100">
                      <Image
                        src={prop.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                        alt={prop.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-gray-950/80 text-white backdrop-blur-md">
                          {prop.type === "buy" ? "For Sale" : "For Rent"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            prop.status === "available"
                              ? "bg-emerald-500 text-white"
                              : prop.status === "pending"
                              ? "bg-amber-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="text-base font-bold text-gray-900 line-clamp-1">
                        {prop.title}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">
                          {prop.location?.address ? `${prop.location.address}, ` : ""}
                          {prop.location?.city}, {prop.location?.state}
                        </span>
                      </div>
                      <div className="text-lg font-extrabold text-indigo-600">
                        {formatPrice(prop.price, prop.type)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
                        <span>{prop.bedrooms} Beds</span>
                        <span>•</span>
                        <span>{prop.bathrooms} Baths</span>
                        <span>•</span>
                        <span className="capitalize">{prop.propertyType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <select
                        value={prop.status}
                        onChange={(e) =>
                          void handleUpdateStatus(prop.id, e.target.value as Property["status"])
                        }
                        className="text-[11px] font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 cursor-pointer"
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/properties/${prop.id}`}
                        target="_blank"
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                        title="View Public Listing"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(prop)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Edit Listing"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => void handleDeleteProperty(prop.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INQUIRIES */}
      {activeTab === "inquiries" && (
        <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Client Inquiries &amp; Tour Bookings</h3>
            <p className="text-xs text-gray-500">
              Messages and tour requests sent by buyers and renters on your properties.
            </p>
          </div>

          {myInquiries.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Users className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold text-gray-600">No inquiries received yet</p>
              <p className="text-[11px] text-gray-400">
                When visitors request tours or send questions on your listings, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myInquiries.map((inq) => (
                <div key={inq.id} className="p-6 hover:bg-gray-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 block">
                        {inq.propertyTitle}
                      </span>
                      <h4 className="text-sm font-extrabold text-gray-900">{inq.userName}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
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

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${inq.userEmail}`} className="hover:text-indigo-600">
                        {inq.userEmail}
                      </a>
                    </span>
                    {inq.userPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${inq.userPhone}`} className="hover:text-indigo-600">
                          {inq.userPhone}
                        </a>
                      </span>
                    )}
                    {inq.tourDate && (
                      <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        Tour: {inq.tourDate} {inq.tourTime ? `at ${inq.tourTime}` : ""} ({inq.tourType})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    &ldquo;{inq.message}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SELLER PROFILE */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-900 text-lg">Seller / Agency Profile</h3>
            <p className="text-xs text-gray-500">
              This information is displayed on your public Nigerian property listings.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Contact Person Name
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Phone Number (WhatsApp / Calls)
              </label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                placeholder="+234 803 000 0000"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Agency / Business Name
              </label>
              <input
                type="text"
                value={profileAgency}
                onChange={(e) => setProfileAgency(e.target.value)}
                placeholder="e.g. Lekki Prime Homes Ltd"
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
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Profile Information</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* CREATE / EDIT PROPERTY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingPropertyId ? "Edit Property Listing" : "Add New Nigerian Property"}
                </h3>
                <p className="text-xs text-gray-500">
                  Fill in genuine details and price in Nigerian Naira (₦).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProperty} className="p-6 overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 5-Bedroom Contemporary Duplex with Pool in Lekki Phase 1"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Listing Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ListingType)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="buy">For Sale (Buy)</option>
                    <option value="rent">For Rent (Lease)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Property Type *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Price in Naira (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 180000000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700">
                    Availability Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Property["status"])}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending Contract</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>

              {/* Nigerian Location */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Nigerian Location Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {NIGERIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">City / Area / Neighborhood *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lekki Phase 1, Ikoyi, Maitama"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">LGA / District</label>
                    <input
                      type="text"
                      value={lga}
                      onChange={(e) => setLga(e.target.value)}
                      placeholder="e.g. Eti-Osa, Municipal"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 14 Admiralty Way, Lekki"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Property Specs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Bedrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Bathrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Parking</label>
                    <input
                      type="number"
                      min={0}
                      value={parking}
                      onChange={(e) => setParking(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Area (sqft/sqm)</label>
                    <input
                      type="number"
                      min={0}
                      value={areaSqFt}
                      onChange={(e) => setAreaSqFt(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Year Built</label>
                    <input
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase text-gray-700">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the architectural highlights, finishings, power status, security, title documents (Governor's Consent, C of O), etc."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Amenities */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-900">
                  Select Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_AMENITIES.map((amenity) => {
                    const selected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer flex items-center justify-between ${
                          selected
                            ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-semibold"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{amenity}</span>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Images */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900">
                    Property Images ({imageList.length})
                  </label>
                  <span className="text-[11px] text-gray-500">First image is used as cover</span>
                </div>

                {/* File Upload Zone */}
                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Photos from Device</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleImageFilesUpload}
                        disabled={isUploadingImages}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Supports JPG, PNG, WebP up to 10MB each. Images are stored securely in Firebase Storage.
                  </p>
                </div>

                {/* Progress bar */}
                {isUploadingImages && (
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>{uploadProgressText || "Uploading images to Firebase Storage..."}</span>
                  </div>
                )}

                {/* Alternative URL Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste external image URL..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Add URL
                  </button>
                </div>

                {/* Image Previews */}
                {imageList.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {imageList.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-xl overflow-hidden group bg-gray-100 border border-gray-200">
                        <Image src={img} alt={`preview ${idx}`} fill className="object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded shadow-sm">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-600 font-medium pt-1">
                    ⚠️ Please upload at least 1 image for your property.
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <span>{editingPropertyId ? "Save Changes" : "Publish Nigerian Listing"}</span>
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

