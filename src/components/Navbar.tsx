"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Heart,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { usePropertyStore } from "@/store/propertyStore";
import { useIsMounted } from "@/lib/utils";

interface NavLinkItem {
  name: string;
  href: string;
  badge?: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mounted = useIsMounted();

  const pathname = usePathname();
  const { favorites, currentUser, logout } = usePropertyStore();

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.role === "ADMIN";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseNavLinks: NavLinkItem[] = [
    { name: "Explore", href: "/properties" },
    { name: "Buy", href: "/buy" },
    { name: "Rent", href: "/rent" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  // Only append Admin Console if the authenticated user has ADMIN role
  const navLinks: NavLinkItem[] = isAdmin
    ? [
        ...baseNavLinks,
        { name: "Admin Console", href: "/admin", badge: "Admin" },
      ]
    : baseNavLinks;

  const favCount = mounted ? favorites.length : 0;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-all">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 block leading-tight">
                KIS<span className="text-indigo-600">Estate</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-gray-400 block">
                Luxury Living
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative flex items-center gap-1.5 ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50/80 font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Favorites Counter */}
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl text-gray-600 hover:text-rose-600 hover:bg-rose-50/60 transition-all relative"
              title="Saved Properties"
            >
              <Heart className="w-5 h-5" />
              {favCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                  {favCount}
                </span>
              )}
            </Link>

            {/* User Profile or Sign In */}
            {mounted && currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  onClick={() => void logout()}
                  title="Sign Out"
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/dashboard"
              className="p-2 text-gray-600 hover:text-rose-600 relative"
            >
              <Heart className="w-5 h-5" />
              {favCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white/98 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50 font-bold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            {mounted && currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 block">
                      {currentUser.name}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    void logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-semibold text-center transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-xl bg-gray-100 text-gray-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
