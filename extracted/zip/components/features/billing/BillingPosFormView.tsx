// components/features/billing/BillingPosFormView.tsx
"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Trash2, ShoppingCart, CheckCircle2, Search, Package } from "lucide-react";
import { CartItem, ShopOption } from "@/hooks/useBillingLogic";

interface BillingPosFormViewProps {
  billingType: "B2C" | "B2B";
  setBillingType: (type: "B2C" | "B2B") => void;
  b2bInputMode: "manual" | "search";
  setB2bInputMode: (mode: "manual" | "search") => void;
  shopSearchQuery: string;
  setShopSearchQuery: (val: string) => void;
  shopSearchResults: ShopOption[];
  isShopSearchFocused: boolean;
  setIsShopSearchFocused: (val: boolean) => void;
  handleSelectShop: (shop: ShopOption) => void;
  buyerName: string;
  setBuyerName: (val: string) => void;
  buyerPhone: string;
  setBuyerPhone: (val: string) => void;
  buyerEmail: string;
  setBuyerEmail: (val: string) => void;
  buyerGstin: string;
  setBuyerGstin: (val: string) => void;
  paymentMode: string;
  setPaymentMode: (val: string) => void;
  paymentStatus: string;
  setPaymentStatus: (val: string) => void;
  doctorName: string;
  setDoctorName: (val: string) => void;
  doctorRegNo: string;
  setDoctorRegNo: (val: string) => void;
  note: string;
  setNote: (val: string) => void;
  discount: string;
  setDiscount: (val: string) => void;
  cart: CartItem[];
  medSearch: string;
  setMedSearch: (val: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (val: boolean) => void;
  loading: boolean;
  error: string;
  successMessage: string;
  filteredMedicines: any[];
  handleAddToCart: (med: any) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  subTotal: number;
  totalGst: number;
  netAmount: number;
  handleSubmitBill: (e: React.FormEvent) => void;
}

export function BillingPosFormView({
  billingType,
  setBillingType,
  b2bInputMode,
  setB2bInputMode,
  shopSearchQuery,
  setShopSearchQuery,
  shopSearchResults,
  isShopSearchFocused,
  setIsShopSearchFocused,
  handleSelectShop,
  buyerName,
  setBuyerName,
  buyerPhone,
  setBuyerPhone,
  buyerEmail,
  setBuyerEmail,
  buyerGstin,
  setBuyerGstin,
  paymentMode,
  setPaymentMode,
  paymentStatus,
  setPaymentStatus,
  doctorName,
  setDoctorName,
  doctorRegNo,
  setDoctorRegNo,
  note,
  setNote,
  discount,
  setDiscount,
  cart,
  medSearch,
  setMedSearch,
  isSearchFocused,
  setIsSearchFocused,
  loading,
  error,
  successMessage,
  filteredMedicines,
  handleAddToCart,
  updateQuantity,
  removeItem,
  subTotal,
  totalGst,
  netAmount,
  handleSubmitBill,
}: BillingPosFormViewProps) {
  return (
    <form onSubmit={handleSubmitBill} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
              Select Medicines (Inventory Search)
            </h2>
            <span className="text-xs text-zinc-500">Search 1000+ items instantly</span>
          </div>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={medSearch}
                onChange={(e) => {
                  setMedSearch(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search by medicine name, batch, exp date, HSN, MRP, or stock..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f]"
              />
            </div>

            {isSearchFocused && medSearch.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-72 overflow-y-auto z-50 divide-y divide-zinc-100">
                {filteredMedicines.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No matching medicines found across name, batch, HSN, MRP, or stock.
                  </div>
                ) : (
                  filteredMedicines.map((med) => (
                    <div
                      key={med.id}
                      onClick={() => handleAddToCart(med)}
                      className="p-3 hover:bg-teal-50/50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <p className="font-bold text-zinc-900">{med.description}</p>
                        <p className="text-zinc-500 text-[11px] mt-0.5">
                          Batch: <span className="font-medium text-zinc-700">{med.batch_no}</span> | 
                          Exp: <span className="font-medium text-zinc-700">{med.exp_date}</span> | 
                          HSN: <span className="font-medium text-zinc-700">{med.hsn_code}</span> | 
                          Pack: <span className="font-medium text-zinc-700">{med.pack_size}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2a9d8f]">₹{med.mrp}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${med.quantity > 0 ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-600"}`}>
                          Stock: {med.quantity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="border border-zinc-200 rounded-md overflow-hidden mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                  <th className="p-3">Medicine Description</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3">GST%</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                      Search and select medicines above to add items to bill.
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => (
                    <tr key={item.medicineId} className="hover:bg-zinc-50/50">
                      <td className="p-3 font-semibold text-zinc-900">{item.description}</td>
                      <td className="p-3 text-zinc-600">{item.batchNo}</td>
                      <td className="p-3 text-zinc-600">₹{item.rate}</td>
                      <td className="p-3 text-zinc-600">{item.gstRate}%</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={1}
                          max={item.maxStock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.medicineId, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-zinc-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#2a9d8f]"
                        />
                      </td>
                      <td className="p-3 font-bold text-zinc-900">
                        ₹{(item.rate * item.quantity + (item.rate * item.quantity * item.gstRate) / 100).toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.medicineId)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 gap-3">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
              2. Customer & Prescription Details
            </h2>
            <div className="inline-flex bg-zinc-100 p-0.5 rounded-full border border-zinc-200">
              <button
                type="button"
                onClick={() => setBillingType("B2C")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  billingType === "B2C"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Direct Customer (B2C)
              </button>
              <button
                type="button"
                onClick={() => setBillingType("B2B")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  billingType === "B2B"
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                B2B (Business)
              </button>
            </div>
          </div>

          {/* B2B Shop Source Sub-Toggle Options */}
          {billingType === "B2B" && (
            <div className="bg-teal-50/40 p-4 rounded-md border border-teal-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800">Is the shop available in our software?</span>
                <div className="inline-flex bg-white p-0.5 rounded-full border border-zinc-200 text-xs shadow-xs">
                  <button
                    type="button"
                    onClick={() => setB2bInputMode("manual")}
                    className={`px-3 py-1 font-semibold rounded-full transition-all ${
                      b2bInputMode === "manual" ? "bg-[#2a9d8f] text-white shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setB2bInputMode("search")}
                    className={`px-3 py-1 font-semibold rounded-full transition-all ${
                      b2bInputMode === "search" ? "bg-[#2a9d8f] text-white shadow-xs" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {b2bInputMode === "search" && (
                <div className="relative pt-1">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={shopSearchQuery}
                      onChange={(e) => {
                        setShopSearchQuery(e.target.value);
                        setIsShopSearchFocused(true);
                      }}
                      onFocus={() => setIsShopSearchFocused(true)}
                      placeholder="Search shop by name or partial GSTIN..."
                      className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2a9d8f]"
                    />
                  </div>

                  {isShopSearchFocused && shopSearchResults.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-zinc-100">
                      {shopSearchResults.map((shop) => (
                        <div
                          key={shop.id}
                          onClick={() => handleSelectShop(shop)}
                          className="p-3 hover:bg-teal-50/50 cursor-pointer text-xs flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-zinc-900">{shop.shop_name}</p>
                            <p className="text-zinc-500 text-[11px]">
                              GSTIN: <span className="font-medium text-zinc-700">{shop.gstin}</span> | Ph: {shop.phone}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold text-[#2a9d8f] bg-teal-50 px-2 py-1 rounded">Select</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer / Shop Name *"
              required
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Enter full name"
            />
            <Input
              label="Mobile Number *"
              required
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="10-digit mobile number"
            />
            <Input
              label="Email Address"
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="customer@example.com"
            />

            {billingType === "B2B" ? (
              <Input
                label="GSTIN *"
                required
                value={buyerGstin}
                onChange={(e) => setBuyerGstin(e.target.value)}
                placeholder="GSTIN number for B2B"
              />
            ) : (
              <>
                <Input
                  label="Doctor Name (Optional)"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Sharma"
                />
                <Input
                  label="Doctor Reg No (Optional)"
                  value={doctorRegNo}
                  onChange={(e) => setDoctorRegNo(e.target.value)}
                  placeholder="REG-1234"
                />
              </>
            )}
          </div>
          <Input
            label="Invoice Note / Instructions"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Take after meals"
          />
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs space-y-4 sticky top-20">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wide border-b border-zinc-100 pb-3">Billing Summary</h2>

          <div className="space-y-3 text-xs text-zinc-600 border-b border-zinc-100 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total GST</span>
              <span className="font-medium text-zinc-900">₹{totalGst.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span>Flat Discount (₹)</span>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 px-2 py-1 border border-zinc-300 rounded text-right text-xs focus:outline-none focus:ring-1 focus:ring-[#2a9d8f]"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-bold text-zinc-900 pt-1">
            <span>Net Payable</span>
            <span className="text-base text-[#2a9d8f]">₹{netAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2a9d8f]"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2a9d8f]"
              >
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
              </select>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          {successMessage && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-md text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2a9d8f]" />
              <span>{successMessage}</span>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full justify-center">
            <ShoppingCart className="w-4 h-4 mr-2" /> Generate Invoice
          </Button>
        </div>
      </div>
    </form>
  );
}