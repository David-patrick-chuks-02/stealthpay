import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInvoice,
  fetchAudit,
  fetchPublicInvoice,
  fetchQr,
  issueViewingKey,
  listInvoices,
  settleInvoice,
} from "@/lib/client-api";

describe("StealthPay client API", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? "GET";
        if (url === "/api/invoices" && method === "POST") {
          return Response.json({ invoice: { publicId: "ABCD" }, secret: "s" });
        }
        if (url.includes("/api/invoices?") && method === "GET") {
          return Response.json({ invoices: [] });
        }
        if (url.includes("/api/invoices/") && url.includes("/settle")) {
          return Response.json({ ok: true });
        }
        if (url.includes("/api/invoices/")) {
          return Response.json({ publicId: "ABCD", vaultCommitment: "abcdef12" });
        }
        if (url.includes("/api/viewing-keys")) {
          return Response.json({ token: "sp_view_x" });
        }
        if (url.includes("/api/audit/")) {
          return Response.json({ invoices: [] });
        }
        if (url.includes("/api/qr")) {
          return Response.json({ dataUrl: "data:image/png;base64,xx" });
        }
        return Response.json({ error: "missing mock" }, { status: 500 });
      }),
    );
  });

  it("covers invoice, settle, viewing-key, audit, and QR helpers", async () => {
    await createInvoice("NQ1", {
      amount: "500",
      asset: "NIM",
      partyType: "organization",
      partyName: "Northwind Studio",
      serviceRendered: "September retainer",
      message: "stealthpay:issue:NQ1",
      signature: "s",
      publicKey: "k",
    });
    await listInvoices("NQ1");
    await fetchPublicInvoice("ABCD");
    await settleInvoice("ABCD", "0x1", "NIM");
    await issueViewingKey("NQ1", {
      message: "stealthpay:viewing-key:NQ1",
      signature: "s",
      publicKey: "k",
    });
    await fetchAudit("sp_view_x");
    await fetchQr("https://stealthpay.up.railway.app/pay/ABCD");
    expect(fetch).toHaveBeenCalled();
  });

  it("surfaces API errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "Nope" }, { status: 400 })));
    await expect(listInvoices("NQ1")).rejects.toThrow("Nope");
  });
});
