"use client";

import { BottomNav } from "@/components/BottomNav";
import { HexMark } from "@/components/HexMark";
import { WalletBanner } from "@/components/WalletBanner";
import type { ReactNode } from "react";

export function AppShell({
  children,
  kicker,
  title,
  subtitle,
}: {
  children: ReactNode;
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-x-clip bg-crt">
      <WalletBanner />
      <header className="fade-up px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2 text-olive">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-olive text-[#1F2348]">
            <HexMark className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-olive">StealthPay</p>
            {kicker ? (
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-mute">{kicker}</p>
            ) : null}
          </div>
        </div>
        <h1 className="mt-4 break-words text-balance font-display text-[clamp(1.75rem,9vw,2.25rem)] uppercase leading-[1.05] tracking-tight text-ink">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 max-w-[34ch] font-mono text-[13px] leading-5 text-mute">{subtitle}</p> : null}
      </header>
      <main className="fade-up min-w-0 flex-1 px-5 pb-8 pt-4" style={{ animationDelay: "80ms" }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
