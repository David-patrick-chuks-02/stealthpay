"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { fetchPublicInvoice, settleInvoice } from "@/lib/client-api";
import { nimLuna } from "@/lib/money";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const params = useParams<{ publicId: string }>();
  const wallet = useWallet();
  const [invoice, setInvoice] = useState<Awaited<ReturnType<typeof fetchPublicInvoice>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!params.publicId) return;
    fetchPublicInvoice(params.publicId)
      .then(setInvoice)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Invoice not found."));
  }, [params.publicId]);

  async function onPay() {
    if (!invoice) return;
    setBusy(true);
    setError(null);
    try {
      let txHash = "";
      if (invoice.asset === "NIM") {
        if (!wallet.isReady) {
          setError("Open StealthPay inside Nimiq Pay to send NIM.");
          return;
        }
        await wallet.connectNim();
        txHash = await wallet.sendNim({
          recipient: invoice.recipientNim,
          value: nimLuna(invoice.amountMinor),
          data: invoice.memo,
        });
      } else {
        if (!invoice.recipientEth) {
          setError("This invoice has no Ethereum destination.");
          return;
        }
        txHash = await wallet.sendUsdt(invoice.recipientEth, invoice.amountMinor);
      }
      await settleInvoice(invoice.publicId, txHash, invoice.asset);
      const next = await fetchPublicInvoice(invoice.publicId);
      setInvoice(next);
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Payment was cancelled. Nothing was sent."
          : err instanceof Error
            ? err.message
            : "Payment failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell kicker="Pay invoice" title={invoice?.amountLabel ?? "…"} subtitle="One confirmation. Amount only.">
      {invoice ? (
        <>
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-mute">
            Invoice {invoice.publicId} · {invoice.asset}
          </p>
          <p className="mt-4 font-mono text-[13px] text-mute">{invoice.memo}</p>
          <p className={`mt-2 font-mono text-[12px] ${invoice.status === "settled" ? "text-green" : "text-copper"}`}>
            {invoice.status === "settled" ? "SETTLED" : "OPEN"}
          </p>
          {invoice.status !== "settled" ? (
            <div className="mt-8">
              <Button type="button" onClick={onPay} disabled={busy}>
                {busy ? "Waiting for wallet…" : "Pay in wallet"}
              </Button>
              <p className="mt-3 text-[12px] leading-5 text-mute">
                Funds go to the recipient wallet. This is a private invoice, not a mixer.
              </p>
            </div>
          ) : (
            <p className="mt-8 text-[14px] text-green">Funds are in the recipient wallet. No hot wallet withdraw.</p>
          )}
        </>
      ) : null}
      {error ? <p className="mt-4 text-[13px] text-copper">{error}</p> : null}
    </AppShell>
  );
}
