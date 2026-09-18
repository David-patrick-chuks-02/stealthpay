import { prisma } from "@/lib/prisma";
import { stealthRegistry } from "@/lib/registry";
import { jsonError } from "@/lib/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  try {
    const { publicId } = await context.params;
    const body = (await request.json()) as { txHash?: string; asset?: string };
    if (!body.txHash) return jsonError("Transaction hash is required.");
    const invoice = await prisma.invoice.findUnique({ where: { publicId } });
    if (!invoice) return jsonError("Invoice not found.", 404);

    const accepted = await stealthRegistry.depositShieldedFunds(invoice.vaultCommitment);
    if (!accepted) return jsonError("Vault commitment missing.");

    await prisma.settlement.create({
      data: {
        invoiceId: invoice.id,
        txHash: body.txHash,
        asset: body.asset ?? invoice.asset,
      },
    });
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "settled" },
    });

    const withdrawn = await stealthRegistry.withdrawPrivate(
      invoice.vaultCommitment,
      invoice.recipientNim,
    );

    return Response.json({ ok: true, withdrawn });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not record settlement.");
  }
}
