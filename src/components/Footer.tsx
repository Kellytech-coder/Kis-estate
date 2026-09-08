"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
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
                  href="/admin"
                  className="hover:text-white transition-colors"
                >
                  Property Manager Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Top Markets
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/properties?city=New York"
                  className="hover:text-white transition-colors"
                >
                  New York, NY
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Beverly Hills"
                  className="hover:text-white transition-colors"
                >
                  Beverly Hills, CA
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Miami"
                  className="hover:text-white transition-colors"
                >
                  Miami, FL
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Austin"
                  className="hover:text-white transition-colors"
                >
                  Austin, TX
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=San Francisco"
                  className="hover:text-white transition-colors"
                >
                  San Francisco, CA
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Exclusive Insights
            </h4>
            <p className="text-xs text-gray-400">
              Get the latest curated private listings and quarterly real estate
              market reports directly to your inbox.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you! You are subscribed to private market insights.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <span>Direct inquiries:</span>
              <a
                href="mailto:concierge@havenestate.com"
                className="text-gray-400 hover:text-white underline underline-offset-2"
              >
                concierge@havenestate.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HavenEstate Luxury Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Equal Housing Opportunity</span>
            <Link href="#" className="hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

