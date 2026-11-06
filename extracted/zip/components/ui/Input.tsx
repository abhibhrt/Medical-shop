// components/ui/Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-zinc-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-md text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-[#2a9d8f] transition-all ${
            error ? "border-red-500" : "border-zinc-300"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";