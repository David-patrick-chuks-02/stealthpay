"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileDashed, LockKey, Wallet } from "@phosphor-icons/react";

const ITEMS = [
  { href: "/invoice", label: "Invoice", icon: FileDashed },
  { href: "/pay", label: "Pay", icon: Wallet },
  { href: "/audit", label: "Audit", icon: LockKey },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 w-full border-t border-hairline bg-[#151833]/95 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid w-full grid-cols-3 px-2 py-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[10px] font-mono text-[11px] uppercase tracking-[0.12em] ${
                  active ? "bg-[rgba(233,178,19,0.12)] text-olive" : "text-mute"
                }`}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
