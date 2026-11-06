// app/(dashboard)/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ShopSettingsForm } from "@/components/features/shop/ShopSettingsForm";
import { Spinner } from "@/components/ui/Spinner";

export default function ProfilePage() {
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
        console.error("Failed to load shop:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShop();
  }, []);

  if (loading) return <Spinner fullScreen={true} text="Loading profile..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-900">Shop & Business Profile</h1>
      <ShopSettingsForm initialShop={shop} />
    </div>
  );
}