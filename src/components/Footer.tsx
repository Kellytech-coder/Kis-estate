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
  Mail,
  Send,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import { contactApi } from "@/lib/api";

export default function Footer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your name, email, and message.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      await contactApi.sendMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "General Property Inquiry",
        message: message.trim(),
      });

      setFeedback({
        type: "success",
        text: "Thank you! Your message has been sent to our desk. We will respond promptly.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: (err as Error)?.message || "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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
              Nigeria&apos;s leading property platform connecting buyers, tenants, and verified property developers with luxury homes, duplexes, serviced apartments, and prime land nationwide.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Title Verified Listings
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Award className="w-4 h-4" /> Premier Nigerian Realty
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
                  href="/seller"
                  className="hover:text-indigo-300 text-indigo-400 transition-colors inline-flex items-center gap-1 font-semibold"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Seller Portal</span>
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
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Nigerian Cities */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Top Nigerian Markets
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link
                  href="/properties?city=Ikoyi"
                  className="hover:text-white transition-colors"
                >
                  Ikoyi &amp; Victoria Island, Lagos
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Lekki"
                  className="hover:text-white transition-colors"
                >
                  Lekki Phase 1 &amp; Chevron, Lagos
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Maitama"
                  className="hover:text-white transition-colors"
                >
                  Maitama &amp; Asokoro, Abuja
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Port+Harcourt"
                  className="hover:text-white transition-colors"
                >
                  Old GRA, Port Harcourt
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Ibadan"
                  className="hover:text-white transition-colors"
                >
                  Bodija &amp; Oluyole, Ibadan
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?city=Enugu"
                  className="hover:text-white transition-colors"
                >
                  Independence Layout, Enugu
                </Link>
              </li>
            </ul>
          </div>

          {/* Real Contact Form */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contact Us / Inquiry</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Send a direct message to our real estate advisory desk.
            </p>

            {feedback && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                    : "bg-red-950/40 border-red-800 text-red-300"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-2">
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="email"
                required
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Subject / Property Interest"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <textarea
                rows={2}
                required
                placeholder="Your message or inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message to Advisor</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} KIS-Estate Nigeria. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-400 transition-colors">Terms of Service</span>
            <span className="hover:text-gray-400 transition-colors">Verified Nigerian Housing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
