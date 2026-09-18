"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authApi } from "@/lib/api";
import { usePropertyStore } from "@/store/propertyStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setCurrentUser } = usePropertyStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMsg("Please enter your administrator email.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your administrator password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Firebase Auth verify credentials
      const credential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      // 2. Obtain Firebase ID Token
      const idToken = await credential.user.getIdToken(true);
      if (!idToken) {
        throw new Error("Authentication succeeded, but no token was returned.");
      }

      // 3. Backend verifies ID token and confirms ADMIN role in Firestore
      const res = await authApi.loginAdmin(idToken);

      if (!res.user || res.user.role !== "ADMIN") {
        throw new Error("Access denied. Administrator privileges required.");
      }

      // 4. Update store
      setCurrentUser(res.user);

      // 5. Redirect to admin dashboard
      router.replace("/admin");
    } catch (error: unknown) {
      console.error("Admin login error:", error);

      if (error && typeof error === "object" && "code" in error) {
        const firebaseError = error as { code: string; message?: string };
        switch (firebaseError.code) {
          case "auth/invalid-credential":
          case "auth/user-not-found":
          case "auth/wrong-password":
            setErrorMsg("Invalid administrator email or password.");
            break;
          case "auth/invalid-email":
            setErrorMsg("Please enter a valid administrator email.");
            break;
          case "auth/too-many-requests":
            setErrorMsg("Too many attempts. Please try again later.");
            break;
          default:
            setErrorMsg("Authentication failed. Please check your credentials.");
        }
      } else if (error instanceof Error) {
        setErrorMsg(error.message || "Failed to authenticate administrator.");
      } else {
        setErrorMsg("Failed to authenticate administrator.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Estate Staff &amp; Admin Portal
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Authorized real estate managers and system administrators only.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-start gap-3 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All administrative logins are securely verified against the Firebase Admin SDK and protected by role-based access control.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-red-950/70 border border-red-800 rounded-2xl text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@havenestate.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Privileges...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
