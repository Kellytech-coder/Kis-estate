"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, Loader2, Mail, AlertCircle } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Enter the email address associated with your account.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-email") {
        setError("Enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many reset requests. Please wait a while and try again.");
      } else if (code === "auth/network-request-failed") {
        setError("Network connection issue. Check your connection and try again.");
      } else {
        setError("We couldn’t send a reset email right now. Please try again shortly.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-7 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl sm:p-10">
        <div className="space-y-3 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              KIS<span className="text-indigo-600">Estate</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-500">
            Enter your account email and we’ll send you a link to choose a new password.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm text-emerald-800">
            <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
            <p>If an account exists for that email, a password reset link is on its way. Check your inbox.</p>
          </div>
        ) : (
          <>
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="block text-xs font-semibold uppercase text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending link...</> : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <Link href="/login" className="mx-auto flex w-fit items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
