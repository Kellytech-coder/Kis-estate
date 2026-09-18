"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Lock,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-12 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/50">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                KIS<span className="text-indigo-400">Estate</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Discover unparalleled architectural gems, high-end estates, and
              urban luxury sanctuaries. We connect discerning buyers and renters
              with premier properties nationwide.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Verified Listings
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Award className="w-4 h-4" /> Premier Agency
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/properties"
                  className="hover:text-white transition-colors"
                >
                  All Properties
                </Link>
              </li>
              <li>
                <Link href="/buy" className="hover:text-white transition-colors">
                  Homes For Sale
                </Link>
              </li>
              <li>
                <Link href="/rent" className="hover:text-white transition-colors">
                  Rental Residences
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-indigo-300 text-gray-400 transition-colors inline-flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Staff Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Top Markets
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link
                  href="/properties?city=Beverly+Hills"
                  className="hover:text-white transition-colors"
                >
                  Beverly Hills, CA
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=New+York"
                  className="hover:text-white transition-colors"
                >
                  Manhattan &amp; Brooklyn, NY
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Miami"
                  className="hover:text-white transition-colors"
                >
                  Miami &amp; South Beach, FL
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Austin"
                  className="hover:text-white transition-colors"
                >
                  Austin &amp; Hill Country, TX
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=San+Francisco"
                  className="hover:text-white transition-colors"
                >
                  San Francisco Bay Area, CA
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Private Curations
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Receive confidential off-market briefings and new architectural listings weekly.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-900">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Subscribed to private curations.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="advisor@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Join Exclusive Access</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} KIS-Estate Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-400 transition-colors">Terms of Service</span>
            <span className="hover:text-gray-400 transition-colors">Equal Housing Opportunity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
