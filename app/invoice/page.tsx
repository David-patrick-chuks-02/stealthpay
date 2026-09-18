"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { createInvoice, listInvoices } from "@/lib/client-api";
import type { InvoiceView } from "@/lib/stealth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function InvoicePage() {
  const wallet = useWallet();
  const router = useRouter();
  const [amount, setAmount] = useState("500");
  const [asset, setAsset] = useState<"NIM" | "USDT">("NIM");
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!wallet.nimAddress) return;
    listInvoices(wallet.nimAddress)
      .then(setInvoices)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load invoices."));
  }, [wallet.nimAddress]);

  async function onGenerate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const nim = wallet.nimAddress ?? (await wallet.connectNim());
      if (!nim) {
        setError("Connect Nimiq to generate an invoice.");
        return;
      }
      let eth = wallet.ethAddress ?? undefined;
      if (asset === "USDT") {
        eth = wallet.ethAddress ?? (await wallet.connectEth()) ?? undefined;
        if (!eth) {
          setError("USDT invoices need an Ethereum address.");
          return;
        }
      }
      const message = `stealthpay:issue:${nim}`;
      const signed = await wallet.signMessage(message);
      const created = await createInvoice(nim, {
        amount,
        asset,
        ethAddress: eth,
        message,
        signature: signed.signature,
        publicKey: signed.publicKey,
      });
      router.push(`/invoice/${created.invoice.publicId}`);
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Signing was cancelled. No invoice was created."
          : err instanceof Error
            ? err.message
            : "Could not generate invoice.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell kicker="Private invoice" title="Generate" subtitle="Payer sees amount only. Your name stays off the invoice.">
      <form onSubmit={onGenerate} className="nq-card flex flex-col gap-5 p-4">
        <label className="font-mono text-[12px] uppercase tracking-[0.14em] text-mute">
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            className="mt-2 min-h-[88px] w-full min-w-0 rounded-[8px] border border-hairline bg-panel px-4 font-display text-[clamp(1.75rem,12vw,2.5rem)] leading-none text-olive outline-none focus:ring-2 focus:ring-olive/40"
          />
        </label>
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-mute">Select asset</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["NIM", "USDT"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setAsset(item)}
                className={`min-h-[52px] rounded-[8px] border font-mono text-[13px] uppercase ${
                  asset === item ? "nq-btn border-olive text-[#1F2348]" : "border-hairline text-ink"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Waiting for signature…" : "Generate invoice"}
        </Button>
      </form>

      {invoices.length > 0 ? (
        <ul className="mt-10 border-t border-hairline">
          {invoices.map((invoice) => (
            <li key={invoice.id}>
              <button
                type="button"
                className="flex min-h-[56px] w-full min-w-0 items-center justify-between gap-3 py-4 text-left"
                onClick={() => router.push(`/invoice/${invoice.publicId}`)}
              >
                <span className="min-w-0 break-all font-display text-[22px] text-olive">{invoice.amountLabel}</span>
                <span className={`shrink-0 ${invoice.status === "open" ? "text-copper" : "text-green"}`}>
                  {invoice.status.toUpperCase()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="mt-4 text-[13px] text-copper">{error}</p> : null}
    </AppShell>
  );
}
