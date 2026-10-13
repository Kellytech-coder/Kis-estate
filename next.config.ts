import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async rewrites() {
    const configuredBackendUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
    // localhost is only a valid fallback while developing on this machine.
    // A production build without the backend URL must not proxy traffic to Vercel's localhost.
    const backendUrl = configuredBackendUrl || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : null);
    if (!backendUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
