// app/(dashboard)/invoices/page.tsx
"use client";

import { useInvoices } from "@/hooks/useInvoices";
import { InvoicesTable } from "@/components/features/invoices/InvoicesTable";
import { Spinner } from "@/components/ui/Spinner";
import { Search } from "lucide-react";

export default function InvoicesPage() {
  const { invoices, loading, search, setSearch } = useInvoices();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-900">Invoices & Billing History</h1>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-zinc-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number, customer name, or phone..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]"
          />
        </div>
      </div>

      {loading ? (
        <Spinner fullScreen={true} text="Loading invoices..." />
      ) : (
        <InvoicesTable invoices={invoices} />
      )}
    </div>
  );
}