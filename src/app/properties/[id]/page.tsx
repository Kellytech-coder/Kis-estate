"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Heart,
  Share2,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  Sparkles,
  ArrowLeft,
  Send,
  Video,
  UserCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePropertyStore, Property } from "@/store/propertyStore";
import { propertiesApi } from "@/lib/api";
import {
  formatNumber,
  formatCurrency,
  useIsMounted,
} from "@/lib/utils";
import PropertyCard from "@/components/PropertyCard";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const {
    properties,
    toggleFavorite,
    isFavorite,
    addInquiry,
    currentUser,
  } = usePropertyStore();

  const mounted = useIsMounted();
  const [property, setProperty] = useState<Property | null>(
    properties.find((p) => p.id === id) || null
  );
  const [loadingProperty, setLoadingProperty] = useState(!property);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Inquiry Form State
  const [tourType, setTourType] = useState<"in-person" | "video">("in-person");
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("10:00 AM");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Hello, I am interested in this residence and would like to learn more or schedule a private viewing."
  );
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  const currentName = customName || currentUser?.name || "";
  const currentEmail = customEmail || currentUser?.email || "";

  useEffect(() => {
    // If not found in memory, fetch directly from API
    const loadProperty = async () => {
      try {
        setLoadingProperty(true);
        const res = await propertiesApi.getById(id);
        if (res.data) {
          setProperty(res.data);
        } else {
          setFetchError("Property not found.");
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Property not found.";
        console.error("Error fetching property:", err);
        setFetchError(errMsg);
      } finally {
        setLoadingProperty(false);
      }
    };

    if (!property) {
      void loadProperty();
    }
  }, [id, property]);

  const favorited = mounted && property ? isFavorite(property.id) : false;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    const finalName = currentName.trim();
    const finalEmail = currentEmail.trim();

    if (!finalName || !finalEmail || !message.trim()) {
      setInquiryError("Please provide your name, email, and message.");
      return;
    }

    setInquiryError("");
    setSubmittingInquiry(true);

    try {
      await addInquiry({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImage: property.images?.[0] || "",
        userName: finalName,
        userEmail: finalEmail,
        userPhone: phone.trim(),
        message: message.trim(),
        tourType,
        tourDate: tourDate || undefined,
        tourTime: tourTime || undefined,
        userId: currentUser?.uid || null,
      });

      setInquirySubmitted(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to submit inquiry.";
      console.error("Inquiry submission failed:", err);
      setInquiryError(errMsg);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loadingProperty) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">
          Loading property details from database...
        </p>
      </div>
    );
  }

  if (!property || fetchError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
          <Building className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Property Not Found
        </h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          The property you are looking for does not exist or may have been updated in the database.
        </p>
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Properties
        </Link>
      </div>
    );
  }

  const images = property.images?.length > 0
    ? property.images
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"];

  const similarProperties = properties
    .filter((p) => p.id !== property.id && p.type === property.type)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? "Link Copied!" : "Share"}</span>
          </button>
          <button
            onClick={() => toggleFavorite(property.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              favorited
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                favorited ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
            <span>{favorited ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                property.type === "buy"
                  ? "bg-indigo-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              For {property.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
              {property.propertyType}
            </span>
            {property.featured && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Featured Sanctuary
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            {property.title}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {property.location?.address}, {property.location?.city},{" "}
              {property.location?.state} {property.location?.zipCode}
            </span>
          </p>
        </div>

        <div className="text-left md:text-right space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-gray-900">
            {formatCurrency(property.price)}
            {property.type === "rent" && (
              <span className="text-base text-gray-500 font-normal">/mo</span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {property.type === "buy"
              ? `Est. ${formatCurrency(Math.round(property.price / 360))}/mo mortgage`
              : "Security deposit required upon lease"}
          </p>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative h-[340px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden shadow-md bg-gray-950">
          <Image
            src={images[selectedImageIndex] || images[0]}
            alt={property.title}
            fill
            priority
            className="object-cover object-center transition-all duration-300"
          />
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative h-20 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImageIndex === idx
                    ? "border-indigo-600 ring-2 ring-indigo-600/30 scale-[1.02]"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 2 Cols: Specs & Overview */}
        <div className="lg:col-span-2 space-y-10">
          {/* Key Specs Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Bedrooms</span>
                <span className="text-base font-bold text-gray-900">
                  {property.bedrooms} Beds
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Bathrooms</span>
                <span className="text-base font-bold text-gray-900">
                  {property.bathrooms} Baths
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Square className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Living Area</span>
                <span className="text-base font-bold text-gray-900">
                  {formatNumber(property.areaSqFt)} sqft
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Year Built</span>
                <span className="text-base font-bold text-gray-900">
                  {property.yearBuilt}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              About This Residence
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line font-light">
              {property.description}
            </p>
          </div>

          {/* Amenities & Features */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Premium Features &amp; Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-xs text-xs font-medium text-gray-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Card */}
          {property.agent && (
            <div className="p-6 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Listing Advisor
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden relative bg-gray-100 shrink-0">
                    <Image
                      src={property.agent.avatar}
                      alt={property.agent.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">
                      {property.agent.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {property.agent.agency}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Advisor</span>
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Interactive Schedule / Tour Booking Form */}
        <div className="lg:col-span-1 sticky top-28 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                Schedule a Private Tour
              </h3>
              <p className="text-xs text-gray-500">
                Book an in-person or live video walkthrough with an agent.
              </p>
            </div>

            {inquirySubmitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Tour Request Sent
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your inquiry has been submitted to the advisor. We will reach out shortly to confirm your viewing schedule.
                </p>
                <button
                  onClick={() => setInquirySubmitted(false)}
                  className="text-xs text-emerald-900 font-bold underline cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {inquiryError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{inquiryError}</span>
                  </div>
                )}

                {/* Tour Type Switcher */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setTourType("in-person")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tourType === "in-person"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>In-Person</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTourType("video")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      tourType === "video"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Live Video</span>
                  </button>
                </div>

                {/* Date and Time Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 uppercase">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-700 uppercase">
                      Preferred Time
                    </label>
                    <select
                      value={tourTime}
                      onChange={(e) => setTourTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Contact Inputs */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 uppercase">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={currentName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Eleanor Vance"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={currentEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="eleanor@example.com"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 uppercase">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 uppercase">
                    Special Inquiries or Requests
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingInquiry ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Private Tour</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <div className="pt-12 border-t border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Similar Residences For {property.type === "buy" ? "Sale" : "Rent"}
            </h2>
            <Link
              href="/properties"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All Properties &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
