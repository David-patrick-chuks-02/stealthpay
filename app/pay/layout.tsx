import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pay invoice",
  description: "Open a StealthPay invoice and confirm name, service, and amount in Nimiq Pay.",
  alternates: { canonical: "/pay" },
};

export default function PayLayout({ children }: { children: ReactNode }) {
  return children;
}
