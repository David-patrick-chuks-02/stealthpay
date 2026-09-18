"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { issueViewingKey } from "@/lib/client-api";
import { FormEvent, useState } from "react";

export default function AuditPage() {
  const wallet = useWallet();
  const [token, setToken] = useState<string | null>(null);
  const [lookup, setLookup] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onIssue() {
    setBusy(true);
    setError(null);
    try {
      const nim = wallet.nimAddress ?? (await wallet.connectNim());
      if (!nim) {
        setError("Connect Nimiq to issue a viewing key.");
        return;
      }
      const message = `stealthpay:viewing-key:${nim}`;
      const signed = await wallet.signMessage(message);
      const issued = await issueViewingKey(nim, {
        message,
        signature: signed.signature,
        publicKey: signed.publicKey,
      });
      setToken(issued.token);
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Signing was cancelled."
          : err instanceof Error
            ? err.message
            : "Could not issue viewing key.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onOpen(event: FormEvent) {
    event.preventDefault();
    if (!lookup.trim()) return;
    window.location.href = `/audit/view/${encodeURIComponent(lookup.trim())}`;
  }

  return (
    <AppShell kicker="Viewing key" title="Audit" subtitle="Read-only viewing key. For accountants. No send.">
      {token ? (
        <div className="nq-card p-4">
          <p className="break-all font-mono text-[13px]">{token}</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-copper">Shown once</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={async () => {
              await navigator.clipboard.writeText(`${window.location.origin}/audit/view/${token}`);
              setCopied(true);
            }}
          >
            {copied ? "Copied" : "Copy audit link"}
          </Button>
        </div>
      ) : (
        <Button type="button" onClick={onIssue} disabled={busy}>
          {busy ? "Waiting for signature…" : "Issue viewing key"}
        </Button>
      )}

      <form onSubmit={onOpen} className="mt-10 flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Open a viewing key</p>
        <input
          value={lookup}
          onChange={(event) => setLookup(event.target.value)}
          placeholder="sp_view_…"
          className="min-h-[52px] rounded-[8px] border border-hairline bg-panel px-3 outline-none focus:ring-2 focus:ring-olive/40"
        />
        <Button type="submit" variant="secondary">
          Open ledger
        </Button>
      </form>
      {error ? <p className="mt-4 text-[13px] text-copper">{error}</p> : null}
    </AppShell>
  );
}
