export const LUNA_PER_NIM = 100_000;
export const USDT_DECIMALS = 6;
export const USDT_POLYGON = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
export const POLYGON_CHAIN_ID_HEX = "0x89";
export const POLYGON_CHAIN_ID = 137;

export type Asset = "NIM" | "USDT";

export function isAsset(value: string): value is Asset {
  return value === "NIM" || value === "USDT";
}

export function parseAmountMinor(asset: Asset, raw: string): string {
  const amount = Number.parseFloat(raw.trim());
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }
  if (asset === "NIM") {
    return String(Math.round(amount * LUNA_PER_NIM));
  }
  return String(Math.round(amount * 10 ** USDT_DECIMALS));
}

export function formatAmount(asset: Asset, amountMinor: string): string {
  const value = Number.parseInt(amountMinor, 10);
  if (asset === "NIM") {
    const nim = value / LUNA_PER_NIM;
    return Number.isInteger(nim) ? `${nim} NIM` : `${nim} NIM`;
  }
  const usdt = value / 10 ** USDT_DECIMALS;
  return `${usdt} USDT`;
}

export function nimLuna(amountMinor: string): number {
  return Number.parseInt(amountMinor, 10);
}
