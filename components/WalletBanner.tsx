"use client";

import { useWallet } from "@/components/WalletProvider";
import { useEffect, useState } from "react";

export function WalletBanner() {
  const wallet = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const frame = "border-b border-hairline bg-panel px-5 py-3 font-mono text-[11px] leading-5";

  if (!mounted || wallet.isConnecting) {
    return <p className={`${frame} text-mute`}>SCANNING PROVIDER…</p>;
  }
  if (!wallet.isReady) {
    return (
      <div className={`${frame} text-ink`}>
        Open this app inside Nimiq Pay to send. Invoices and audit still work here.
        {wallet.errorMessage ? <p className="mt-1 text-mute">{wallet.errorMessage}</p> : null}
      </div>
    );
  }
  return (
    <p className={`${frame} break-all text-mute`}>
      {wallet.nimAddress ? `${wallet.nimAddress.slice(0, 8)}…` : "NIM READY"}
      {wallet.consensus === false ? " · NO CONSENSUS" : ""}
      {"  //  "}
      {wallet.ethAddress ? `${wallet.ethAddress.slice(0, 8)}…` : wallet.hasEthereum ? "USDT AVAILABLE" : "NO EVM"}
    </p>
  );
}
