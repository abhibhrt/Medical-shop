// components/features/invoices/InvoiceReceipt.tsx
import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface InvoiceReceiptProps {
  invoice: any;
  shop: any;
}

export function InvoiceReceipt({ invoice, shop }: InvoiceReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @page {
          margin: 0; /* Removes default browser print margins on left/right */
        }
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .invoice-container {
            max-width: 100% !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 10px !important;
            margin: 0 !important;
            page-break-inside: avoid;
          }
          /* Force printing of background graphics/images */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      <div className="invoice-container max-w-xl mx-auto p-4 rounded-lg border border-zinc-200 shadow-sm space-y-4 relative overflow-hidden text-xs">

        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img
            src="/home.png"
            alt="Watermark"
            className="w-[100%] h-[100%] object-contain opacity-20 translate-x-[70px] select-none"
          />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10">

          {/* Header */}
          <div className="flex justify-between items-start border-zinc-200 pb-4">
            <div>
              <h1 className="text-base font-bold text-zinc-900">{shop?.shop_name || "Pharmacy Store"}</h1>
              <p className="text-[10px] text-zinc-500 mt-0.5">Drug Licence: {shop?.drug_licence_number}</p>
              <p className="text-[10px] text-zinc-500">GSTIN: {shop?.gstin}</p>
              <p className="text-[10px] text-zinc-500">Phone: {shop?.phone} | Email: {shop?.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-black text-[#2a9d8f]">TAX INVOICE</h2>
              <p className="text-[11px] font-bold text-zinc-800 mt-0.5">{invoice.invoice_no}</p>
              <p className="text-[10px] text-zinc-500">Date: {new Date(invoice.invoice_date).toLocaleString()}</p>
            </div>
          </div>

          {/* Customer & Prescription Details */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-50/80 p-3 border border-zinc-200">
            <div>
              <p className="font-semibold text-zinc-700 uppercase tracking-wider text-[10px] mb-0.5">Customer Details</p>
              <p className="font-bold text-zinc-950">{invoice.buyer?.name}</p>
              <p className="text-zinc-600 text-[11px]">Phone: {invoice.buyer?.phone}</p>
              {invoice.buyer?.email && <p className="text-zinc-600 text-[11px]">Email: {invoice.buyer?.email}</p>}
            </div>
            <div>
              <p className="font-semibold text-zinc-700 uppercase tracking-wider text-[10px] mb-0.5">Prescription Details</p>
              {invoice.doctor_name && <p className="text-zinc-600 text-[11px]">Doctor: {invoice.doctor_name}</p>}
              {invoice.buyer?.gstin && <p className="text-zinc-600 text-[11px]">GSTIN: {invoice.buyer?.gstin}</p>}
              {invoice.doctor_reg_no && <p className="text-zinc-600 text-[11px]">Reg No: {invoice.doctor_reg_no}</p>}
              <p className="text-zinc-600 text-[11px] mt-1">Payment: <span className="font-semibold">{invoice.payment_mode}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 text-[10px]">
                <th className="py-2 px-2">Item Description</th>
                <th className="py-2 px-2">Batch</th>
                <th className="py-2 px-2">HSN</th>
                <th className="py-2 px-2">Qty</th>
                <th className="py-2 px-2">MRP</th>
                <th className="py-2 px-2">Rate</th>
                <th className="py-2 px-2">GST%</th>
                <th className="py-2 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-[11px]">
              {invoice.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-1.5 px-2 font-semibold text-zinc-900">{item.description}</td>
                  <td className="py-1.5 px-2 text-zinc-600">{item.batch_no}</td>
                  <td className="py-1.5 px-2 text-zinc-600">{item.hsn_code}</td>
                  <td className="py-1.5 px-2 text-zinc-600">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-zinc-600">₹{item.mrp}</td>
                  <td className="py-1.5 px-2 text-zinc-600">₹{item.rate}</td>
                  <td className="py-1.5 px-2 text-zinc-600">{item.gst_rate}%</td>
                  <td className="py-1.5 px-2 text-right font-medium text-zinc-900">₹{item.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer Section: QR Code & Totals */}
          <div className="flex justify-between items-end pt-3 border-t border-zinc-200">

            {/* Dummy QR Code */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white border border-zinc-300 p-1 rounded flex items-center justify-center shadow-2xs">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://yourstore.example.com"
                  alt="Website QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] text-zinc-500">
                <p className="font-semibold text-zinc-700">Scan for e-Receipt</p>
                <p>Visit us online</p>
                <p className="text-[9px] text-zinc-400">yourstore.com</p>
              </div>
            </div>

            {/* Calculations */}
            <div className="w-52 space-y-1 text-[11px]">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>₹{invoice.sub_total}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CGST</span>
                <span>₹{invoice.cgst_total}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>SGST</span>
                <span>₹{invoice.sgst_total}</span>
              </div>
              {parseFloat(invoice.discount || 0) > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Discount</span>
                  <span>-₹{invoice.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-zinc-900 border-t border-zinc-200 pt-1.5">
                <span>Net Amount</span>
                <span className="text-[#2a9d8f]">₹{invoice.net_amount}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 my-2">Thank you for your business! Get well soon.</p>

          {/* Print Button & Footer Message */}
          <div className="pt-4 border-t border-zinc-200 flex justify-between items-center print:hidden">
            <Button onClick={handlePrint} size="sm" className="h-8 text-xs">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Invoice
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}