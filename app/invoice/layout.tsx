import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Generate invoice",
  description: "Create a private NIM or USDT invoice with name, service rendered, and amount.",
  alternates: { canonical: "/invoice" },
};

export default function InvoiceLayout({ children }: { children: ReactNode }) {
  return children;
}
