import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/crypto";
import { apiRequest, readJson } from "./helpers";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    business: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    invoice: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    settlement: {
      create: vi.fn(),
    },
    viewingGrant: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const db = prisma as unknown as {
  business: {
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };
  invoice: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  settlement: { create: ReturnType<typeof vi.fn> };
  viewingGrant: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

const OWNER = "NQSTEALTHOWNER";

describe("invoice API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a wallet and a signed issuance message", async () => {
    const { GET, POST } = await import("@/app/api/invoices/route");
    const unauthorized = await readJson(await GET(apiRequest("/api/invoices")));
    expect(unauthorized.body.error).toMatch(/Connect a Nimiq address/);

    const badAsset = await readJson(
      await POST(
        apiRequest("/api/invoices", {
          method: "POST",
          owner: OWNER,
          body: { asset: "ETH", amount: "1" },
        }),
      ),
    );
    expect(badAsset.body.error).toMatch(/NIM or USDT/);

    const badMessage = await readJson(
      await POST(
        apiRequest("/api/invoices", {
          method: "POST",
          owner: OWNER,
          body: {
            asset: "NIM",
            amount: "500",
            partyType: "individual",
            partyName: "Alex Rivera",
            serviceRendered: "Consulting",
            message: "wrong",
          },
        }),
      ),
    );
    expect(badMessage.body.error).toMatch(/Sign the invoice issuance message/);
  });

  it("requires a name or organization and a service rendered", async () => {
    const { POST } = await import("@/app/api/invoices/route");
    const missingName = await readJson(
      await POST(
        apiRequest("/api/invoices", {
          method: "POST",
          owner: OWNER,
          body: {
            asset: "NIM",
            amount: "500",
            partyType: "individual",
            partyName: "",
            serviceRendered: "Design retainer",
            message: `stealthpay:issue:${OWNER}`,
            signature: "sig",
            publicKey: "pk",
          },
        }),
      ),
    );
    expect(missingName.body.error).toMatch(/name or organization/);

    const missingService = await readJson(
      await POST(
        apiRequest("/api/invoices", {
          method: "POST",
          owner: OWNER,
          body: {
            asset: "NIM",
            amount: "500",
            partyType: "organization",
            partyName: "Northwind Studio",
            serviceRendered: "ab",
            message: `stealthpay:issue:${OWNER}`,
            signature: "sig",
            publicKey: "pk",
          },
        }),
      ),
    );
    expect(missingService.body.error).toMatch(/service rendered/);
  });

  it("requires an Ethereum address for USDT invoices", async () => {
    const { POST } = await import("@/app/api/invoices/route");
    const { body } = await readJson(
      await POST(
        apiRequest("/api/invoices", {
          method: "POST",
          owner: OWNER,
          body: {
            asset: "USDT",
            amount: "50",
            partyType: "individual",
            partyName: "Alex Rivera",
            serviceRendered: "Consulting",
            message: `stealthpay:issue:${OWNER}`,
            signature: "sig",
            publicKey: "pk",
          },
        }),
      ),
    );
    expect(body.error).toMatch(/Ethereum address/);
  });

  it("creates a NIM invoice with a vault commitment and share path", async () => {
    const { POST } = await import("@/app/api/invoices/route");
    db.business.upsert.mockResolvedValue({ id: "b1", nimiqAddress: OWNER, ethAddress: null });
    db.invoice.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "inv1",
      createdAt: new Date("2026-09-18T00:00:00Z"),
      ...data,
    }));
    const { status, body } = await readJson(
      await POST(
        apiRequest("/api/invoices", {
          method: "POST",
          owner: OWNER,
          body: {
            asset: "NIM",
            amount: "500",
            partyType: "organization",
            partyName: "Northwind Studio",
            serviceRendered: "September retainer",
            message: `stealthpay:issue:${OWNER}`,
            signature: "sig",
            publicKey: "pk",
          },
        }),
      ),
    );
    expect(status).toBe(200);
    const invoice = body.invoice as Record<string, string>;
    expect(invoice.asset).toBe("NIM");
    expect(invoice.partyName).toBe("Northwind Studio");
    expect(invoice.serviceRendered).toBe("September retainer");
    expect(invoice.partyType).toBe("organization");
    expect(invoice.status).toBe("open");
    expect(invoice.sharePath).toMatch(/^\/invoice\//);
    expect(invoice.memo).toMatch(/^stealthpay:/);
    expect(invoice.vaultCommitment).toMatch(/^[a-f0-9]{64}$/);
    expect(body.secret).toEqual(expect.any(String));
    expect(sha256Hex(String(body.secret))).toBe(invoice.vaultCommitment);
  });

  it("lists invoices for the business and hides the full vault on the public route", async () => {
    db.business.findUnique.mockResolvedValue({ invoices: [] });
    const { GET } = await import("@/app/api/invoices/route");
    const list = await readJson(await GET(apiRequest("/api/invoices", { owner: OWNER })));
    expect(list.body.invoices).toEqual([]);

    db.invoice.findUnique.mockResolvedValue({
      publicId: "ABCD1234",
      asset: "NIM",
      amountMinor: "50000000",
      partyType: "organization",
      partyName: "Northwind Studio",
      serviceRendered: "September retainer",
      status: "open",
      recipientNim: OWNER,
      recipientEth: null,
      vaultCommitment: "abcdef12deadbeef",
    });
    const { GET: GET_PUBLIC } = await import("@/app/api/invoices/[publicId]/route");
    const pub = await readJson(
      await GET_PUBLIC(apiRequest("/api/invoices/ABCD1234"), {
        params: Promise.resolve({ publicId: "ABCD1234" }),
      }),
    );
    expect(pub.body).toMatchObject({
      publicId: "ABCD1234",
      amountLabel: "500 NIM",
      partyName: "Northwind Studio",
      serviceRendered: "September retainer",
      memo: "stealthpay:abcd1234",
      vaultCommitment: "abcdef12",
    });
    expect(String(pub.body.vaultCommitment)).toHaveLength(8);
    expect(pub.body).not.toHaveProperty("invoiceSecretHash");
  });
});

describe("settlement, viewing keys, audit, QR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records a settlement through the signed-claim registry", async () => {
    const { POST } = await import("@/app/api/invoices/[publicId]/settle/route");
    db.invoice.findUnique.mockResolvedValue(null);
    const missing = await readJson(
      await POST(
        apiRequest("/api/invoices/ABCD/settle", {
          method: "POST",
          body: { txHash: "0x1" },
        }),
        { params: Promise.resolve({ publicId: "ABCD" }) },
      ),
    );
    expect(missing.status).toBe(404);

    db.invoice.findUnique.mockResolvedValue({
      id: "inv1",
      publicId: "ABCD",
      vaultCommitment: "vault",
      recipientNim: OWNER,
      asset: "NIM",
    });
    db.invoice.findFirst.mockResolvedValue({ id: "inv1" });
    db.settlement.create.mockResolvedValue({});
    db.invoice.update.mockResolvedValue({});
    const ok = await readJson(
      await POST(
        apiRequest("/api/invoices/ABCD/settle", {
          method: "POST",
          body: { txHash: "0xabc", asset: "NIM" },
        }),
        { params: Promise.resolve({ publicId: "ABCD" }) },
      ),
    );
    expect(ok.body).toEqual({ ok: true, withdrawn: true });
  });

  it("issues a viewing key once and rejects a bad audit token", async () => {
    const { POST } = await import("@/app/api/viewing-keys/route");
    const unsigned = await readJson(
      await POST(
        apiRequest("/api/viewing-keys", {
          method: "POST",
          owner: OWNER,
          body: { message: "wrong" },
        }),
      ),
    );
    expect(unsigned.body.error).toMatch(/viewing-key message/);

    db.business.upsert.mockResolvedValue({ id: "b1" });
    db.viewingGrant.create.mockResolvedValue({});
    const issued = await readJson(
      await POST(
        apiRequest("/api/viewing-keys", {
          method: "POST",
          owner: OWNER,
          body: {
            message: `stealthpay:viewing-key:${OWNER}`,
            signature: "sig",
            publicKey: "pk",
          },
        }),
      ),
    );
    expect(issued.body.shownOnce).toBe(true);
    expect(String(issued.body.token)).toMatch(/^sp_view_/);

    db.viewingGrant.findUnique.mockResolvedValue(null);
    const { GET } = await import("@/app/api/audit/[token]/route");
    const bad = await readJson(
      await GET(apiRequest("/api/audit/nope"), {
        params: Promise.resolve({ token: "nope" }),
      }),
    );
    expect(bad.status).toBe(404);
  });

  it("returns the accountant ledger for a valid viewing key", async () => {
    const token = "sp_view_test";
    const tokenHash = sha256Hex(token);
    db.viewingGrant.findUnique.mockResolvedValue({
      tokenHash,
      business: {
        nimiqAddress: OWNER,
        invoices: [
          {
            publicId: "ABCD",
            asset: "NIM",
            amountMinor: "50000000",
            partyType: "organization",
            partyName: "Northwind Studio",
            serviceRendered: "September retainer",
            status: "settled",
            createdAt: new Date("2026-09-18T00:00:00Z"),
          },
        ],
      },
    });
    db.invoice.findMany.mockResolvedValue([
      {
        publicId: "ABCD",
        asset: "NIM",
        amountMinor: "50000000",
        partyType: "organization",
        partyName: "Northwind Studio",
        serviceRendered: "September retainer",
        status: "settled",
        createdAt: new Date("2026-09-18T00:00:00Z"),
      },
    ]);
    const { GET } = await import("@/app/api/audit/[token]/route");
    const { body } = await readJson(
      await GET(apiRequest(`/api/audit/${token}`), {
        params: Promise.resolve({ token }),
      }),
    );
    expect(body.invoices).toEqual([
      expect.objectContaining({
        publicId: "ABCD",
        amountLabel: "500 NIM",
        partyName: "Northwind Studio",
        serviceRendered: "September retainer",
        status: "settled",
      }),
    ]);
    expect(String(body.proof)).toContain(OWNER);
  });

  it("builds a QR data URL and rejects a missing target", async () => {
    const { GET } = await import("@/app/api/qr/route");
    const missing = await readJson(await GET(apiRequest("/api/qr")));
    expect(missing.body.error).toMatch(/Missing url/);

    const ok = await readJson(
      await GET(apiRequest(`/api/qr?url=${encodeURIComponent("https://stealthpay.up.railway.app/pay/ABCD")}`)),
    );
    expect(String(ok.body.dataUrl)).toMatch(/^data:image\/png;base64,/);
  });
});
