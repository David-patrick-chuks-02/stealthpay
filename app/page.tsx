import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { HexMark } from "@/components/HexMark";

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] overflow-x-clip bg-crt">
      <section className="corner-frame mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-center px-5 py-16">
        <div className="mb-8 min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-olive text-[#1F2348]">
              <HexMark className="h-5 w-5" />
            </span>
            <span className="font-sans text-[13px] font-bold uppercase tracking-[0.16em]">StealthPay</span>
          </div>
          <p className="mt-4 font-mono text-[11px] tracking-[0.12em] text-olive">[ VAULT // READ-ONLY KEYS ]</p>
        </div>
        <h1 className="mt-6 text-balance font-display text-[clamp(2rem,11vw,2.85rem)] uppercase leading-[1.05] tracking-tight text-ink">
          Invoices without a public name.
        </h1>
        <Link
          href="/invoice"
          className="nq-btn mt-10 inline-flex min-h-[52px] w-full max-w-full items-center justify-center gap-3 rounded-[8px] px-5 font-mono text-[14px] font-bold uppercase tracking-[0.08em] text-[#1F2348] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:translate-y-px"
        >
          Generate invoice
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F2348]/10">
            <ArrowRight size={16} weight="bold" />
          </span>
        </Link>
      </section>
      <section className="mx-auto grid w-full max-w-[430px] grid-cols-1 border-t border-hairline">
        <article className="border-b border-hairline p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-olive">Amount only</p>
          <p className="mt-4 font-display text-[clamp(1.75rem,8vw,2.25rem)] text-olive">500 NIM</p>
        </article>
        <article className="border-b border-hairline p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-olive">Viewing key</p>
          <p className="mt-4 text-[14px] text-mute">Read-only ledger for accountants. No send.</p>
        </article>
        <article className="p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-olive">Honest limit</p>
          <p className="mt-4 text-[14px] text-mute">Private invoices. Not on-chain anonymity.</p>
        </article>
      </section>
    </main>
  );
}
