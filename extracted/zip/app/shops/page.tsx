// app/shops/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Store, MapPin, Phone, Mail, FileText } from "lucide-react";

export default function PublicShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      try {
        setLoading(true);
        const res = await fetch(`/api/shops`);
        const data = await res.json();
        // Assuming your shops API handles listing or returning active store nodes
        if (res.ok && data.success) {
          setShops(data.data.shops || (data.data.shop ? [data.data.shop] : []));
        }
      } catch (err) {
        console.error("Failed to fetch shops:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Partner Pharmacy Stores</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Find licensed local medical shops and retail outlets near you.
          </p>
        </div>

        {loading ? (
          <Spinner fullScreen={true} text="Loading nearby stores..." />
        ) : shops.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-zinc-200">
            <Store className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
            <p className="text-sm font-semibold text-zinc-700">No stores registered yet</p>
            <p className="text-xs text-zinc-400 mt-1">Check back later or register your shop.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div key={shop.id || shop.shop_name} className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#2a9d8f] flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-sm">{shop.shop_name}</h3>
                    <p className="text-[11px] text-zinc-500">Licence: {shop.drug_licence_number}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{shop.address?.area}, {shop.address?.district}, {shop.address?.state} - {shop.address?.pincode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{shop.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{shop.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}