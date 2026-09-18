import { describe, expect, it } from "vitest";
import { sha256Hex, shortIdFromCommitment } from "@/lib/crypto";
import {
  formatAmount,
  isAsset,
  LUNA_PER_NIM,
  nimLuna,
  parseAmountMinor,
  POLYGON_CHAIN_ID,
  POLYGON_CHAIN_ID_HEX,
  USDT_DECIMALS,
  USDT_POLYGON,
} from "@/lib/money";
import { jsonError, requireNimAddress } from "@/lib/http";
import { unwrapNimiq } from "@/lib/nimiq-result";
import { randomId } from "@/lib/uuid";
import { parsePartyName, parseServiceRendered, partyTypeLabel } from "@/lib/invoice-fields";

describe("crypto commitments", () => {
  it("hashes secrets and shortens vault ids", () => {
    const hash = sha256Hex("secret");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(sha256Hex("secret"));
    expect(sha256Hex("other")).not.toBe(hash);
    expect(shortIdFromCommitment(hash)).toBe(hash.slice(0, 4).toUpperCase());
    expect(shortIdFromCommitment(hash)).toHaveLength(4);
  });
});

describe("invoice amounts", () => {
  it("parses NIM luna and Polygon USDT minor units", () => {
    expect(LUNA_PER_NIM).toBe(100_000);
    expect(USDT_DECIMALS).toBe(6);
    expect(POLYGON_CHAIN_ID).toBe(137);
    expect(POLYGON_CHAIN_ID_HEX).toBe("0x89");
    expect(USDT_POLYGON).toBe("0xc2132D05D31c914a87C6611C10748AEb04B58e8F");
    expect(isAsset("NIM")).toBe(true);
    expect(isAsset("USDT")).toBe(true);
    expect(isAsset("ETH")).toBe(false);
    expect(parseAmountMinor("NIM", "500")).toBe("50000000");
    expect(parseAmountMinor("USDT", "50")).toBe("50000000");
    expect(formatAmount("NIM", "50000000")).toBe("500 NIM");
    expect(formatAmount("USDT", "50000000")).toBe("50 USDT");
    expect(nimLuna("50000000")).toBe(50_000_000);
  });

  it("rejects empty amounts", () => {
    expect(() => parseAmountMinor("NIM", "0")).toThrow(/greater than zero/);
    expect(() => parseAmountMinor("USDT", "nope")).toThrow(/greater than zero/);
  });
});

describe("invoice details", () => {
  it("requires a name or organization and a service description", () => {
    expect(parsePartyName("  Alex Rivera ")).toBe("Alex Rivera");
    expect(parseServiceRendered("  September retainer  ")).toBe("September retainer");
    expect(partyTypeLabel("organization")).toBe("Organization");
    expect(() => parsePartyName("A")).toThrow(/name or organization/);
    expect(() => parseServiceRendered("ab")).toThrow(/service rendered/);
  });
});

describe("http, ids, and SDK unwrap", () => {
  it("requires a Nimiq address", () => {
    expect(
      requireNimAddress(
        new Request("http://stealthpay.test/api/invoices", {
          headers: { "x-nimiq-address": " NQ1 " },
        }),
      ),
    ).toBe("NQ1");
    expect(
      requireNimAddress(new Request("http://stealthpay.test/api/invoices?owner=NQ2")),
    ).toBe("NQ2");
    expect(() =>
      requireNimAddress(new Request("http://stealthpay.test/api/invoices")),
    ).toThrow(/Connect a Nimiq address/);
  });

  it("returns JSON errors and UUID ids", async () => {
    const response = jsonError("Missing url.", 400);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Missing url." });
    expect(randomId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("unwraps Nimiq Pay error envelopes", () => {
    expect(unwrapNimiq(["NQ1"], "fail")).toEqual(["NQ1"]);
    expect(() => unwrapNimiq({ error: { message: "denied" } }, "fail")).toThrow("denied");
  });
});
