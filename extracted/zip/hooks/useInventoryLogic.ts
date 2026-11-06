// hooks/useInventoryLogic.ts
import { useState } from "react";
import { useMedicines, MedicineItem } from "@/hooks/useMedicines";

export function useInventoryLogic() {
  const { medicines, loading, search, setSearch, refresh } = useMedicines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicineItem | null>(null);

  const [form, setForm] = useState({
    description: "",
    batchNo: "",
    mrp: "",
    rate: "",
    gstRate: "",
    expDate: "",
    quantity: "",
    hsnCode: "",
    packSize: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingMed(null);
    setForm({
      description: "",
      batchNo: "",
      mrp: "",
      rate: "",
      gstRate: "",
      expDate: "",
      quantity: "",
      hsnCode: "",
      packSize: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MedicineItem) => {
    setEditingMed(item);
    setForm({
      description: item.description,
      batchNo: item.batch_no,
      mrp: item.mrp,
      rate: item.rate,
      gstRate: item.gst_rate,
      expDate: item.exp_date ? item.exp_date.split("T")[0] : "",
      quantity: item.quantity.toString(),
      hsnCode: item.hsn_code,
      packSize: item.pack_size,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      const res = await fetch(`/api/protected/medicines/${id}`, { method: "DELETE" });
      if (res.ok) refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const url = editingMed ? `/api/protected/medicines/${editingMed.id}` : "/api/protected/medicines";
    const method = editingMed ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          mrp: parseFloat(form.mrp),
          rate: parseFloat(form.rate),
          gstRate: parseFloat(form.gstRate),
          quantity: parseInt(form.quantity, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save medicine");
      }

      setIsModalOpen(false);
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
}