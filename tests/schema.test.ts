import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("StealthPay schema isolation", () => {
  it("scopes every Prisma model to the stealthpay schema", () => {
    const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
    expect(schema).toContain('schemas  = ["stealthpay"]');
    expect(schema).toContain('@@schema("stealthpay")');
    expect(schema).not.toContain('@@schema("payrun")');
    expect(schema).toContain('@@map("businesses")');
    expect(schema).toContain('@@map("invoices")');
    expect(schema).toContain('@@map("viewing_grants")');
    expect(schema).toContain("partyName");
    expect(schema).toContain("serviceRendered");
    expect(schema).toContain("partyType");
  });

  it("uses a unique migration name so a shared _prisma_migrations table cannot skip Payrun", () => {
    const migration = readFileSync(
      new URL("../prisma/migrations/20260918120001_stealthpay_init/migration.sql", import.meta.url),
      "utf8",
    );
    expect(migration).toContain('CREATE SCHEMA IF NOT EXISTS "stealthpay"');
    expect(migration).toContain('"stealthpay"."invoices"');
    expect(migration).not.toContain("payrun");
  });
});
