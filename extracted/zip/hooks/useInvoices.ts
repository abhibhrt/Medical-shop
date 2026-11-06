// hooks/useInvoices.ts
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";

export interface InvoiceSummaryItem {
  id: string;
  invoice_no: string;
  invoice_date: string;
  net_amount: string;
  payment_mode: string;
  payment_status: string;
  buyer_name: string;
  buyer_phone: string;
  item_count: number;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<InvoiceSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/protected/invoices?search=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=15`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to load invoices");
      }
      setInvoices(data.data.invoices || []);
      setTotal(data.data.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    total,
    refresh: fetchInvoices,
  };
}