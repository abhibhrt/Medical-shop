// app/(dashboard)/billing/page.tsx
"use client";

import { useBillingLogic } from "@/hooks/useBillingLogic";
import { BillingPosFormView } from "@/components/features/billing/BillingPosFormView";

export default function BillingPage() {
  const logic = useBillingLogic();
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-bold text-zinc-900">Point of Sale Billing</h1>
      <BillingPosFormView {...logic} />
    </div>
  );
}