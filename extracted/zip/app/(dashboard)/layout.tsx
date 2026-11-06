// app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Package, FileText, ShoppingCart, Home, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Spinner } from "@/components/ui/Spinner";
import NotFound from "../not-found";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  const sidebarLinks = [
    { name: "Overview", href: "/dashboard", icon: Store },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "POS Billing", href: "/billing", icon: ShoppingCart },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Settings", href: "/settings", icon: ShieldAlert },
  ];

  const handleExitDashboard = () => {
    router.push("/");
  };

  if (loading) {
    return <Spinner fullScreen={true} text="Verifying access..." />;
  }

  // Restrict access: Only ADMIN or SUPERADMIN can access dashboard
  if (user && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    return (
      <NotFound/>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-zinc-200 z-30 justify-between">
        <div>
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Management Portal</span>
          </div>
          <nav className="px-4 py-6 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold text-zinc-700 hover:bg-teal-50 hover:text-[#2a9d8f] transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#457b9d]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-100 space-y-3 bg-zinc-50/50">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-md bg-[#2a9d8f] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {user?.name ? user.name.charAt(0) : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 truncate">{user?.name || "Administrator"}</p>
              <p className="text-[11px] text-zinc-500 truncate">{user?.email || "admin@pharmacare.com"}</p>
            </div>
          </div>

          <button
            onClick={handleExitDashboard}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold transition-colors shadow-xs"
          >
            <Home className="w-4 h-4 text-[#457b9d]" />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      <main className="md:ml-64 pt-0 min-h-screen p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}