"use client";

import { AppShell } from "@/components/AppShell";
import { fetchAudit } from "@/lib/client-api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuditViewPage() {
  const params = useParams<{ token: string }>();
  const [rows, setRows] = useState<
    Array<{
      publicId: string;
      amountLabel: string;
      partyName: string;
      serviceRendered: string;
      status: string;
      createdAt: string;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.token) return;
    fetchAudit(params.token)
      .then((data) => setRows(data.invoices))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Invalid viewing key."));
  }, [params.token]);

  return (
    <AppShell title="Audit" subtitle="Read-only viewing key. Ledger only.">
      {rows.length === 0 && !error ? <p className="text-mute">[ NO INVOICES ]</p> : null}
      <ul>
        {rows.map((row) => (
          <li key={row.publicId} className="min-w-0 border-b border-hairline py-4">
            <p className="break-words text-[14px] leading-5 text-ink">{row.serviceRendered || row.publicId}</p>
            <p className="mt-1 break-words font-mono text-[12px] text-mute">{row.partyName || "—"}</p>
            <div className="mt-2 flex min-h-[32px] items-baseline justify-between gap-3">
              <p className="break-all font-display text-[24px] text-olive">{row.amountLabel}</p>
              <p className={`text-[11px] uppercase tracking-[0.12em] ${row.status === "open" ? "text-copper" : "text-green"}`}>
                {row.status}
              </p>
            </div>
            <p className="mt-1 font-mono text-[12px] text-mute">{row.createdAt.slice(0, 16).replace("T", " ")}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-[12px] text-mute">For accountants. No send.</p>
      {error ? <p className="mt-4 text-[13px] text-copper">{error}</p> : null}
    </AppShell>
  );
}
