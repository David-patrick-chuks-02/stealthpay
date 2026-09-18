"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { fetchPublicInvoice, fetchQr } from "@/lib/client-api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ShareInvoicePage() {
  const params = useParams<{ publicId: string }>();
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const publicId = params.publicId;
    if (!publicId) return;
    (async () => {
      try {
        const invoice = await fetchPublicInvoice(publicId);
        setLabel(invoice.amountLabel);
        setStatus(invoice.status);
        const shareUrl = `${window.location.origin}/pay/${publicId}`;
        setQr(await fetchQr(shareUrl));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load invoice.");
      }
    })();
  }, [params.publicId]);

  async function copyLink() {
    const shareUrl = `${window.location.origin}/pay/${params.publicId}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  async function share() {
    const shareUrl = `${window.location.origin}/pay/${params.publicId}`;
    if (navigator.share) {
      await navigator.share({ title: "StealthPay invoice", url: shareUrl });
      return;
    }
    await copyLink();
  }

  return (
    <AppShell kicker="Share / QR" title={params.publicId} subtitle="Amount only. Private invoice. Not on-chain anonymity.">
      {qr ? (
        <div className="rounded-[8px] border-2 border-olive bg-white p-4">
          <img src={qr} alt="Invoice QR code" className="mx-auto h-auto w-full max-w-[280px]" />
        </div>
      ) : (
        <div className="h-[280px] rounded-[8px] border border-hairline bg-panel" />
      )}
      <p className="mt-6 break-all font-display text-[clamp(2rem,12vw,3rem)] leading-none text-olive">{label || "—"}</p>
      <p className={`mt-2 font-mono text-[12px] uppercase tracking-[0.14em] ${status === "settled" ? "text-green" : "text-copper"}`}>{status}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Button type="button" variant="secondary" onClick={copyLink}>
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button type="button" onClick={share}>
          Share
        </Button>
      </div>
      {error ? <p className="mt-4 text-[13px] text-copper">{error}</p> : null}
    </AppShell>
  );
}
