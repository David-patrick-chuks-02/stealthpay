import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Audit",
  description: "Issue a read-only viewing key. Ledger only. No send.",
  alternates: { canonical: "/audit" },
};

export default function AuditLayout({ children }: { children: ReactNode }) {
  return children;
}
