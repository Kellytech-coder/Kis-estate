"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Home,
} from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<"BUYER_RENTER" | "SELLER_PROPERTY_OWNER">("BUYER_RENTER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrorMsg("Please accept the Terms of Service & Privacy Policy to continue.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanAgency = agencyName.trim();

    if (!cleanName || !normalizedEmail || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );
      const user = userCredential.user;

      // 2. Set Firebase Auth display name
      await updateProfile(user, {
        displayName: cleanName,
      });

      // 3. Create user document in Firestore users/{uid}
      // Strictly assign selected role (BUYER_RENTER or SELLER_PROPERTY_OWNER)
      const userProfile = {
        uid: user.uid,
        name: cleanName,
        email: normalizedEmail,
        phone: cleanPhone || null,
        agencyName: accountType === "SELLER_PROPERTY_OWNER" ? (cleanAgency || "Independent Owner") : null,
        role: accountType,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      if (accountType === "SELLER_PROPERTY_OWNER") {
        router.push("/seller");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const fbErr = err as { code?: string; message?: string };
      console.error("Registration error:", err);

      switch (fbErr.code) {
        case "auth/email-already-in-use":
          setErrorMsg("An account with this email already exists. Please sign in instead.");
          break;
        case "auth/invalid-email":
          setErrorMsg("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setErrorMsg("The password provided is too weak. Please use a stronger password.");
          break;
        case "auth/network-request-failed":
          setErrorMsg("Network connection error. Please check your internet connection.");
          break;
        default:
          setErrorMsg(fbErr.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              KIS<span className="text-indigo-600">Estate</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-gray-500">
            Join Nigeria&apos;s premier real estate platform to find, save, or list properties.
          </p>
        </div>

        {/* Account Type Selector Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 text-center">
            Select Your Account Purpose
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100/90 rounded-2xl">
            <button
              type="button"
              onClick={() => setAccountType("BUYER_RENTER")}
              className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                accountType === "BUYER_RENTER"
                  ? "bg-white text-indigo-700 shadow-md font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50 font-medium"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm">Buyer / Renter</span>
              </div>
              <span className="text-[10px] text-gray-500 leading-tight">
                Buy, rent &amp; schedule tours
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("SELLER_PROPERTY_OWNER")}
              className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                accountType === "SELLER_PROPERTY_OWNER"
                  ? "bg-white text-indigo-700 shadow-md font-bold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50 font-medium"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm">Seller / Owner</span>
              </div>
              <span className="text-[10px] text-gray-500 leading-tight">
                List &amp; manage properties
              </span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-700">
              Full Legal Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chukwuemeka Eze"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-700">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-700">
              Nigerian Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 803 123 4567"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all"
              />
            </div>
          </div>

          {accountType === "SELLER_PROPERTY_OWNER" && (
            <div className="space-y-1 animate-in fade-in">
              <label className="block text-xs font-semibold uppercase text-gray-700">
                Agency / Company / Brand Name (Optional)
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Lekki Prime Homes Ltd"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-700">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer select-none">
              I agree to the Terms of Service &amp; Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration ({accountType === "SELLER_PROPERTY_OWNER" ? "Seller" : "Buyer/Renter"})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
