// components/layout/Navbar.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Pill,
  User as UserIcon,
  Menu,
  X,
  FileText,
  LogOut,
  Store,
  Settings,
  CreditCard,
  ChevronDown,
} from "lucide-react";

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const isDashboardRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/billing" ||
    pathname === "/inventory" ||
    pathname === "/invoices" ||
    pathname === "/settings" ||
    pathname.startsWith("/invoices/");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const INACTIVITY_DELAY = 3000;

    const resetInactivityTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

      if (userDropdownOpen || mobileMenuOpen) return;

      inactivityTimer.current = setTimeout(() => {
        if (window.scrollY > 80) {
          setIsVisible(false);
        }
      }, INACTIVITY_DELAY);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 80) {
        setIsVisible(true);
        resetInactivityTimer();
        lastScrollY.current = currentScrollY;
        return;
      }

      if (userDropdownOpen || mobileMenuOpen) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
        resetInactivityTimer();
      } else if (currentScrollY > lastScrollY.current + 5) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    const handleUserActivity = () => {
      setIsVisible(true);
      resetInactivityTimer();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleUserActivity, { passive: true });
    window.addEventListener("keydown", handleUserActivity, { passive: true });

    resetInactivityTimer();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [userDropdownOpen, mobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isDashboardRoute) {
    return null;
  }

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      sessionStorage.removeItem("auth_user");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      clearAuth();
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
      router.push("/signin");
    }
  };

  const navLinks = [
    { name: "Medicines", href: "/medicines" },
    { name: "Stores", href: "/shops" },
    { name: "Prescription", href: "/prescription" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 h-16 flex items-center justify-between gap-4 lg:gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2a9d8f] group-hover:bg-[#2a9d8f] group-hover:text-white transition-all shadow-xs">
            <Pill className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-zinc-900 leading-none">
              Pharma<span className="text-[#2a9d8f]">Care</span>
            </span>
            <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase mt-0.5">
              Healthcare & POS
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "text-[#2a9d8f] bg-teal-50 px-3 py-1.5 rounded-md"
                    : "text-zinc-600 hover:text-[#2a9d8f]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user && (user.role === "ADMIN" || user.role === "SUPERADMIN") && (
            <Link
              href="/dashboard"
              aria-label="Shop Dashboard"
              className="relative p-2.5 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <Store className="w-5 h-5 text-[#457b9d]" />
            </Link>
          )}

          {mounted && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-md border border-zinc-300 hover:border-zinc-400 transition-all bg-zinc-50/80"
              >
                <div className="w-7 h-7 rounded-md bg-[#2a9d8f] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user.name ? user.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-semibold text-zinc-800 max-w-[85px] truncate hidden sm:inline">
                  {user.name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg border border-zinc-200 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-zinc-100">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {user.name || "Customer"}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                    {user.role && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-teal-50 text-teal-800 border border-teal-200">
                        {user.role}
                      </span>
                    )}
                  </div>

                  <div className="py-1 text-xs text-zinc-700">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 font-medium"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-zinc-500" /> Profile Settings
                    </Link>

                    <Link
                      href="/subscriptions"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 font-medium"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#457b9d]" /> Subscriptions
                    </Link>
                  </div>

                  <div className="border-t border-zinc-100 pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-[#2a9d8f] hover:bg-[#238276] px-4 sm:px-5 py-2 sm:py-2.5 rounded-md transition-all shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5 text-white" />
              <span>Sign In</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-6 py-4 space-y-3 shadow-md">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium rounded-md px-2 ${
                  pathname === link.href
                    ? "bg-teal-50 text-[#2a9d8f] font-semibold"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-200 flex flex-col gap-2">
            <Link
              href="/prescription"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-teal-50 text-[#2a9d8f] text-xs font-semibold border border-teal-200"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Prescription</span>
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-2 py-2 text-xs font-medium text-zinc-700 rounded-md hover:bg-zinc-50"
                >
                  <UserIcon className="w-4 h-4 mr-2 text-zinc-500" /> Profile Settings
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-2 py-2 text-xs font-medium text-zinc-700 rounded-md hover:bg-zinc-50"
                >
                  <Store className="w-4 h-4 mr-2 text-[#2a9d8f]" /> My Shop Dashboard
                </Link>
                <Link
                  href="/subscriptions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-2 py-2 text-xs font-medium text-zinc-700 rounded-md hover:bg-zinc-50"
                >
                  <CreditCard className="w-4 h-4 mr-2 text-[#457b9d]" /> Subscriptions
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-2 py-2 text-xs font-medium text-zinc-700 rounded-md hover:bg-zinc-50"
                >
                  <Settings className="w-4 h-4 mr-2 text-zinc-500" /> Settings
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-red-50 text-red-600 text-xs font-semibold border border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-[#2a9d8f] text-white text-xs font-semibold"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}