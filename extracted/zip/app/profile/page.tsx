// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { User, CheckCircle2, AlertCircle } from "lucide-react";

export default function UserProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobNo: "",
    pincode: "",
    state: "",
    district: "",
    area: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        mobNo: user.mob_no || "",
        pincode: user.address?.pincode || "",
        state: user.address?.state || "",
        district: user.address?.district || "",
        area: user.address?.area || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        mobNo: form.mobNo,
        address: {
          pincode: form.pincode,
          state: form.state,
          district: form.district,
          area: form.area,
          country: "IN",
        },
      };

      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update profile");
      }

      if (data.data?.user) {
        setAuth({
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          mob_no: data.data.user.mob_no,
          role: data.data.user.role,
          status: data.data.user.status,
          is_profile_complete: data.data.user.is_profile_complete,
          address: data.data.user.address,
        });
      }

      setSuccess("User profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Spinner fullScreen={true} text="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg border border-zinc-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2a9d8f]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">User Profile Settings</h1>
            <p className="text-xs text-zinc-500">Manage your personal account details and address</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-zinc-200 shadow-xs space-y-6">
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
              label="Full Name *"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email Address *"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Mobile Number *"
              required
              value={form.mobNo}
              onChange={(e) => setForm({ ...form, mobNo: e.target.value })}
            />
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Role / Access</label>
              <div className="px-3 py-2 bg-zinc-100 border border-zinc-300 rounded-md text-xs font-semibold text-zinc-700 uppercase">
                {user.role || "CUSTOMER"}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Personal Address</h3>
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
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}