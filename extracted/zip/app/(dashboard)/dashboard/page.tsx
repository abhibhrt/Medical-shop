// app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Store, Package, FileText, ShoppingCart, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardOverviewPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShop() {
      try {
        const res = await fetch("/api/protected/shops", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.success) {
          setShop(data.data.shop);
        }
      } catch (err) {
        console.error("Failed to fetch shop:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, []);

  if (loading) return <Spinner fullScreen={true} text="Loading shop information..."/>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-zinc-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            {shop ? shop.shop_name : "Welcome to PharmaCare Dashboard"}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {shop ? `Drug Licence: ${shop.drug_licence_number}` : "Please setup your shop profile to get started."}
          </p>
        </div>
        {!shop && (
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a9d8f] text-white text-xs font-semibold rounded-md shadow-xs hover:bg-[#238276]"
          >
            <span>Setup Shop</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/inventory"
          className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs hover:border-[#2a9d8f] transition-all group"
        >
          <div className="w-10 h-10 rounded-md bg-teal-50 text-[#2a9d8f] flex items-center justify-center mb-4">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900 group-hover:text-[#2a9d8f]">Inventory Stock</h2>
          <p className="text-xs text-zinc-500 mt-1">Manage medicines, batches, and prices</p>
        </Link>

        <Link
          href="/billing"
          className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs hover:border-[#2a9d8f] transition-all group"
        >
          <div className="w-10 h-10 rounded-md bg-[#457b9d]/10 text-[#457b9d] flex items-center justify-center mb-4">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900 group-hover:text-[#2a9d8f]">POS Billing</h2>
          <p className="text-xs text-zinc-500 mt-1">Create fast bills and invoices</p>
        </Link>

        <Link
          href="/invoices"
          className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs hover:border-[#2a9d8f] transition-all group"
        >
          <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900 group-hover:text-[#2a9d8f]">Invoices List</h2>
          <p className="text-xs text-zinc-500 mt-1">View history and print receipts</p>
        </Link>

        <Link
          href="/settings"
          className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs hover:border-[#2a9d8f] transition-all group"
        >
          <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <Store className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-zinc-900 group-hover:text-[#2a9d8f]">Shop Settings</h2>
          <p className="text-xs text-zinc-500 mt-1">Update licence and store address</p>
        </Link>
      </div>
    </div>
  );
}