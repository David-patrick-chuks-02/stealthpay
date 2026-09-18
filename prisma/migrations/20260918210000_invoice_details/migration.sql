-- AlterTable
ALTER TABLE "stealthpay"."invoices" ADD COLUMN "partyType" TEXT NOT NULL DEFAULT 'individual';
ALTER TABLE "stealthpay"."invoices" ADD COLUMN "partyName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "stealthpay"."invoices" ADD COLUMN "serviceRendered" TEXT NOT NULL DEFAULT '';
