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
  Building2,
  ArrowLeft,
} from "lucide-react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { usePropertyStore } from "@/store/propertyStore";

/**
 * ============================================================
 * API CONFIGURATION
 * ============================================================
 *
 * Frontend:
 * http://localhost:3000
 *
 * Node.js backend:
 * http://localhost:4000
 *
 * PostgreSQL:
 * localhost:5432
 *
 * The browser NEVER communicates directly with PostgreSQL.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

type LoginUser = {
  id?: number | string;
  uid?: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "AGENT";
};

type LoginResponse = {
  user?: LoginUser;
  token?: string;
  message?: string;
  error?: {
    message?: string;
  };
};

/**
 * ============================================================
 * ADMIN LOGIN PAGE
 * ============================================================
 */

export default function AdminLoginPage() {
  const router = useRouter();

  const { login } = usePropertyStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * ==========================================================
   * HANDLE ADMIN LOGIN
   * ==========================================================
   */

  const handleAdminLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setErrorMsg("");

    const normalizedEmail = email.trim().toLowerCase();

    /**
     * Validate email.
     */
    if (!normalizedEmail) {
      setErrorMsg(
        "Please enter your administrator email."
      );
      return;
    }

    /**
     * Validate password.
     */
    if (!password) {
      setErrorMsg(
        "Please enter your administrator password."
      );
      return;
    }

    setLoading(true);

    try {
      /**
       * ======================================================
       * STEP 1
       * Firebase authenticates the administrator.
       *
       * Firebase checks:
       * - Email
       * - Password
       *
       * If credentials are invalid, this throws an error.
       * ======================================================
       */

      const firebaseCredential =
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

      /**
       * Firebase authenticated user.
       */
      const firebaseUser = firebaseCredential.user;

      /**
       * ======================================================
       * STEP 2
       * Get Firebase ID token.
       *
       * This is the token the Node.js backend needs.
       * ======================================================
       */

      const idToken =
        await firebaseUser.getIdToken(true);

      if (!idToken) {
        throw new Error(
          "Firebase authentication succeeded, but no ID token was returned."
        );
      }

      /**
       * ======================================================
       * STEP 3
       * Send Firebase ID token to Node.js backend.
       *
       * IMPORTANT:
       * We DO NOT send the password to our Node.js API.
       *
       * Firebase already verified the password.
       * The backend verifies the Firebase ID token.
       * ======================================================
       */

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${idToken}`,
          },

          body: JSON.stringify({
            idToken,
          }),
        }
      );

      /**
       * ======================================================
       * STEP 4
       * Parse backend response.
       * ======================================================
       */

      let body: LoginResponse = {};

      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        try {
          body =
            (await response.json()) as LoginResponse;
        } catch (parseError) {
          console.error(
            "Unable to parse login response:",
            parseError
          );
        }
      } else {
        const text = await response.text();

        if (text) {
          console.error(
            "Unexpected login response:",
            text
          );
        }
      }

      /**
       * ======================================================
       * STEP 5
       * Handle backend HTTP errors.
       * ======================================================
       */

      if (!response.ok) {
        const serverMessage =
          body.error?.message ||
          body.message;

        throw new Error(
          serverMessage ||
            `Login failed. Server returned HTTP ${response.status}.`
        );
      }

      /**
       * ======================================================
       * STEP 6
       * Verify backend returned a user.
       * ======================================================
       */

      if (!body.user) {
        throw new Error(
          "Authentication succeeded, but the server did not return a user."
        );
      }

      /**
       * ======================================================
       * STEP 7
       * Verify ADMIN role.
       *
       * This is an additional frontend check.
       *
       * IMPORTANT:
       * The backend must ALSO enforce this restriction.
       * ======================================================
       */

      if (body.user.role !== "ADMIN") {
        throw new Error(
          "Access denied. Administrator privileges are required."
        );
      }

      /**
       * ======================================================
       * STEP 8
       * Store admin information in Zustand.
       *
       * This is frontend state only.
       * Real authorization remains on the backend.
       * ======================================================
       */

      login(
        body.user.email,
        "admin",
        body.user.name
      );

      /**
       * Clear password from React state.
       */
      setPassword("");

      /**
       * ======================================================
       * STEP 9
       * Redirect to administrator dashboard.
       * ======================================================
       */

      router.replace("/admin");
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      /**
       * Firebase authentication errors.
       */
      if (
        error &&
        typeof error === "object" &&
        "code" in error
      ) {
        const firebaseError = error as {
          code?: string;
        };

        switch (firebaseError.code) {
          case "auth/invalid-credential":
            setErrorMsg(
              "Invalid administrator email or password."
            );
            break;

          case "auth/user-not-found":
            setErrorMsg(
              "No administrator account was found with this email."
            );
            break;

          case "auth/wrong-password":
            setErrorMsg(
              "The administrator password is incorrect."
            );
            break;

          case "auth/invalid-email":
            setErrorMsg(
              "Please enter a valid administrator email."
            );
            break;

          case "auth/too-many-requests":
            setErrorMsg(
              "Too many login attempts. Please try again later."
            );
            break;

          default:
            setErrorMsg(
              "Firebase authentication failed. Please try again."
            );
        }
      } else if (
        error instanceof TypeError &&
        error.message
          .toLowerCase()
          .includes("fetch")
      ) {
        /**
         * Backend unreachable.
         */
        setErrorMsg(
          "Unable to connect to the backend server. Make sure the Node.js API is running on port 4000."
        );
      } else {
        /**
         * Backend or application error.
         */
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Unable to authenticate administrator."
        );
      }

      /**
       * Clear password after failed authentication.
       */
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-[90vh] flex items-center justify-center px-4 py-16 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-8 bg-slate-900/90 border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md">

        {/* SECURITY HEADER */}
        <div className="text-center space-y-3">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />

            <span>
              Restricted Access Management
            </span>
          </div>

          {/* BRAND */}
          <div className="flex items-center justify-center gap-2 pt-1">

            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900">
              <Building2 className="w-5 h-5" />
            </div>

            <span className="text-2xl font-black tracking-tight text-white">
              Kis
              <span className="text-indigo-400">
                Admin
              </span>
            </span>

          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            Administrator Authentication
          </h1>

          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Authorized real estate administrators only.
            Access to this console is restricted and
            protected by server-side authentication.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 bg-rose-950/80 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex items-start gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />

            <span className="leading-relaxed">
              {errorMsg}
            </span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form
          onSubmit={handleAdminLogin}
          className="space-y-4"
        >

          {/* EMAIL */}
          <div className="space-y-1.5">

            <label
              htmlFor="admin-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Executive Email
            </label>

            <div className="relative">

              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              <input
                id="admin-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                placeholder="Enter administrator email"
                aria-invalid={Boolean(errorMsg)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              />

            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">

            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-400"
            >
              Administrator Password
            </label>

            <div className="relative">

              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={loading}
                placeholder="Enter administrator password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
              />

            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={
              loading ||
              !email.trim() ||
              !password
            }
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2"
          >
            <span>
              {loading
                ? "Authenticating..."
                : "Authorize & Enter Console"}
            </span>

            <ArrowRight
              className={`w-4 h-4 ${
                loading
                  ? "animate-pulse"
                  : ""
              }`}
            />
          </button>
        </form>

        {/* SECURITY NOTICE */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">

          <div className="flex items-start gap-2">

            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />

            <p className="text-[11px] leading-relaxed text-slate-500">
              Administrator access is verified by the
              backend. Frontend state alone does not grant
              access to protected resources.
            </p>

          </div>
        </div>

        {/* BACK TO WEBSITE */}
        <div className="pt-4 border-t border-slate-800 text-center">

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />

            <span>
              Return to KisEstate Public Site
            </span>
          </Link>

        </div>

      </div>
    </main>
  );
}

