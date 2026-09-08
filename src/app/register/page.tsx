"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  User,
  ArrowRight,
  Briefcase,
  Home,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = usePropertyStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setLoading(true);
    setTimeout(() => {
      login(email, role, name || "New Member");
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Haven<span className="text-indigo-600">Estate</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-gray-500">
            Join HavenEstate to save luxury favorites, book private tours, or list your portfolio.
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase text-gray-600">
            I am joining as:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                role === "user"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Home className="w-4 h-4 text-indigo-600" />
                Buyer / Renter
              </div>
              <span className="text-[11px] text-gray-500">
                Browse & tour homes
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                role === "admin"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500"
                  : "border-gray-200 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Owner / Agent
              </div>
              <span className="text-[11px] text-gray-500">
                List & manage properties
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-700">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-700">
              Email Address
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
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-900 transition-all"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-gray-600 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="terms" className="cursor-pointer leading-normal">
              I agree to the{" "}
              <Link href="#" className="text-indigo-600 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-indigo-600 underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? "Creating account..." : "Complete Registration"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 ml-1"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

