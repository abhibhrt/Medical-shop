// app/create-shop/page.tsx
"use client";

import { ShopSettingsForm } from "@/components/features/shop/ShopSettingsForm";
import { Store } from "lucide-react";

export default function CreateShopPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg border border-zinc-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2a9d8f]">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Register Your Pharmacy Shop</h1>
            <p className="text-xs text-zinc-500">Provide your store details and drug licence information to get started</p>
          </div>
        </div>

        <ShopSettingsForm initialShop={null} />
      </div>
    </div>
  );
}