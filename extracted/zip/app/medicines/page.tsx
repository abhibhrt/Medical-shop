// app/medicines/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Spinner } from "@/components/ui/Spinner";
import { Search, Pill, MapPin, Store } from "lucide-react";

export default function PublicMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  
  const debouncedSearch = useDebounce(search, 400);
  const debouncedCity = useDebounce(city, 400);
  const debouncedPincode = useDebounce(pincode, 400);

  useEffect(() => {
    async function fetchMedicines() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (debouncedCity) params.append("city", debouncedCity);
        if (debouncedPincode) params.append("pincode", debouncedPincode);
        params.append("limit", "20");

        const res = await fetch(`/api/medicines?${params.toString()}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setMedicines(data.data.medicines || []);
        }
      } catch (err) {
        console.error("Failed to fetch medicines:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedicines();
  }, [debouncedSearch, debouncedCity, debouncedPincode]);

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-16 px-4 sm:px-6 lg:px-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Explore Medicines & Inventory</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Search across available salt compositions, generics, and retail stocks instantly by location.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-xs flex items-center gap-3 md:col-span-1">
            <Search className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicines..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-zinc-800 placeholder:text-zinc-400"
            />
          </div>

          <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-xs flex items-center gap-3">
            <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by City / Area..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-zinc-800 placeholder:text-zinc-400"
            />
          </div>

          <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-xs flex items-center gap-3">
            <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Filter by Pincode..."
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-zinc-800 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {loading ? (
          <Spinner fullScreen={true} text="Searching medicines..." />
        ) : medicines.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-zinc-200">
            <Pill className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
            <p className="text-sm font-semibold text-zinc-700">No medicines found</p>
            <p className="text-xs text-zinc-400 mt-1">Try searching with a different keyword or location.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-100 shadow-xs">
            {medicines.map((med) => (
              <div key={med.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                    {med.description}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span className="flex items-center gap-1 font-medium text-zinc-700">
                      <Store className="w-3.5 h-3.5 text-zinc-400" />
                      {med.shop_name || "Medical Store"}
                    </span>
                    {med.shop_address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {med.shop_address}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  <span className="font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-md text-xs">
                    ₹{med.mrp}
                  </span>
                  <span className={`text-xs font-semibold ${med.quantity > 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {med.quantity > 0 ? `${med.quantity} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}