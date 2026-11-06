// components/ui/Spinner.tsx
import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

export function Spinner({ size = "sm", fullScreen = false, text = "Loading..." }: SpinnerProps) {
  const dimensions = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const spinnerElement = (
    <div className={`relative flex items-center justify-center ${dimensions[size]} animate-spin`}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-[15%] h-[30%] bg-[#2a9d8f] rounded-full"
          style={{
            transform: `rotate(${i * 30}deg) translate(0, -130%)`,
            opacity: (i + 1) / 12,
          }}
        />
      ))}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4 bg-zinc-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shadow-xs">
            {spinnerElement}
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold text-zinc-800">{text}</p>
            <p className="text-xs text-zinc-500">Please wait while we prepare your data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 gap-2 mx-auto">
      {spinnerElement}
      <p className="text-[11px] font-medium text-zinc-600 tracking-wide">
        {text}
      </p>
    </div>
  );
}