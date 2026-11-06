// app/(dashboard)/invoices/[id]/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InvoiceReceipt } from "@/components/features/invoices/InvoiceReceipt";
import { Spinner } from "@/components/ui/Spinner";

function InvoiceDetailContent() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const [invRes, shopRes] = await Promise.all([
          fetch(`/api/protected/invoices/${id}`, { credentials: "include" }),
          fetch(`/api/protected/shops`, { credentials: "include" }),
        ]);

        const invData = await invRes.json();
        const shopData = await shopRes.json();

        if (invRes.ok && invData.success) {
          setInvoice(invData.data.invoice);
        }
        if (shopRes.ok && shopData.success) {
          setShop(shopData.data.shop);
        }
      } catch (err) {
        console.error("Failed to load invoice receipt:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetails();
  }, [id]);

  if (loading) return <Spinner fullScreen={true} text="Loading invoice receipt..." />;
  if (!invoice) return <div className="text-center py-12 text-zinc-500">Invoice not found.</div>;

  return <InvoiceReceipt invoice={invoice} shop={shop} />;
}

export default function InvoiceDetailPage() {
  return (
    <Suspense fallback={<Spinner fullScreen={true} text="Loading invoice..." />}>
      <InvoiceDetailContent />
    </Suspense>
  );
}