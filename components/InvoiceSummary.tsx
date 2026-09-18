import { partyTypeLabel, type PartyType } from "@/lib/invoice-fields";

export function InvoiceSummary({
  partyType,
  partyName,
  serviceRendered,
  amountLabel,
}: {
  partyType: PartyType | string;
  partyName: string;
  serviceRendered: string;
  amountLabel: string;
}) {
  const kind = partyType === "organization" ? "organization" : "individual";
  return (
    <dl className="flex flex-col gap-4">
      <div>
        <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-olive">
          {partyTypeLabel(kind)}
        </dt>
        <dd className="mt-2 break-words text-[16px] leading-6 text-ink">{partyName || "—"}</dd>
      </div>
      <div>
        <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-olive">Service rendered</dt>
        <dd className="mt-2 break-words text-[16px] leading-6 text-ink">{serviceRendered || "—"}</dd>
      </div>
      <div>
        <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-olive">Amount</dt>
        <dd className="mt-2 break-words font-display text-[clamp(1.75rem,10vw,2.5rem)] leading-none text-olive">
          {amountLabel}
        </dd>
      </div>
    </dl>
  );
}
