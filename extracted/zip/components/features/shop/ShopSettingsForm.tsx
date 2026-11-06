// components/features/shop/ShopSettingsForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ShopSettingsFormProps {
  initialShop?: any;
}

export function ShopSettingsForm({ initialShop }: ShopSettingsFormProps) {
  const [form, setForm] = useState({
    shopName: initialShop?.shop_name || "",
    phone: initialShop?.phone || "",
    email: initialShop?.email || "",
    drugLicenceNumber: initialShop?.drug_licence_number || "",
    pharmacistName: initialShop?.pharmacist_name || "",
    pharmacistRegistrationNumber: initialShop?.pharmacist_registration_number || "",
    gstin: initialShop?.gstin || "",
    pincode: initialShop?.address?.pincode || "",
    state: initialShop?.address?.state || "",
    district: initialShop?.address?.district || "",
    area: initialShop?.address?.area || "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const method = initialShop ? "PATCH" : "POST";

    try {
      const payload = {
        shopName: form.shopName,
        phone: form.phone,
        email: form.email,
        drugLicenceNumber: form.drugLicenceNumber,
        pharmacistName: form.pharmacistName,
        pharmacistRegistrationNumber: form.pharmacistRegistrationNumber,
        gstin: form.gstin,
        address: {
          pincode: form.pincode,
          state: form.state,
          district: form.district,
          area: form.area,
          country: "IN",
        },
      };

      const res = await fetch("/api/protected/shops", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save shop details");
      }

      setSuccess("Shop profile saved successfully!");

      router.push("/");
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-8 rounded-lg border border-zinc-200 shadow-xs space-y-6">
      <h2 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
        {initialShop ? "Edit Pharmacy Shop Profile" : "Create Pharmacy Shop Profile"}
      </h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-md text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#2a9d8f]" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Shop Name *"
          required
          value={form.shopName}
          onChange={(e) => setForm({ ...form, shopName: e.target.value })}
          placeholder="City MediCare"
        />
        <Input
          label="Shop Phone *"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="9830098300"
        />
        <Input
          label="Shop Email *"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="shop@medicare.com"
        />
        <Input
          label="GSTIN Number *"
          required
          value={form.gstin}
          onChange={(e) => setForm({ ...form, gstin: e.target.value })}
          placeholder="19AAAAA0000A1Z5"
        />
        <Input
          label="Drug Licence Number *"
          required
          value={form.drugLicenceNumber}
          onChange={(e) => setForm({ ...form, drugLicenceNumber: e.target.value })}
          placeholder="DL-123456"
        />
        <Input
          label="Pharmacist Name *"
          required
          value={form.pharmacistName}
          onChange={(e) => setForm({ ...form, pharmacistName: e.target.value })}
          placeholder="Dr. A. Sharma"
        />
        <Input
          label="Pharmacist Registration Number *"
          required
          value={form.pharmacistRegistrationNumber}
          onChange={(e) => setForm({ ...form, pharmacistRegistrationNumber: e.target.value })}
          placeholder="REG-987"
        />
      </div>

      <div className="border-t border-zinc-100 pt-4 space-y-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Store Address</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="Pincode"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
          <Input
            label="District"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
          />
          <Input
            label="Area"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" loading={loading}>
        Save Shop Details
      </Button>
    </form>
  );
}