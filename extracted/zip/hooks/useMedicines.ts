// hooks/useMedicines.ts
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";

export interface MedicineItem {
  id: string;
  shop_id: string;
  description: string;
  batch_no: string;
  mrp: string;
  rate: string;
  gst_rate: string;
  exp_date: string;
  quantity: number;
  hsn_code: string;
  pack_size: string;
}

export function useMedicines() {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/protected/medicines?search=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=15`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to load inventory");
      }
      setMedicines(data.data.medicines || []);
      setTotal(data.data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  return {
    medicines,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    total,
    refresh: fetchMedicines,
  };
}