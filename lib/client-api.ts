import type { InvoiceView } from "@/lib/stealth";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function withOwner(owner: string | null, init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  if (owner) headers.set("x-nimiq-address", owner);
  headers.set("content-type", "application/json");
  return { ...init, headers };
}

export async function createInvoice(
  owner: string,
  input: {
    amount: string;
    asset: "NIM" | "USDT";
    ethAddress?: string;
    message: string;
    signature: string;
    publicKey: string;
  },
) {
  return parseJson<{ invoice: InvoiceView; secret: string }>(
    await fetch("/api/invoices", withOwner(owner, { method: "POST", body: JSON.stringify(input) })),
  );
}

export async function listInvoices(owner: string) {
  const data = await parseJson<{ invoices: InvoiceView[] }>(
    await fetch(`/api/invoices?owner=${encodeURIComponent(owner)}`, withOwner(owner)),
  );
  return data.invoices;
}

export async function fetchPublicInvoice(publicId: string) {
  return parseJson<{
    publicId: string;
    asset: "NIM" | "USDT";
    amountMinor: string;
    amountLabel: string;
    status: string;
    recipientNim: string;
    recipientEth: string | null;
    memo: string;
    vaultCommitment: string;
  }>(await fetch(`/api/invoices/${publicId}`));
}

export async function settleInvoice(publicId: string, txHash: string, asset: string) {
  return parseJson(await fetch(`/api/invoices/${publicId}/settle`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ txHash, asset }),
  }));
}

export async function issueViewingKey(
  owner: string,
  input: { message: string; signature: string; publicKey: string },
) {
  return parseJson<{ token: string }>(
    await fetch("/api/viewing-keys", withOwner(owner, { method: "POST", body: JSON.stringify(input) })),
  );
}

export async function fetchAudit(token: string) {
  return parseJson<{
    invoices: Array<{
      publicId: string;
      asset: string;
      amountLabel: string;
      status: string;
      createdAt: string;
    }>;
  }>(await fetch(`/api/audit/${encodeURIComponent(token)}`));
}

export async function fetchQr(url: string) {
  const data = await parseJson<{ dataUrl: string }>(
    await fetch(`/api/qr?url=${encodeURIComponent(url)}`),
  );
  return data.dataUrl;
}
