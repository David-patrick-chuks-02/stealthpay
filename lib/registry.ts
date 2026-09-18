import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/crypto";
import type { IStealthPay } from "@/lib/stealth";

export const stealthRegistry: IStealthPay = {
  async depositShieldedFunds(vaultCommitment) {
    const invoice = await prisma.invoice.findUnique({ where: { vaultCommitment } });
    return Boolean(invoice);
  },
  async generateAuditProof(business, viewingHash) {
    const grant = await prisma.viewingGrant.findUnique({
      where: { tokenHash: viewingHash },
      include: { business: true },
    });
    if (!grant || grant.business.nimiqAddress !== business) {
      throw new Error("Viewing key does not match this business.");
    }
    const invoices = await prisma.invoice.findMany({
      where: { businessId: grant.businessId },
      orderBy: { createdAt: "desc" },
    });
    return JSON.stringify({
      business,
      viewingHash,
      invoices: invoices.map((invoice) => ({
        publicId: invoice.publicId,
        asset: invoice.asset,
        amountMinor: invoice.amountMinor,
        status: invoice.status,
        createdAt: invoice.createdAt,
      })),
    });
  },
  async withdrawPrivate(_nullifierHash, recipientDestination) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        status: "settled",
        OR: [{ recipientNim: recipientDestination }, { recipientEth: recipientDestination }],
      },
    });
    return Boolean(invoice);
  },
};
