import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/crypto";
import { jsonError, requireNimAddress } from "@/lib/http";
import { randomId } from "@/lib/uuid";

export async function GET(request: Request) {
  try {
    const owner = requireNimAddress(request);
    const business = await prisma.business.findUnique({
      where: { nimiqAddress: owner },
      include: { viewingGrants: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    return Response.json({
      grants: (business?.viewingGrants ?? []).map((grant) => ({
        id: grant.id,
        createdAt: grant.createdAt.toISOString(),
        tokenHash: grant.tokenHash.slice(0, 12),
      })),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load viewing keys.");
  }
}

export async function POST(request: Request) {
  try {
    const owner = requireNimAddress(request);
    const body = (await request.json()) as {
      message?: string;
      signature?: string;
      publicKey?: string;
    };
    if (body.message !== `stealthpay:viewing-key:${owner}`) {
      return jsonError("Sign the viewing-key message.");
    }
    if (!body.signature || !body.publicKey) {
      return jsonError("Wallet signature is required.");
    }
    const business = await prisma.business.upsert({
      where: { nimiqAddress: owner },
      create: { nimiqAddress: owner },
      update: {},
    });
    const token = `sp_view_${randomId().replace(/-/g, "").slice(0, 18)}`;
    const tokenHash = sha256Hex(token);
    await prisma.viewingGrant.create({
      data: { businessId: business.id, tokenHash, label: "accountant" },
    });
    return Response.json({ token, tokenHash, shownOnce: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not issue viewing key.");
  }
}
