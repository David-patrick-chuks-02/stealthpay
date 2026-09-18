import { getInvoicePreview, invoiceShareMetadata } from "@/lib/invoice-preview";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  return invoiceShareMetadata(await getInvoicePreview(publicId), "invoice");
}

export default function ShareInvoiceLayout({ children }: { children: ReactNode }) {
  return children;
}
