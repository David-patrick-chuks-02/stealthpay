import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { formatAmount } from "@/lib/money";
import type { PartyType } from "@/lib/invoice-fields";

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  try {
    const { publicId } = await context.params;
    const invoice = await prisma.invoice.findUnique({ where: { publicId } });
    if (!invoice) return jsonError("Invoice not found.", 404);
    const asset = invoice.asset === "USDT" ? "USDT" : "NIM";
    const partyType: PartyType = invoice.partyType === "organization" ? "organization" : "individual";
    return Response.json({
      publicId: invoice.publicId,
      asset,
      amountMinor: invoice.amountMinor,
      amountLabel: formatAmount(asset, invoice.amountMinor),
      partyType,
      partyName: invoice.partyName,
      serviceRendered: invoice.serviceRendered,
      status: invoice.status,
      recipientNim: invoice.recipientNim,
      recipientEth: invoice.recipientEth,
      memo: `stealthpay:${invoice.publicId.toLowerCase()}`,
      vaultCommitment: invoice.vaultCommitment.slice(0, 8),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load invoice.");
  }
}
