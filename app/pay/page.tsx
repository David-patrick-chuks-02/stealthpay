"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function PayIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function onOpen(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    router.push(`/pay/${code.trim().toUpperCase()}`);
  }

  return (
    <AppShell kicker="Pay" title="Invoice" subtitle="Paste an invoice id to see name, service, and amount.">
      <form onSubmit={onOpen} className="nq-card flex flex-col gap-3 p-4">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="8F3A9C2B"
          className="min-h-[52px] rounded-[8px] border border-hairline bg-panel px-3 uppercase outline-none focus:ring-2 focus:ring-olive/40"
        />
        <Button type="submit">Open invoice</Button>
      </form>
    </AppShell>
  );
}
