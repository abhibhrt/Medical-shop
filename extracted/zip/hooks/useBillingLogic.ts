// hooks/useBillingLogic.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMedicines } from "@/hooks/useMedicines";

export interface CartItem {
  medicineId: string;
  description: string;
  batchNo: string;
  rate: number;
  mrp: number;
  gstRate: number;
  quantity: number;
  freeQuantity: number;
  maxStock: number;
}

export interface ShopOption {
  id: string;
  shop_name: string;
  phone: string;
  email: string;
  gstin: string;
}

export function useBillingLogic() {
  const router = useRouter();
  const { medicines } = useMedicines();

  // Billing Type Toggle ("B2C" | "B2B")
  const [billingType, setBillingType] = useState<"B2C" | "B2B">("B2C");

  // B2B Input Method ("manual" | "search")
  const [b2bInputMode, setB2bInputMode] = useState<"manual" | "search">("manual");
  const [shopSearchQuery, setShopSearchQuery] = useState("");
  const [shopSearchResults, setShopSearchResults] = useState<ShopOption[]>([]);
  const [isShopSearchFocused, setIsShopSearchFocused] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [doctorName, setDoctorName] = useState("");
  const [doctorRegNo, setDoctorRegNo] = useState("");
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState("0");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [medSearch, setMedSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Helper function to reset all billing form details
  const resetForm = () => {
    setBillingType("B2C");
    setB2bInputMode("manual");
    setShopSearchQuery("");
    setShopSearchResults([]);
    setSelectedShopId(null);
    setBuyerName("");
    setBuyerPhone("");
    setBuyerEmail("");
    setBuyerGstin("");
    setPaymentMode("UPI");
    setPaymentStatus("PAID");
    setDoctorName("");
    setDoctorRegNo("");
    setNote("");
    setDiscount("0");
    setCart([]);
    setMedSearch("");
    setError("");
  };

  // Debounced or live search for shops when in B2B search mode
  useEffect(() => {
    if (billingType === "B2B" && b2bInputMode === "search" && shopSearchQuery.trim().length > 0) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/shops/search?shopName=${encodeURIComponent(shopSearchQuery)}`);
          const data = await res.json();
          if (data.success && data.data?.shops) {
            setShopSearchResults(data.data.shops);
          } else {
            // Try searching by gstin if shopName didn't yield or as fallback
            const resGstin = await fetch(`/api/shops/search?gstin=${encodeURIComponent(shopSearchQuery)}`);
            const dataGstin = await resGstin.json();
            if (dataGstin.success && dataGstin.data?.shops) {
              setShopSearchResults(dataGstin.data.shops);
            } else {
              setShopSearchResults([]);
            }
          }
        } catch {
          setShopSearchResults([]);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShopSearchResults([]);
    }
  }, [shopSearchQuery, billingType, b2bInputMode]);

  const handleSelectShop = (shop: ShopOption) => {
    setSelectedShopId(shop.id);
    setBuyerName(shop.shop_name);
    setBuyerPhone(shop.phone || "");
    setBuyerEmail(shop.email || "");
    setBuyerGstin(shop.gstin || "");
    setShopSearchQuery(shop.shop_name);
    setIsShopSearchFocused(false);
  };

  const filteredMedicines = medicines.filter((m) => {
    const query = medSearch.toLowerCase().trim();
    if (!query) return false;
    return (
      m.description.toLowerCase().includes(query) ||
      m.batch_no.toLowerCase().includes(query) ||
      m.hsn_code.toLowerCase().includes(query) ||
      m.mrp.toLowerCase().includes(query) ||
      m.exp_date.toLowerCase().includes(query) ||
      m.quantity.toString().includes(query)
    );
  });

  const handleAddToCart = (med: any) => {
    if (med.quantity < 1) return;

    const existing = cart.find((item) => item.medicineId === med.id);
    if (existing) {
      if (existing.quantity + 1 > med.quantity) return;
      setCart(
        cart.map((item) =>
          item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          medicineId: med.id,
          description: med.description,
          batchNo: med.batch_no,
          rate: parseFloat(med.rate),
          mrp: parseFloat(med.mrp),
          gstRate: parseFloat(med.gst_rate),
          quantity: 1,
          freeQuantity: 0,
          maxStock: med.quantity,
        },
      ]);
    }
    setMedSearch("");
    setIsSearchFocused(false);
  };

  const updateQuantity = (medicineId: string, qty: number) => {
    setCart(
      cart.map((item) => {
        if (item.medicineId === medicineId) {
          const newQty = Math.max(1, Math.min(qty, item.maxStock));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicineId !== medicineId));
  };

  const subTotal = cart.reduce((acc, item) => acc + item.rate * item.quantity, 0);
  const totalGst = cart.reduce((acc, item) => acc + (item.rate * item.quantity * item.gstRate) / 100, 0);
  const discountNum = parseFloat(discount) || 0;
  const netAmount = Math.max(0, subTotal + totalGst - discountNum);

  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Add at least one medicine item to generate invoice.");
      return;
    }
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setError("Customer Name and Phone number are required.");
      return;
    }
    if (billingType === "B2B" && !buyerGstin.trim()) {
      setError("GSTIN is required for B2B billing.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload: any = {
        buyer: {
          name: buyerName.trim(),
          phone: buyerPhone.trim(),
          email: buyerEmail ? buyerEmail.trim() : null,
          gstin: billingType === "B2B" && buyerGstin ? buyerGstin.trim() : null,
        },
        items: cart.map((i) => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
          freeQuantity: i.freeQuantity,
        })),
        discount: discountNum,
        paymentMode,
        paymentStatus,
        doctorName: billingType === "B2C" && doctorName ? doctorName.trim() : null,
        doctorRegNo: billingType === "B2C" && doctorRegNo ? doctorRegNo.trim() : null,
        note: note ? note.trim() : null,
      };

      // Pass shopId if B2B search mode was used and a shop was selected
      if (billingType === "B2B" && b2bInputMode === "search" && selectedShopId) {
        payload.buyerShopId = selectedShopId;
      }

      const res = await fetch("/api/protected/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to generate invoice");
      }

      // Clear details automatically upon success
      resetForm();
      setSuccessMessage("Invoice generated successfully!");

      setTimeout(() => {
        router.push(`/invoices/${data.data.invoice.id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    billingType,
    setBillingType: (type: "B2C" | "B2B") => {
      setBillingType(type);
      if (type === "B2C") {
        setSelectedShopId(null);
        setB2bInputMode("manual");
      }
    },
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
    resetForm, // Optionally exposed if you want manual reset capability in UI
  };
}