"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Edit,
  Mail,
  Phone,
  Calendar,
  Eye,
  MapPin,
  Upload,
  ImageIcon,
  UserCheck,
  UserX,
  MessageSquare,
  Building2,
  Check,
  Filter,
} from "lucide-react";

import {
  usePropertyStore,
  Property,
  PropertyType,
  ListingType,
  Inquiry,
} from "@/store/propertyStore";
import { authApi, adminApi, AdminStats, AdminUser } from "@/lib/api";
import { formatCurrency, formatPrice, formatDate, useIsMounted } from "@/lib/utils";
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
  { id: "commercial", label: "Commercial" },
  { id: "office", label: "Office Space" },
  { id: "shop", label: "Shop / Retail" },
];

export default function AdminPage() {
  const router = useRouter();
  const mounted = useIsMounted();

  const {
    properties,
    isLoadingProperties,
    fetchProperties,
    addProperty,
    updateProperty,
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

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<"overview" | "properties" | "users" | "inquiries">("overview");

  // Admin Live Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>("all");

  // Property Modal State (Create & Edit)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [isSubmittingProperty, setIsSubmittingProperty] = useState(false);
  const [propertyError, setPropertyError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Property Form State
  const [propTitle, setPropTitle] = useState("");
  const [propDesc, setPropDesc] = useState("");
  const [propPrice, setPropPrice] = useState<number | string>(180000000);
  const [propType, setPropType] = useState<ListingType>("buy");
  const [propPropertyType, setPropPropertyType] = useState<PropertyType>("duplex");
  const [propState, setPropState] = useState("Lagos");
  const [propCity, setPropCity] = useState("Lekki");
  const [propLga, setPropLga] = useState("Eti-Osa");
  const [propAddress, setPropAddress] = useState("");
  const [propBeds, setPropBeds] = useState(4);
  const [propBaths, setPropBaths] = useState(4);
  const [propSqFt, setPropSqFt] = useState(3800);
  const [propParking, setPropParking] = useState(3);
  const [propFeatured, setPropFeatured] = useState(true);
  const [propStatus, setPropStatus] = useState<Property["status"]>("available");
  const [propAmenities, setPropAmenities] = useState(
    "24/7 Power Supply, Swimming Pool, CCTV, Smart Home, Fitted Modern Kitchen, Security Gatehouse"
  );
  const [propImages, setPropImages] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");

  // 1. Verify Admin Status via Backend
  const loadAdminData = useCallback(async () => {
    setIsLoadingStats(true);
    setIsLoadingUsers(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getUsers().catch(() => null),
        fetchProperties(),
        fetchInquiries(),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (usersRes?.data) setUsersList(usersRes.data);
    } catch (err) {
      console.error("Failed to load admin stats/users:", err);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingUsers(false);
    }
  }, [fetchProperties, fetchInquiries]);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const res = await authApi.getMe();
        if (isMounted) {
          const role = (res.user?.role || "").toUpperCase();
          if (res.user && role === "ADMIN") {
            setIsAdmin(true);
            void loadAdminData();
          } else {
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error("Admin verification failed:", err);
        if (isMounted) setIsAdmin(false);
      } finally {
        if (isMounted) setAuthorizationChecked(true);
      }
    };

    void verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [loadAdminData]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  // Image Upload Handlers
  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    for (const f of fileArray) {
      const val = validateImageFile(f);
      if (!val.valid) {
        setPropertyError(val.error || "Invalid file format.");
        return;
      }
    }

    setIsUploadingImages(true);
    setUploadProgressText(`Uploading ${fileArray.length} images to Firebase Storage...`);

    try {
      const uploaded = await uploadMultiplePropertyImages(
        fileArray,
        "properties",
        (completed, total) => setUploadProgressText(`Uploaded ${completed} of ${total} images...`)
      );

      const urls = uploaded.map((u) => u.url);
      setPropImages((prev) => [...prev, ...urls]);
      setPropertyError("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to upload image.";
      setPropertyError(errMsg);
    } finally {
      setIsUploadingImages(false);
      setUploadProgressText("");
      e.target.value = "";
    }
  };

  const handleAddManualImage = () => {
    if (manualImageUrl.trim() && !propImages.includes(manualImageUrl.trim())) {
      setPropImages([...propImages, manualImageUrl.trim()]);
      setManualImageUrl("");
    }
  };

  const handleRemoveImage = (idxToRemove: number) => {
    setPropImages(propImages.filter((_, idx) => idx !== idxToRemove));
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPropertyId(null);
    setPropTitle("");
    setPropDesc("");
    setPropPrice(180000000);
    setPropType("buy");
    setPropPropertyType("duplex");
    setPropState("Lagos");
    setPropCity("Lekki");
    setPropLga("Eti-Osa");
    setPropAddress("");
    setPropBeds(4);
    setPropBaths(4);
    setPropSqFt(3800);
    setPropParking(3);
    setPropFeatured(true);
    setPropStatus("available");
    setPropAmenities("24/7 Power Supply, Swimming Pool, CCTV, Smart Home, Fitted Modern Kitchen, Security Gatehouse");
    setPropImages([]);
    setPropertyError("");
    setIsPropertyModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setPropTitle(prop.title);
    setPropDesc(prop.description);
    setPropPrice(prop.price);
    setPropType(prop.type);
    setPropPropertyType(prop.propertyType);
    setPropState(prop.location?.state || "Lagos");
    setPropCity(prop.location?.city || "Lekki");
    setPropLga(prop.location?.lga || "Eti-Osa");
    setPropAddress(prop.location?.address || "");
    setPropBeds(prop.bedrooms);
    setPropBaths(prop.bathrooms);
    setPropSqFt(prop.areaSqFt);
    setPropParking(prop.parking || 2);
    setPropFeatured(prop.featured);
    setPropStatus(prop.status);
    setPropAmenities((prop.amenities || []).join(", "));
    setPropImages(prop.images || []);
    setPropertyError("");
    setIsPropertyModalOpen(true);
  };

  // Submit Property (Create / Edit)
  const handleSavePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPropertyError("");

    if (!propTitle.trim() || !propAddress.trim() || !propCity.trim()) {
      setPropertyError("Please fill in title, street address, and city.");
      return;
    }

    if (Number(propPrice) <= 0) {
      setPropertyError("Please provide a valid property price.");
      return;
    }

    if (propImages.length === 0) {
      setPropertyError("Please upload or provide at least 1 image for the property.");
      return;
    }

    setIsSubmittingProperty(true);

    try {
      const amenitiesList = propAmenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const propertyData: Partial<Property> = {
        title: propTitle.trim(),
        description: propDesc.trim() || "Exquisite architectural residence with premium finishes.",
        price: Number(propPrice),
        type: propType,
        propertyType: propPropertyType,
        location: {
          address: propAddress.trim(),
          city: propCity.trim(),
          state: propState.trim(),
          lga: propLga.trim(),
          country: "Nigeria",
        },
        bedrooms: Number(propBeds),
        bathrooms: Number(propBaths),
        parking: Number(propParking),
        areaSqFt: Number(propSqFt),
        yearBuilt: new Date().getFullYear(),
        images: propImages,
        featured: propFeatured,
        amenities: amenitiesList.length > 0 ? amenitiesList : ["24/7 Power Supply"],
        status: propStatus,
      };

      if (editingPropertyId) {
        await updateProperty(editingPropertyId, propertyData);
        setActionSuccess("Property updated successfully in database!");
      } else {
        await addProperty(propertyData);
        setActionSuccess("Property published successfully to database!");
      }

      setTimeout(() => setActionSuccess(""), 4000);
      setIsPropertyModalOpen(false);
      void loadAdminData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to save property.";
      setPropertyError(errMsg);
    } finally {
      setIsSubmittingProperty(false);
    }
  };

  const handleDeleteProperty = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await deleteProperty(id);
      setActionSuccess("Property removed from Firestore.");
      setTimeout(() => setActionSuccess(""), 3000);
      void loadAdminData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete property.";
      alert(errMsg);
    }
  };

  const handleUpdatePropertyStatus = async (id: string, newStatus: Property["status"]) => {
    try {
      await updateProperty(id, { status: newStatus });
      setActionSuccess(`Listing marked as ${newStatus}.`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update status.";
      alert(errMsg);
    }
  };

  // User Management Handlers
  const handleToggleUserActive = async (user: AdminUser) => {
    try {
      const newActive = !user.isActive;
      await adminApi.updateUser(user.uid, { isActive: newActive });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, isActive: newActive } : u))
      );
      setActionSuccess(`User ${newActive ? "activated" : "deactivated"} successfully.`);
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update user status.";
      alert(errMsg);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to delete user account "${user.name} (${user.email})"?`)) return;
    try {
      await adminApi.deleteUser(user.uid);
      setUsersList((prev) => prev.filter((u) => u.uid !== user.uid));
      setActionSuccess("User removed successfully.");
      setTimeout(() => setActionSuccess(""), 3000);
      void loadAdminData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete user.";
      alert(errMsg);
    }
  };

  // Inquiry Handlers
  const handleUpdateInquiryStatus = async (id: string, status: Inquiry["status"]) => {
    try {
      await updateInquiryStatus(id, status);
      setActionSuccess("Inquiry status updated.");
      setTimeout(() => setActionSuccess(""), 3000);
      void loadAdminData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update inquiry.";
      alert(errMsg);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await deleteInquiry(id);
      setActionSuccess("Inquiry record deleted.");
      setTimeout(() => setActionSuccess(""), 3000);
      void loadAdminData();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete inquiry.";
      alert(errMsg);
    }
  };

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return properties.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.location?.city?.toLowerCase().includes(q) ||
        p.location?.address?.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || p.type.toLowerCase() === typeFilter.toLowerCase();
      const matchStatus = statusFilter === "all" || (p.status || "available").toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchType && matchStatus;
    });
  }, [properties, searchTerm, typeFilter, statusFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = userSearchTerm.trim().toLowerCase();
    if (!q) return usersList;
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.agencyName && u.agencyName.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q)
    );
  }, [usersList, userSearchTerm]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    if (inquiryStatusFilter === "all") return inquiries;
    return inquiries.filter((inq) => (inq.status || "pending").toLowerCase() === inquiryStatusFilter.toLowerCase());
  }, [inquiries, inquiryStatusFilter]);

  // Authorization Check Loading
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

  // Access Denied State
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl shadow-red-500/5 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Access Restricted</h2>
            <p className="text-sm text-gray-500">
              This portal is restricted to authorized KIS-Estate administrators.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/admin/login"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-center"
            >
              Sign In as Administrator
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm rounded-xl transition-all text-center"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">
                    KIS-Estate Admin Portal
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Live Firestore
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Real-time marketplace control and database moderation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => void loadAdminData()}
                disabled={isLoadingStats || isLoadingProperties}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer border border-gray-200"
                title="Refresh Database Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingStats ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Property</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation (Responsive Bar) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-gray-100">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              📊 Live Overview
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "properties"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              🏡 Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "users"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              👥 Users ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "inquiries"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              📬 Inquiries ({inquiries.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Toast Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold">{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: LIVE OVERVIEW STATS                           */}
        {/* ==================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Live KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Total Properties</span>
                  <Building className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">
                  {stats ? stats.totalProperties : properties.length}
                </div>
                <div className="text-[11px] text-gray-500 flex gap-2">
                  <span className="text-emerald-600 font-semibold">{stats?.activeListings ?? 0} Active</span>
                  <span>•</span>
                  <span className="text-amber-600 font-semibold">{stats?.pendingListings ?? 0} Pending</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Registered Users</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">
                  {stats ? stats.totalUsers : usersList.length}
                </div>
                <div className="text-[11px] text-gray-500 flex gap-2">
                  <span className="text-indigo-600 font-semibold">{stats?.totalSellers ?? 0} Sellers</span>
                  <span>•</span>
                  <span>{stats?.totalBuyers ?? 0} Buyers</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Client Inquiries</span>
                  <MessageSquare className="w-4 h-4 text-violet-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">
                  {stats ? stats.totalInquiries : inquiries.length}
                </div>
                <div className="text-[11px] text-gray-500 flex gap-2">
                  <span className="text-amber-600 font-semibold">{stats?.pendingInquiries ?? 0} Pending</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">{stats?.completedInquiries ?? 0} Completed</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Buy Portfolio Value</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 truncate">
                  {formatCurrency(stats?.totalValueBuy ?? 0)}
                </div>
                <div className="text-[11px] text-gray-400">Total listed for-sale valuation</div>
              </div>
            </div>

            {/* Recent Feeds Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Listings */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Recent Nigerian Listings</h3>
                  <button
                    onClick={() => setActiveTab("properties")}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {properties.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No properties added yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {properties.slice(0, 5).map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={p.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80"}
                              alt={p.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{p.title}</p>
                            <p className="text-[11px] text-indigo-600 font-semibold">
                              {formatPrice(p.price, p.type)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                            p.status === "available"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Inquiries */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Recent Client Inquiries</h3>
                  <button
                    onClick={() => setActiveTab("inquiries")}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {inquiries.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No inquiries received yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {inquiries.slice(0, 5).map((inq) => (
                      <div key={inq.id} className="py-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{inq.userName}</span>
                          <span className="text-[10px] text-gray-400">{formatDate(inq.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-indigo-600 font-medium truncate">{inq.propertyTitle}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1 italic">&quot;{inq.message}&quot;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Registered Users</h3>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Manage
                  </button>
                </div>

                {usersList.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No users registered yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {usersList.slice(0, 5).map((u) => (
                      <div key={u.uid} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "SELLER_PROPERTY_OWNER"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.role === "SELLER_PROPERTY_OWNER" ? "Seller" : u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: PROPERTIES MANAGEMENT                         */}
        {/* ==================================================== */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, city, street..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 cursor-pointer"
                >
                  <option value="all">All Types (Buy &amp; Rent)</option>
                  <option value="buy">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>

            {/* Properties List / Cards */}
            {isLoadingProperties ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Fetching properties from Firestore...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
                <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No properties match your filter</h3>
                <p className="text-xs text-gray-500">Try adjusting your search criteria or add a new property.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative h-44 w-full bg-gray-100">
                        <Image
                          src={prop.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
                          alt={prop.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gray-950/80 text-white backdrop-blur-md">
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

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{prop.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">
                            {prop.location?.address ? `${prop.location.address}, ` : ""}
                            {prop.location?.city}, {prop.location?.state}
                          </span>
                        </div>
                        <div className="text-base font-black text-indigo-600">
                          {formatPrice(prop.price, prop.type)}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                          <span>{prop.bedrooms} Beds</span>
                          <span>•</span>
                          <span>{prop.bathrooms} Baths</span>
                          <span>•</span>
                          <span className="capitalize">{prop.propertyType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                      <select
                        value={prop.status}
                        onChange={(e) =>
                          void handleUpdatePropertyStatus(prop.id, e.target.value as Property["status"])
                        }
                        className="text-[11px] font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 cursor-pointer"
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="rented">Rented</option>
                      </select>

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
                          title="Edit Property"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => void handleDeleteProperty(prop.id, prop.title)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Delete Property"
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

        {/* ==================================================== */}
        {/* TAB 3: USER MANAGEMENT                               */}
        {/* ==================================================== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Search user by name, email, phone..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="text-xs font-semibold text-gray-500">
                Total Users: <span className="text-gray-900 font-bold">{usersList.length}</span>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Loading users from Firestore...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-2">
                <Users className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No users found</h3>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4">User</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Created Date</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900">{u.name}</div>
                            <div className="text-gray-500 text-[11px]">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                u.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-700"
                                  : u.role === "SELLER_PROPERTY_OWNER"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {u.role === "SELLER_PROPERTY_OWNER" ? "Seller / Agent" : u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">
                            <div>{u.phone || "—"}</div>
                            {u.agencyName && (
                              <div className="text-[11px] text-gray-400 font-medium">{u.agencyName}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500">{formatDate(u.createdAt)}</td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => void handleToggleUserActive(u)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                u.isActive
                                  ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                                  : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              }`}
                              title={u.isActive ? "Deactivate User" : "Activate User"}
                            >
                              {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => void handleDeleteUser(u)}
                              className="p-1.5 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: INQUIRIES MANAGEMENT                          */}
        {/* ==================================================== */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">
                Marketplace Client Inquiries ({inquiries.length})
              </h3>
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 cursor-pointer"
                >
                  <option value="all">All Inquiries</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed / In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {isLoadingInquiries ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Loading inquiries from database...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-2">
                <MessageSquare className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-900">No inquiries found</h3>
                <p className="text-xs text-gray-500">Inquiries sent by prospective buyers/renters will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm">{inq.userName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              inq.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : inq.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : inq.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-indigo-600">{inq.propertyTitle}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            void handleUpdateInquiryStatus(inq.id, e.target.value as Inquiry["status"])
                          }
                          className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => void handleDeleteInquiry(inq.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl">&quot;{inq.message}&quot;</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`mailto:${inq.userEmail}`} className="hover:text-indigo-600">
                          {inq.userEmail}
                        </a>
                      </div>
                      {inq.userPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <a href={`tel:${inq.userPhone}`} className="hover:text-indigo-600">
                            {inq.userPhone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-400 text-[11px] ml-auto">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(inq.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT NIGERIAN PROPERTY                  */}
      {/* ==================================================== */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  {editingPropertyId ? "Edit Nigerian Property" : "Publish Nigerian Property"}
                </h3>
                <p className="text-xs text-gray-500">
                  Fill details and upload real photos to Firebase Storage &amp; Firestore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPropertyModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {propertyError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {propertyError}
              </div>
            )}

            <form onSubmit={handleSavePropertySubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">Listing Title *</label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="e.g. 5 Bedroom Fully Detached Luxury Mansion with Swimming Pool"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Type & Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Listing Type</label>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as ListingType)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="buy">For Sale (Buy)</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Property Category</label>
                  <select
                    value={propPropertyType}
                    onChange={(e) => setPropPropertyType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">
                    Price (₦ Naira) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value)}
                    placeholder="e.g. 180000000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Status</label>
                  <select
                    value={propStatus}
                    onChange={(e) => setPropStatus(e.target.value as Property["status"])}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>

              {/* Location Details */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Nigerian Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">State *</label>
                    <select
                      value={propState}
                      onChange={(e) => setPropState(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    >
                      {NIGERIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">City / Area *</label>
                    <input
                      type="text"
                      required
                      value={propCity}
                      onChange={(e) => setPropCity(e.target.value)}
                      placeholder="e.g. Lekki, Ikoyi, Maitama"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">LGA / District</label>
                    <input
                      type="text"
                      value={propLga}
                      onChange={(e) => setPropLga(e.target.value)}
                      placeholder="e.g. Eti-Osa"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={propAddress}
                      onChange={(e) => setPropAddress(e.target.value)}
                      placeholder="e.g. 15 Admiralty Way, Lekki Phase 1"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Property Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Bedrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={propBeds}
                      onChange={(e) => setPropBeds(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Bathrooms</label>
                    <input
                      type="number"
                      min={0}
                      value={propBaths}
                      onChange={(e) => setPropBaths(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Parking</label>
                    <input
                      type="number"
                      min={0}
                      value={propParking}
                      onChange={(e) => setPropParking(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Area (sqft)</label>
                    <input
                      type="number"
                      min={0}
                      value={propSqFt}
                      onChange={(e) => setPropSqFt(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  placeholder="Describe building highlights, power, security, title (Gov Consent / C of O)..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              {/* Amenities */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">
                  Amenities (comma separated)
                </label>
                <input
                  type="text"
                  value={propAmenities}
                  onChange={(e) => setPropAmenities(e.target.value)}
                  placeholder="24/7 Power Supply, Swimming Pool, CCTV, Fitted Kitchen"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              {/* Images & Storage Upload */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-900">
                    Property Images ({propImages.length}) *
                  </label>
                  <span className="text-[11px] text-gray-500">First image is cover</span>
                </div>

                <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photos to Storage</span>
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
                    JPG, PNG, WebP up to 10MB each stored in Firebase Storage.
                  </p>
                </div>

                {isUploadingImages && (
                  <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>{uploadProgressText || "Uploading images to Firebase Storage..."}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="Or paste external image URL..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualImage}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Add URL
                  </button>
                </div>

                {propImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {propImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-xl overflow-hidden group bg-gray-100 border border-gray-200">
                        <Image src={img} alt={`preview ${idx}`} fill className="object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded">
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
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProperty}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmittingProperty ? (
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