// app/prescription/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileText, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export default function PrescriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a prescription image or PDF file.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Simulate or execute your upload API call here
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } catch (err: any) {
      setError("Failed to upload prescription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 bg-white p-6 rounded-lg border border-zinc-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#2a9d8f]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Upload Prescription</h1>
            <p className="text-xs text-zinc-500">Upload doctor's prescription for quick quotation and home fulfillment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border border-zinc-200 shadow-xs space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-6 bg-teal-50 border border-teal-200 rounded-lg text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#2a9d8f] mx-auto" />
              <h2 className="text-sm font-bold text-zinc-900">Prescription Uploaded Successfully!</h2>
              <p className="text-xs text-zinc-600">Our partner pharmacies will review and contact you shortly with availability.</p>
              <Button type="button" onClick={() => { setSuccess(false); setFile(null); }}>
                Upload Another
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
                <Input
                  label="Mobile Number *"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9830098300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700">Prescription File (Image / PDF) *</label>
                <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-[#2a9d8f] transition-colors cursor-pointer bg-zinc-50">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#2a9d8f] hover:file:bg-teal-100"
                  />
                  <p className="text-[11px] text-zinc-400 mt-2">Supports JPG, PNG, or PDF files up to 10MB</p>
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full justify-center">
                <UploadCloud className="w-4 h-4 mr-2" /> Submit Prescription
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}