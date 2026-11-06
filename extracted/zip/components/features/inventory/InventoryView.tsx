// components/features/inventory/InventoryView.tsx
"use client";

import React, { useState } from "react";
import { MedicinesTable } from "@/components/features/inventory/MedicinesTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Plus, Search, AlertTriangle, X } from "lucide-react";
import { MedicineItem } from "@/hooks/useMedicines";

interface InventoryViewProps {
  medicines: MedicineItem[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingMed: MedicineItem | null;
  form: {
    description: string;
    batchNo: string;
    mrp: string;
    rate: string;
    gstRate: string;
    expDate: string;
    quantity: string;
    hsnCode: string;
    packSize: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  error: string;
  submitting: boolean;
  handleOpenCreate: () => void;
  handleOpenEdit: (item: MedicineItem) => void;
  handleDelete: (id: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export function InventoryView({
  medicines,
  loading,
  search,
  setSearch,
  isModalOpen,
  setIsModalOpen,
  editingMed,
  form,
  setForm,
  error,
  submitting,
  handleOpenCreate,
  handleOpenEdit,
  handleDelete,
  handleSubmit,
}: InventoryViewProps) {
  // Filter state: "all" | "expiring" | "lowStock"
  const [activeFilter, setActiveFilter] = useState<"all" | "expiring" | "lowStock">("all");

  // Helper to check if a medicine expires within 3 months (90 days)
  const isExpiringSoon = (expDateStr?: string) => {
    if (!expDateStr) return false;
    const expDate = new Date(expDateStr);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    return expDate <= threeMonthsFromNow && expDate >= today;
  };

  // Helper to check if stock is low (quantity <= 10)
  const isLowStock = (quantity: number) => {
    return quantity <= 10;
  };

  // Process medicines to attach alert flags
  const processedMedicines = medicines.map((med) => ({
    ...med,
    isExpiringSoon: isExpiringSoon(med.exp_date),
    isLowStock: isLowStock(med.quantity),
  }));

  // Apply active quick-filter
  const filteredMedicines = processedMedicines.filter((med) => {
    if (activeFilter === "expiring") return med.isExpiringSoon;
    if (activeFilter === "lowStock") return med.isLowStock;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-zinc-900">Inventory & Medicines</h1>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Medicine
        </Button>
      </div>

      {/* Summary Alert Banner with interactive filter buttons */}
      {!loading && (
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <button
            onClick={() => setActiveFilter(activeFilter === "expiring" ? "all" : "expiring")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all cursor-pointer ${
              activeFilter === "expiring"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeFilter === "expiring" ? "text-white" : "text-amber-600"}`} />
            <span>Expiring Soon (&lt; 3 Months): {processedMedicines.filter(m => m.isExpiringSoon).length}</span>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === "lowStock" ? "all" : "lowStock")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all cursor-pointer ${
              activeFilter === "lowStock"
                ? "bg-red-600 text-white border-red-600 shadow-xs"
                : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${activeFilter === "lowStock" ? "text-white" : "text-red-600"}`} />
            <span>Low Stock (≤ 10): {processedMedicines.filter(m => m.isLowStock).length}</span>
          </button>

          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 px-2 py-1 text-xs underline cursor-pointer"
            >
              <X className="w-3 h-3" /> Clear filter
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-zinc-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, batch, or HSN..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]"
          />
        </div>
      </div>

      {loading ? (
        <Spinner fullScreen={true} text="Loading inventory..." />
      ) : (
        <MedicinesTable 
          medicines={filteredMedicines} 
          onEdit={handleOpenEdit} 
          onDelete={handleDelete} 
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMed ? "Edit Medicine" : "Add New Medicine"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <Input
            label="Medicine Description *"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Paracetamol 650mg"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Batch Number *"
              required
              value={form.batchNo}
              onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
              placeholder="BCH-01"
            />
            <Input
              label="HSN Code *"
              required
              value={form.hsnCode}
              onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
              placeholder="3004"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="MRP (₹) *"
              type="number"
              step="0.01"
              required
              value={form.mrp}
              onChange={(e) => setForm({ ...form, mrp: e.target.value })}
            />
            <Input
              label="Rate (₹) *"
              type="number"
              step="0.01"
              required
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
            />
            <Input
              label="GST Rate (%) *"
              type="number"
              step="0.01"
              required
              value={form.gstRate}
              onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Quantity *"
              type="number"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <Input
              label="Pack Size *"
              required
              value={form.packSize}
              onChange={(e) => setForm({ ...form, packSize: e.target.value })}
              placeholder="10s"
            />
            <Input
              label="Expiry Date *"
              type="date"
              required
              value={form.expDate}
              onChange={(e) => setForm({ ...form, expDate: e.target.value })}
            />
          </div>
          <Button type="submit" loading={submitting} className="w-full justify-center mt-2">
            {editingMed ? "Update Medicine" : "Save Medicine"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}