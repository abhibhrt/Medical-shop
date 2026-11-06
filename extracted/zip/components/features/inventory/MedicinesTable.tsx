// components/features/inventory/MedicinesTable.tsx
import React from "react";
import { Table } from "@/components/ui/Table";
import { Trash2, Edit, AlertTriangle } from "lucide-react";
import { MedicineItem } from "@/hooks/useMedicines";

interface MedicinesTableProps {
  medicines: MedicineItem[];
  onEdit: (item: MedicineItem) => void;
  onDelete: (id: string) => void;
}

export function MedicinesTable({ medicines, onEdit, onDelete }: MedicinesTableProps) {
  const headers = ["Description", "Batch No", "HSN", "Pack", "MRP", "Rate", "GST", "Expiry Date", "Stock", "Actions"];

  // Helper to check if a medicine expires within 3 months (90 days)
  const isExpiringSoon = (expDateStr?: string) => {
    if (!expDateStr) return false;
    const expDate = new Date(expDateStr);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    return expDate <= threeMonthsFromNow && expDate >= today;
  };

  return (
    <Table headers={headers} isEmpty={medicines.length === 0} emptyMessage="No medicines added to inventory yet.">
      {medicines.map((med) => {
        const expiringSoon = isExpiringSoon(med.exp_date);
        const lowStock = med.quantity <= 10;

        return (
          <tr key={med.id} className="hover:bg-zinc-50/50 transition-colors">
            <td className="px-4 py-3 font-semibold text-zinc-900">{med.description}</td>
            <td className="px-4 py-3 text-zinc-600">{med.batch_no}</td>
            <td className="px-4 py-3 text-zinc-600">{med.hsn_code}</td>
            <td className="px-4 py-3 text-zinc-600">{med.pack_size}</td>
            <td className="px-4 py-3 font-medium text-zinc-900">₹{med.mrp}</td>
            <td className="px-4 py-3 text-zinc-600">₹{med.rate}</td>
            <td className="px-4 py-3 text-zinc-600">{med.gst_rate}%</td>
            
            {/* Expiry Date Column with 3-Month Alert Badge */}
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-700 text-xs sm:text-sm">
                  {med.exp_date ? new Date(med.exp_date).toLocaleDateString() : "N/A"}
                </span>
                {expiringSoon && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Expiring Soon
                  </span>
                )}
              </div>
            </td>

            {/* Stock Column with Low Stock Badge */}
            <td className="px-4 py-3">
              <div className="flex flex-col gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold w-fit ${!lowStock ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-600"}`}>
                  {med.quantity} units
                </span>
                {lowStock && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                    <AlertTriangle className="w-3 h-3" /> Low Stock
                  </span>
                )}
              </div>
            </td>

            <td className="px-4 py-3 flex items-center gap-2">
              <button
                onClick={() => onEdit(med)}
                className="p-1 text-zinc-500 hover:text-[#2a9d8f] rounded-md hover:bg-zinc-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(med.id)}
                className="p-1 text-zinc-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        );
      })}
    </Table>
  );
}