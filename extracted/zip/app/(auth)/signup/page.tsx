// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pill, AlertCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobNo: "",
    password: "",
    role: "PHARMACIST",
    pincode: "",
    state: "",
    district: "",
    area: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        mobNo: form.mobNo,
        password: form.password,
        role: form.role,
        address: form.pincode
          ? {
              pincode: form.pincode,
              state: form.state,
              district: form.district,
              area: form.area,
              country: "IN",
            }
          : undefined,
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to create account");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-10 flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-md shadow-xs border border-zinc-200">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2a9d8f] mb-2">
            <Pill className="h-6 w-6 rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Create an Account</h1>
          <p className="text-sm text-zinc-600 mt-1">Start managing your pharmacy inventory and billing</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] bg-white"
              >
                <option value="PHARMACIST">Pharmacist</option>
                <option value="ADMIN">Admin</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                value={form.mobNo}
                onChange={(e) => setForm({ ...form, mobNo: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
            />
          </div>

          <div className="border-t border-zinc-200 pt-4 mt-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Address (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-600 mb-1">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-600 mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-600 mb-1">District</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-600 mb-1">Area / Street</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-md text-sm border-zinc-300 focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2a9d8f] hover:bg-[#238276] text-white font-medium py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4 shadow-xs"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#2a9d8f] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}