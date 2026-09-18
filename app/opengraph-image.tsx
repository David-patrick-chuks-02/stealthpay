import { ogContentType, ogSize, renderStealthOg } from "@/lib/og";

export const alt = "Invoices without a public name.";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OpengraphImage() {
  return renderStealthOg({
    title: "Invoices without a public name.",
    pill: "Generate invoice",
    amount: "500 NIM",
  });
}
