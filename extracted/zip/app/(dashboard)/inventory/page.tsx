// app/(dashboard)/inventory/page.tsx
"use client";

import { useInventoryLogic } from "@/hooks/useInventoryLogic";
import { InventoryView } from "@/components/features/inventory/InventoryView";

export default function InventoryPage() {
  const logic = useInventoryLogic();
  return <InventoryView {...logic} />;
}