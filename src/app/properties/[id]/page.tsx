"use client";

import { use, useState } from "react";
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
} from "lucide-react";
import { usePropertyStore, Property } from "@/store/propertyStore";
import {
  formatPrice,
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Inquiry Form State
  const [tourType, setTourType] = useState<"in-person" | "video">("in-person");
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("10:00 AM");
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Hello, I am interested in this residence and would like to learn more or schedule a private viewing."
  );
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const property = properties.find((p) => p.id === id);

  if (!property && mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The property you are looking for does not exist or may have been removed.
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

  // Fallback while mounting or finding
  const currentProp: Property = property || properties[0];
  const favorited = mounted ? isFavorite(currentProp.id) : false;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addInquiry({
      propertyId: currentProp.id,
      propertyTitle: currentProp.title,
      propertyImage: currentProp.images[0],
      userName: name,
      userEmail: email,
      userPhone: phone,
      message,
      tourType,
      tourDate: tourDate || undefined,
      tourTime: tourTime || undefined,
    });

    setInquirySubmitted(true);
  };

  const similarProperties = properties
    .filter(
      (p) =>
        p.id !== currentProp.id &&
        (p.location.city === currentProp.location.city ||
          p.propertyType === currentProp.propertyType)
    )
    .slice(0, 3);

  const pricePerSqFt = Math.round(currentProp.price / currentProp.areaSqFt);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-gray-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/properties" className="hover:text-gray-900 transition-colors">
          Properties
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">
          {currentProp.title}
        </span>
      </nav>

      {/* Header Section: Title, Badges, Price, Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-200">
        <div className="space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentProp.type === "buy"
                  ? "bg-indigo-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {currentProp.type === "buy" ? "For Sale" : "For Rent"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
              {currentProp.propertyType}
            </span>
            {currentProp.featured && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">
                <Sparkles className="w-3.5 h-3.5" /> Featured
              </span>
            )}
            {currentProp.status !== "available" && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-600 text-white">
                {currentProp.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            {currentProp.title}
          </h1>

          {/* Address */}
          <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              {currentProp.location.address}, {currentProp.location.city},{" "}
              {currentProp.location.state} {currentProp.location.zipCode},{" "}
              {currentProp.location.country}
            </span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4">
          <div className="lg:text-right">
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {formatPrice(currentProp.price, currentProp.type)}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">
              {currentProp.type === "buy"
                ? `Est. ${formatCurrency(pricePerSqFt)} / sqft`
                : "Security deposit and terms apply"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(currentProp.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                favorited
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  favorited ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
              <span>{favorited ? "Saved to Favorites" : "Save Residence"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media Showcase (Hero Gallery + Thumbnails) */}
      <div className="space-y-4">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-lg bg-gray-100">
          <Image
            src={
              currentProp.images[selectedImageIndex] ||
              currentProp.images[0]
            }
            alt={currentProp.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Thumbnail Selector */}
        {currentProp.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {currentProp.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-24 sm:w-32 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  selectedImageIndex === idx
                    ? "border-indigo-600 ring-2 ring-indigo-300 scale-95"
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

      {/* Main Grid: Details (Left 2/3) vs Agent & Contact (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Specs, Description, Amenities, Location */}
        <div className="lg:col-span-2 space-y-10">
          {/* Key Specs Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600">
                <Bed className="w-5 h-5" />
              </div>
              <div className="text-xl font-extrabold text-gray-900">
                {currentProp.bedrooms}
              </div>
              <div className="text-xs text-gray-500 font-medium">Bedrooms</div>
            </div>

            <div className="space-y-1 border-l border-gray-100">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600">
                <Bath className="w-5 h-5" />
              </div>
              <div className="text-xl font-extrabold text-gray-900">
                {currentProp.bathrooms}
              </div>
              <div className="text-xs text-gray-500 font-medium">Bathrooms</div>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600">
                <Square className="w-5 h-5" />
              </div>
              <div className="text-xl font-extrabold text-gray-900">
                {formatNumber(currentProp.areaSqFt)}
              </div>
              <div className="text-xs text-gray-500 font-medium">Total Sq Ft</div>
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0">
              <div className="flex items-center justify-center gap-1.5 text-indigo-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-xl font-extrabold text-gray-900">
                {currentProp.yearBuilt}
              </div>
              <div className="text-xs text-gray-500 font-medium">Year Built</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              About This Residence
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base font-normal">
              {currentProp.description}
            </p>
          </div>

          {/* Amenities & Features */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              Features & Amenities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentProp.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/60 text-sm font-medium text-gray-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Neighborhood info */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              Location & Neighborhood
            </h2>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {currentProp.location.address}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {currentProp.location.city}, {currentProp.location.state}{" "}
                    {currentProp.location.zipCode},{" "}
                    {currentProp.location.country}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed pt-2">
                Situated in an elite residential enclave with immediate access
                to top-tier cultural destinations, private schools, fine
                dining, and major transit corridors.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Agent Profile & Schedule a Tour / Inquiry */}
        <div className="space-y-6">
          {/* Agent Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-indigo-100 shrink-0">
                <Image
                  src={currentProp.agent.avatar}
                  alt={currentProp.agent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5" /> Listing Agent
                </span>
                <h3 className="text-lg font-bold text-gray-900">
                  {currentProp.agent.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {currentProp.agent.agency}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
              <a
                href={`tel:${currentProp.agent.phone}`}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <Phone className="w-4 h-4 text-indigo-600" />
                <span>{currentProp.agent.phone}</span>
              </a>
              <a
                href={`mailto:${currentProp.agent.email}`}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span className="truncate">{currentProp.agent.email}</span>
              </a>
            </div>
          </div>

          {/* Schedule a Tour & Send Inquiry Form */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-gray-900">
              Schedule a Private Viewing
            </h3>

            {inquirySubmitted ? (
              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900">Tour Requested!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you, {name}. {currentProp.agent.name} has been notified
                  and will confirm your private walkthrough shortly.
                </p>
                <button
                  onClick={() => setInquirySubmitted(false)}
                  className="text-xs text-emerald-800 font-semibold underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                {/* Tour Type Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTourType("in-person")}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                      tourType === "in-person"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    In-Person Tour
                  </button>
                  <button
                    type="button"
                    onClick={() => setTourType("video")}
                    className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                      tourType === "video"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    4K Video Tour
                  </button>
                </div>

                {/* Date & Time Picker */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-gray-500 mb-1">
                      Preferred Time
                    </label>
                    <select
                      value={tourTime}
                      onChange={(e) => setTourTime(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Request Private Tour
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {similarProperties.length > 0 && (
        <section className="pt-12 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Similar Premier Residences
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Other residences you may appreciate in our curated collection.
              </p>
            </div>
            <Link
              href="/properties"
              className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

