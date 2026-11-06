// app/not-found.tsx
import Link from "next/link";
import { Pill, Home, Store, FileText, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Clean Professional Badge & Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2a9d8f] shadow-xs">
            <Pill className="w-10 h-10 rotate-45 stroke-[1.75]" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-md bg-[#457b9d] text-white font-bold text-xs shadow-xs">
            404
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            The page you are looking for does not exist or has been relocated within the portal.
          </p>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#2a9d8f] hover:bg-[#238276] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="pt-8 border-t border-zinc-200/80">
          <p className="text-xs text-zinc-500 mb-3">Looking for specific modules?</p>
          <div className="flex items-center justify-center gap-6 text-xs font-medium text-[#2a9d8f]">
            <Link href="/dashboard" className="hover:underline inline-flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/inventory" className="hover:underline inline-flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Inventory</span>
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/support" className="hover:underline inline-flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}