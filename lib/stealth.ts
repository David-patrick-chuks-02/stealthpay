/**
 * Application-layer registry that mirrors the brief's IStealthPay matrix.
 * This is not a live Solidity contract and not a shielded pool.
 */
export interface IStealthPay {
  depositShieldedFunds(vaultCommitment: string): Promise<boolean>;
  generateAuditProof(business: string, viewingHash: string): Promise<string>;
  withdrawPrivate(nullifierHash: string, recipientDestination: string): Promise<boolean>;
}

export type InvoiceView = {
  id: string;
  publicId: string;
  asset: "NIM" | "USDT";
  amountMinor: string;
  amountLabel: string;
  status: string;
  vaultCommitment: string;
  recipientNim: string;
  recipientEth: string | null;
  createdAt: string;
  sharePath: string;
  memo: string;
};
