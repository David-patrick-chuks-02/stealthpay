import { prisma } from "@/lib/prisma";
import { sha256Hex, shortIdFromCommitment } from "@/lib/crypto";
import { jsonError, requireNimAddress } from "@/lib/http";
import { formatAmount, isAsset, parseAmountMinor } from "@/lib/money";
import { randomId } from "@/lib/uuid";
import type { InvoiceView } from "@/lib/stealth";

function toView(invoice: {
  id: string;
  publicId: string;
  asset: string;
  amountMinor: string;
  status: string;
  vaultCommitment: string;
  recipientNim: string;
  recipientEth: string | null;
  createdAt: Date;
}): InvoiceView {
  const asset = invoice.asset === "USDT" ? "USDT" : "NIM";
  return {
    id: invoice.id,
    publicId: invoice.publicId,
    asset,
    amountMinor: invoice.amountMinor,
    amountLabel: formatAmount(asset, invoice.amountMinor),
    status: invoice.status,
    vaultCommitment: invoice.vaultCommitment,
    recipientNim: invoice.recipientNim,
    recipientEth: invoice.recipientEth,
    createdAt: invoice.createdAt.toISOString(),
    sharePath: `/invoice/${invoice.publicId}`,
    memo: `stealthpay:${invoice.publicId.toLowerCase()}`,
  };
}

export async function GET(request: Request) {
  try {
    const owner = requireNimAddress(request);
    const business = await prisma.business.findUnique({
      where: { nimiqAddress: owner },
      include: { invoices: { orderBy: { createdAt: "desc" } } },
    });
    return Response.json({ invoices: (business?.invoices ?? []).map(toView) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load invoices.");
  }
}

export async function POST(request: Request) {
  try {
    const owner = requireNimAddress(request);
    const body = (await request.json()) as {
      amount?: string;
      asset?: string;
      ethAddress?: string;
      message?: string;
      signature?: string;
      publicKey?: string;
    };
    if (!isAsset(body.asset ?? "")) {
      return jsonError("Asset must be NIM or USDT.");
    }
    const asset = body.asset as "NIM" | "USDT";
    if (body.message !== `stealthpay:issue:${owner}`) {
      return jsonError("Sign the invoice issuance message.");
    }
    if (!body.signature || !body.publicKey) {
      return jsonError("Wallet signature is required.");
    }
    if (asset === "USDT" && !body.ethAddress) {
      return jsonError("Connect an Ethereum address for USDT invoices.");
    }

    const amountMinor = parseAmountMinor(asset, body.amount ?? "");
    const secret = randomId();
    const vaultCommitment = sha256Hex(secret);
    const publicId = shortIdFromCommitment(vaultCommitment);
    const uniquePublicId = `${publicId}${vaultCommitment.slice(4, 8).toUpperCase()}`;

    const business = await prisma.business.upsert({
      where: { nimiqAddress: owner },
      create: { nimiqAddress: owner, ethAddress: body.ethAddress ?? null },
      update: { ethAddress: body.ethAddress ?? undefined },
    });

    const invoice = await prisma.invoice.create({
      data: {
        publicId: uniquePublicId,
        businessId: business.id,
        vaultCommitment,
        invoiceSecretHash: sha256Hex(secret),
        asset,
        amountMinor,
        recipientNim: owner,
        recipientEth: asset === "USDT" ? body.ethAddress ?? null : business.ethAddress,
        status: "open",
      },
    });

    return Response.json({
      invoice: toView(invoice),
      secret,
      proof: { message: body.message, signature: body.signature, publicKey: body.publicKey },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not generate invoice.");
  }
}
