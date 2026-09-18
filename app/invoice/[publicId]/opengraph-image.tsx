import { ogContentType, ogSize, renderInvoiceOg } from "@/lib/og";

export const alt = "StealthPay invoice";
export const size = ogSize;
export const contentType = ogContentType;
export const revalidate = 60;

export default async function ShareOpengraphImage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return renderInvoiceOg(publicId);
}
