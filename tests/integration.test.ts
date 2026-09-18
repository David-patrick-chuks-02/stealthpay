import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { sha256Hex } from "@/lib/crypto";
import { parseAmountMinor } from "@/lib/money";
import { randomId } from "@/lib/uuid";
import { GET as listInvoices, POST as createInvoice } from "@/app/api/invoices/route";
import { GET as getPublicInvoice } from "@/app/api/invoices/[publicId]/route";
import { POST as settleInvoice } from "@/app/api/invoices/[publicId]/settle/route";
import { POST as issueViewingKey } from "@/app/api/viewing-keys/route";
import { GET as getAudit } from "@/app/api/audit/[token]/route";
import { GET as getQr } from "@/app/api/qr/route";
import { apiRequest, readJson } from "./helpers";

const suffix = randomId().replace(/-/g, "").slice(0, 12);
const owner = `NQTESTSTEALTH${suffix.toUpperCase()}`;

async function cleanup() {
  await prisma.business.deleteMany({ where: { nimiqAddress: owner } });
}

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("StealthPay live database flow", () => {
  it("keeps stealthpay tables out of the payrun schema", async () => {
    const tables = await prisma.$queryRaw<Array<{ table_schema: string; table_name: string }>>`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema IN ('payrun', 'stealthpay')
      ORDER BY 1, 2
    `;
    expect(tables.filter((row) => row.table_schema === "stealthpay").map((row) => row.table_name)).toEqual(
      expect.arrayContaining(["businesses", "invoices", "viewing_grants", "settlements"]),
    );
    expect(
      tables.find((row) => row.table_schema === "payrun" && row.table_name === "invoices"),
    ).toBeUndefined();
  });

  it("runs invoice → public amount-only view → settle → viewing key → audit → QR", async () => {
    await cleanup();

    const created = await readJson(
      await createInvoice(
        apiRequest("/api/invoices", {
          method: "POST",
          owner,
          body: {
            asset: "NIM",
            amount: "500",
            partyType: "organization",
            partyName: "Northwind Studio",
            serviceRendered: "September retainer",
            message: `stealthpay:issue:${owner}`,
            signature: "test-signature",
            publicKey: "test-public-key",
          },
        }),
      ),
    );
    expect(created.status).toBe(200);
    const createdInvoice = created.body.invoice as {
      publicId: string;
      vaultCommitment: string;
      amountMinor: string;
      recipientNim: string;
      partyName: string;
      serviceRendered: string;
    };
    expect(createdInvoice.amountMinor).toBe(parseAmountMinor("NIM", "500"));
    expect(createdInvoice.partyName).toBe("Northwind Studio");
    expect(createdInvoice.serviceRendered).toBe("September retainer");
    expect(createdInvoice.recipientNim).toBe(owner);
    expect(sha256Hex(String(created.body.secret))).toBe(createdInvoice.vaultCommitment);

    const listed = await readJson(await listInvoices(apiRequest("/api/invoices", { owner })));
    expect((listed.body.invoices as unknown[]).length).toBe(1);

    const pub = await readJson(
      await getPublicInvoice(apiRequest(`/api/invoices/${createdInvoice.publicId}`), {
        params: Promise.resolve({ publicId: createdInvoice.publicId }),
      }),
    );
    expect(pub.body).toMatchObject({
      publicId: createdInvoice.publicId,
      amountLabel: "500 NIM",
      partyName: "Northwind Studio",
      serviceRendered: "September retainer",
      status: "open",
    });
    expect(String(pub.body.vaultCommitment)).toHaveLength(8);
    expect(pub.body).not.toHaveProperty("invoiceSecretHash");
    expect(pub.body).not.toHaveProperty("secret");

    const usdtBlocked = await readJson(
      await createInvoice(
        apiRequest("/api/invoices", {
          method: "POST",
          owner,
          body: {
            asset: "USDT",
            amount: "50",
            partyType: "individual",
            partyName: "Alex Rivera",
            serviceRendered: "Consulting",
            message: `stealthpay:issue:${owner}`,
            signature: "test-signature",
            publicKey: "test-public-key",
          },
        }),
      ),
    );
    expect(usdtBlocked.body.error).toMatch(/Ethereum address/);

    const settled = await readJson(
      await settleInvoice(
        apiRequest(`/api/invoices/${createdInvoice.publicId}/settle`, {
          method: "POST",
          body: { txHash: `0x${suffix}`, asset: "NIM" },
        }),
        { params: Promise.resolve({ publicId: createdInvoice.publicId }) },
      ),
    );
    expect(settled.body).toMatchObject({ ok: true, withdrawn: true });

    const viewing = await readJson(
      await issueViewingKey(
        apiRequest("/api/viewing-keys", {
          method: "POST",
          owner,
          body: {
            message: `stealthpay:viewing-key:${owner}`,
            signature: "test-signature",
            publicKey: "test-public-key",
          },
        }),
      ),
    );
    expect(String(viewing.body.token)).toMatch(/^sp_view_/);

    const audit = await readJson(
      await getAudit(apiRequest(`/api/audit/${viewing.body.token}`), {
        params: Promise.resolve({ token: String(viewing.body.token) }),
      }),
    );
    expect(audit.body.invoices).toEqual([
      expect.objectContaining({
        publicId: createdInvoice.publicId,
        amountLabel: "500 NIM",
        partyName: "Northwind Studio",
        serviceRendered: "September retainer",
        status: "settled",
      }),
    ]);

    const qr = await readJson(
      await getQr(
        apiRequest(
          `/api/qr?url=${encodeURIComponent(`https://stealthpay.up.railway.app/pay/${createdInvoice.publicId}`)}`,
        ),
      ),
    );
    expect(String(qr.body.dataUrl)).toMatch(/^data:image\/png;base64,/);
  });
});
