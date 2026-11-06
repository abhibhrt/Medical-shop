// app/loading.tsx
import { Pill } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2a9d8f] animate-pulse">
          <Pill className="w-8 h-8 rotate-45 stroke-[1.75]" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold text-zinc-800">Loading workspace...</p>
          <p className="text-xs text-zinc-500">Please wait while we prepare your dashboard.</p>
        </div>
      </div>
    </div>
  );
}