// components/features/invoices/InvoicesTable.tsx
import React from "react";
import { Table } from "@/components/ui/Table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { InvoiceSummaryItem } from "@/hooks/useInvoices";

interface InvoicesTableProps {
  invoices: InvoiceSummaryItem[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const headers = ["Invoice No", "Date", "Customer", "Phone", "Items", "Net Amount", "Mode", "Status", "Actions"];

  return (
    <Table headers={headers} isEmpty={invoices.length === 0} emptyMessage="No invoices generated yet.">
      {invoices.map((inv) => (
        <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
          <td className="px-4 py-3 font-bold text-zinc-900">{inv.invoice_no}</td>
          <td className="px-4 py-3 text-zinc-600">{new Date(inv.invoice_date).toLocaleDateString()}</td>
          <td className="px-4 py-3 font-semibold text-zinc-800">{inv.buyer_name}</td>
          <td className="px-4 py-3 text-zinc-600">{inv.buyer_phone}</td>
          <td className="px-4 py-3 text-zinc-600">{inv.item_count} items</td>
          <td className="px-4 py-3 font-bold text-zinc-900">₹{inv.net_amount}</td>
          <td className="px-4 py-3 text-zinc-600">{inv.payment_mode}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${inv.payment_status === "PAID" ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>
              {inv.payment_status}
            </span>
          </td>
          <td className="px-4 py-3">
            <Link
              href={`/invoices/${inv.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#2a9d8f] hover:underline"
            >
              <Eye className="w-3.5 h-3.5" /> View
            </Link>
          </td>
        </tr>
      ))}
    </Table>
  );
}