import type { Metadata } from "next";
import type { PartyType } from "@/lib/invoice-fields";
import { formatAmount } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export type InvoicePreview = {
  publicId: string;
  partyType: PartyType;
  partyName: string;
  serviceRendered: string;
  amountLabel: string;
  status: string;
};

export async function getInvoicePreview(publicId: string): Promise<InvoicePreview | null> {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { publicId } });
    if (!invoice) return null;
    const asset = invoice.asset === "USDT" ? "USDT" : "NIM";
    return {
      publicId: invoice.publicId,
      partyType: invoice.partyType === "organization" ? "organization" : "individual",
      partyName: invoice.partyName || "StealthPay invoice",
      serviceRendered: invoice.serviceRendered || "Wallet stays off this page.",
      amountLabel: formatAmount(asset, invoice.amountMinor),
      status: invoice.status,
    };
  } catch {
    return null;
  }
}

export function invoiceShareMetadata(
  invoice: InvoicePreview | null,
  path: "pay" | "invoice",
): Metadata {
  const title = invoice ? `${invoice.amountLabel} · ${invoice.partyName}` : "StealthPay invoice";
  const description = invoice
    ? `${invoice.serviceRendered}. Wallet stays off this page.`
    : "Private invoice. Wallet stays off this page.";
  const url = invoice ? `/${path}/${invoice.publicId}` : `/${path}`;
  const image = `${url}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
