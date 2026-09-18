import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import { formatAmount } from "@/lib/money";
import { stealthRegistry } from "@/lib/registry";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const tokenHash = sha256Hex(token);
    const grant = await prisma.viewingGrant.findUnique({
      where: { tokenHash },
      include: {
        business: {
          include: { invoices: { orderBy: { createdAt: "desc" } } },
        },
      },
    });
    if (!grant) return jsonError("Viewing key is not valid.", 404);

    const proof = await stealthRegistry.generateAuditProof(
      grant.business.nimiqAddress,
      tokenHash,
    );

    return Response.json({
      proof,
      invoices: grant.business.invoices.map((invoice) => {
        const asset = invoice.asset === "USDT" ? "USDT" : "NIM";
        return {
          publicId: invoice.publicId,
          asset,
          amountLabel: formatAmount(asset, invoice.amountMinor),
          partyType: invoice.partyType === "organization" ? "organization" : "individual",
          partyName: invoice.partyName,
          serviceRendered: invoice.serviceRendered,
          status: invoice.status,
          createdAt: invoice.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not open audit ledger.");
  }
}
