// app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, ShieldCheck, Truck, BarChart3, Store, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="min-h-screen bg-white text-[#192231] flex items-center justify-center px-6 lg:px-20 py-18">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Pharmacy Content */}
        <div className="lg:col-span-6 space-y-8">
          {/* Professional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide">
            <Store className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <span>Built For Pharmacy Owners & Retailers</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-[#111827] leading-[1.15]">
              Manage your{" "}
              <span className="relative inline-block text-[#2a9d8f]">
                pharmacy
                {/* Clean professional accent line */}
                <svg
                  className="absolute -bottom-2 left-0 w-full overflow-visible"
                  height="8"
                  viewBox="0 0 160 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6C45 2 115 2 158 6"
                    stroke="#457b9d"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              with <br className="hidden sm:inline" />
              total control
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed max-w-md">
              Streamline daily stock tracking, fast digital billing, and prescription fulfillment. Everything your medical shop needs to operate efficiently in one dashboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            {/* Primary Action */}
            <Link
              href={user ? "/profile" : "/signin"}
              className="inline-flex items-center gap-3 bg-[#2a9d8f] hover:bg-[#238276] text-white font-medium text-sm sm:text-base px-6 py-3 rounded-md shadow-sm transition-all duration-200"
            >
              <span>{user ? "Go to Profile" : "Sign In"}</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Secondary Action based on auth state & role */}
            {!user ? (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] hover:text-[#2a9d8f] transition-colors py-2"
              >
                <span>Create Account</span>
                <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center">
                  <UserPlus className="w-3 h-3 text-zinc-600" />
                </span>
              </Link>
            ) : user.role === "CUSTOMER" ? (
              <Link
                href="/create-shop"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] hover:text-[#2a9d8f] transition-colors py-2"
              >
                <span>Create New Shop</span>
                <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                </span>
              </Link>
            ) : null}
          </div>

          {/* Feature Highlights Footer */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#457b9d]/10 text-[#457b9d] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-zinc-700">Real-time Stock Alerts</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-teal-50 text-[#2a9d8f] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-zinc-700">Secure GST Invoicing</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Professional Visual Container */}
        <div className="lg:col-span-6 relative flex justify-center items-center">
          {/* Professional Arch Shape Backdrop using Slate / Teal balance */}
          <div className="relative w-[340px] sm:w-[420px] h-[480px] sm:h-[530px] bg-[#e2e8f0] rounded-t-[180px] rounded-b-[24px] border border-zinc-200/80 flex items-center justify-center overflow-hidden shadow-sm">
            {/* Optimized Image Container */}
            <div className="relative w-[85%] h-[85%] transform scale-105 transition-transform duration-300">
              <Image
                src="/home.png"
                alt="Pharmacy inventory and medical stock management"
                fill
                unoptimized
                priority
                className="object-contain object-center select-none pointer-events-none"
              />
            </div>
          </div>

          {/* Floating Professional Badge: Stock Sync */}
          <div className="absolute -bottom-4 right-2 sm:right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-md border border-zinc-200/70 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#2a9d8f] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Fast Dispatch</p>
              <p className="text-[11px] text-zinc-500">Automated order routing</p>
            </div>
          </div>

          {/* Floating Professional Badge: Compliance */}
          <div className="absolute top-8 left-2 sm:-left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-zinc-200/70 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#457b9d]/10 text-[#457b9d] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">License Verified</p>
              <p className="text-[10px] text-zinc-500">Drug authority compliant</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}