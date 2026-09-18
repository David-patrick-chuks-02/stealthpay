import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Viewing key",
  description: "Read-only StealthPay ledger. For accountants. No send.",
};

export default function AuditViewLayout({ children }: { children: ReactNode }) {
  return children;
}
