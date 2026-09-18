CREATE SCHEMA IF NOT EXISTS "stealthpay";

CREATE TABLE "stealthpay"."businesses" (
    "id" TEXT NOT NULL,
    "nimiqAddress" TEXT NOT NULL,
    "ethAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stealthpay_businesses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stealthpay_businesses_nimiqAddress_key" ON "stealthpay"."businesses"("nimiqAddress");

CREATE TABLE "stealthpay"."invoices" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "vaultCommitment" TEXT NOT NULL,
    "invoiceSecretHash" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "amountMinor" TEXT NOT NULL,
    "recipientNim" TEXT NOT NULL,
    "recipientEth" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stealthpay_invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stealthpay_invoices_publicId_key" ON "stealthpay"."invoices"("publicId");
CREATE UNIQUE INDEX "stealthpay_invoices_vaultCommitment_key" ON "stealthpay"."invoices"("vaultCommitment");

CREATE TABLE "stealthpay"."viewing_grants" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stealthpay_viewing_grants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stealthpay_viewing_grants_tokenHash_key" ON "stealthpay"."viewing_grants"("tokenHash");

CREATE TABLE "stealthpay"."settlements" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stealthpay_settlements_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "stealthpay"."invoices" ADD CONSTRAINT "stealthpay_invoices_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "stealthpay"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stealthpay"."viewing_grants" ADD CONSTRAINT "stealthpay_viewing_grants_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "stealthpay"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stealthpay"."settlements" ADD CONSTRAINT "stealthpay_settlements_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "stealthpay"."invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
