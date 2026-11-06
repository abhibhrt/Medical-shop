// components/features/shop/LocationPromptModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MapPin } from "lucide-react";

interface LocationPromptModalProps {
  onLocationSaved: (location: { city: string; pincode: string }) => void;
}

export function LocationPromptModal({ onLocationSaved }: LocationPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedLocation = localStorage.getItem("user_location");
    if (!savedLocation) {
      setIsOpen(true);
    } else {
      const parsed = JSON.parse(savedLocation);
      onLocationSaved(parsed);
    }
  }, [onLocationSaved]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !pincode.trim()) {
      setError("Please enter both city and pincode.");
      return;
    }

    const locationData = { city: city.trim(), pincode: pincode.trim() };
    localStorage.setItem("user_location", JSON.stringify(locationData));
    setIsOpen(false);
    onLocationSaved(locationData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-xs px-4">
      <div className="bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#2a9d8f] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900">Enter Your Location</h2>
            <p className="text-xs text-zinc-500">We need your city and pincode to show nearby stores.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
          <Input
            label="City *"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Kolkata"
          />
          <Input
            label="Pincode *"
            required
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g. 700001"
          />
          <Button type="submit" className="w-full justify-center">
            Continue to Stores
          </Button>
        </form>
      </div>
    </div>
  );
}