"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { createInvoice, listInvoices } from "@/lib/client-api";
import type { PartyType } from "@/lib/invoice-fields";
import type { InvoiceView } from "@/lib/stealth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const fieldClass =
  "mt-2 w-full min-w-0 rounded-[8px] border border-hairline bg-panel px-4 py-3 font-mono text-[15px] text-ink outline-none focus:ring-2 focus:ring-olive/40";

export default function InvoicePage() {
  const wallet = useWallet();
  const router = useRouter();
  const [partyType, setPartyType] = useState<PartyType>("individual");
  const [partyName, setPartyName] = useState("");
  const [serviceRendered, setServiceRendered] = useState("");
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
        partyType,
        partyName,
        serviceRendered,
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
    <AppShell
      kicker="Private invoice"
      title="Generate"
      subtitle="Name or organization, service rendered, and amount. Wallet stays off the invoice."
    >
      <form onSubmit={onGenerate} className="nq-card flex flex-col gap-5 p-4">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-mute">From</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([
              ["individual", "Individual"],
              ["organization", "Organization"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPartyType(value)}
                className={`min-h-[52px] rounded-[8px] border font-mono text-[13px] uppercase ${
                  partyType === value ? "nq-btn border-olive text-[#1F2348]" : "border-hairline text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="font-mono text-[12px] uppercase tracking-[0.14em] text-mute">
          {partyType === "organization" ? "Organization name" : "Individual name"}
          <input
            value={partyName}
            onChange={(event) => setPartyName(event.target.value)}
            autoComplete="organization"
            maxLength={80}
            required
            placeholder={partyType === "organization" ? "Northwind Studio" : "Alex Rivera"}
            className={fieldClass}
          />
        </label>
        <label className="font-mono text-[12px] uppercase tracking-[0.14em] text-mute">
          Service rendered
          <textarea
            value={serviceRendered}
            onChange={(event) => setServiceRendered(event.target.value)}
            required
            maxLength={160}
            rows={3}
            placeholder="September product design retainer"
            className={`${fieldClass} min-h-[88px] resize-none leading-6`}
          />
        </label>
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
                className="flex min-h-[64px] w-full min-w-0 items-start justify-between gap-3 py-4 text-left"
                onClick={() => router.push(`/invoice/${invoice.publicId}`)}
              >
                <span className="min-w-0">
                  <span className="block break-words text-[14px] leading-5 text-ink">
                    {invoice.serviceRendered || invoice.partyName || invoice.publicId}
                  </span>
                  <span className="mt-1 block break-all font-display text-[20px] text-olive">
                    {invoice.amountLabel}
                  </span>
                </span>
                <span className={`shrink-0 pt-1 ${invoice.status === "open" ? "text-copper" : "text-green"}`}>
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
