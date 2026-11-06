// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import AuthProvider from "../components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "PharmaCare Pro - Pharmacy & Inventory Management",
  description: "Streamline your medical shop inventory, billing, and prescription orders in one secure platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-zinc-50 min-h-screen text-zinc-900 antialiased selection:bg-teal-500 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}