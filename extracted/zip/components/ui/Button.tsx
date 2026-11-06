// components/ui/Button.tsx
import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all rounded-md focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#2a9d8f] hover:bg-[#238276] text-white shadow-xs",
    secondary: "bg-[#457b9d] hover:bg-[#3a6885] text-white shadow-xs",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-xs",
    outline: "border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 shadow-xs",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-xs sm:text-sm px-4 py-2",
    lg: "text-sm sm:text-base px-6 py-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}