"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Building2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = usePropertyStore();

  const [email, setEmail] = useState("alex.admin@havenestate.com");
  const [password, setPassword] = useState("••••••••••••");
  const [securityPin, setSecurityPin] = useState("849201");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      login(email || "alex.admin@havenestate.com", "admin", "Alex Realtor (Admin)");
      router.push("/admin");
    }, 400);
  };

  const handleDemoAdmin = () => {
    setLoading(true);
    login("alex.admin@havenestate.com", "admin", "Alex Realtor (Admin)");
    router.push("/admin");
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-16 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-8 bg-slate-900/90 border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
        {/* Security Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Restricted Access Management</span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Haven<span className="text-indigo-400">Admin</span>
            </span>
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            Administrator Authentication
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized real estate executives, brokers, and staff only. System
            access is monitored and logged.
          </p>
        </div>

        {/* 1-Click Fast Admin Sign In for Demonstration */}
        <div className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast Admin Access</span>
          </div>
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
          >
            <span>Sign In as Verified Administrator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Executive Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Security Token / PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                maxLength={6}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? "Authenticating..." : "Authorize & Enter Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to HavenEstate Public Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
