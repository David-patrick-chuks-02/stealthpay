"use client";

import type { NimiqProvider } from "@nimiq/mini-app-sdk";
import { requestEthAccount, sendUsdt } from "@/lib/ethereum";
import { unwrapNimiq } from "@/lib/nimiq-result";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NimiqClient = NimiqProvider;

type WalletState = {
  isConnecting: boolean;
  isReady: boolean;
  hasEthereum: boolean;
  errorMessage: string | null;
  nimAddress: string | null;
  ethAddress: string | null;
  consensus: boolean | null;
  connectNim: () => Promise<string | null>;
  connectEth: () => Promise<string | null>;
  signMessage: (message: string) => Promise<{ publicKey: string; signature: string }>;
  sendNim: (input: { recipient: string; value: number; data: string }) => Promise<string>;
  sendUsdt: (to: string, amountMinor: string) => Promise<string>;
};

const WalletContext = createContext<WalletState | null>(null);

let nimiqPromise: Promise<NimiqClient> | null = null;

async function getClient(): Promise<NimiqClient> {
  if (!nimiqPromise) {
    nimiqPromise = (async () => {
      const { init } = await import("@nimiq/mini-app-sdk");
      return await new Promise<NimiqClient>((resolve, reject) => {
        const timer = window.setTimeout(() => {
          reject(new Error("Nimiq Pay is not available in this browser."));
        }, 8000);
        init({ timeout: 8_000 })
          .then((client) => {
            window.clearTimeout(timer);
            resolve(client);
          })
          .catch((error) => {
            window.clearTimeout(timer);
            reject(error);
          });
      });
    })().catch((error) => {
      nimiqPromise = null;
      throw error;
    });
  }
  return nimiqPromise;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasEthereum, setHasEthereum] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nimAddress, setNimAddress] = useState<string | null>(null);
  const [ethAddress, setEthAddress] = useState<string | null>(null);
  const [consensus, setConsensus] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHasEthereum(Boolean(window.ethereum));
    (async () => {
      try {
        const client = await getClient();
        const established = await client.isConsensusEstablished();
        if (!cancelled) {
          setIsReady(true);
          setConsensus(established);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setIsReady(false);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Nimiq Pay is not available in this browser.",
          );
        }
      } finally {
        if (!cancelled) setIsConnecting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connectNim = useCallback(async () => {
    const client = await getClient();
    const accounts = unwrapNimiq(await client.listAccounts(), "Could not list accounts.");
    const address = accounts[0] ?? null;
    setNimAddress(address);
    return address;
  }, []);

  const connectEth = useCallback(async () => {
    const address = await requestEthAccount();
    setEthAddress(address);
    return address;
  }, []);

  const signMessage = useCallback(async (message: string) => {
    const client = await getClient();
    return unwrapNimiq(await client.sign(message), "Could not sign message.");
  }, []);

  const sendNim = useCallback(async (input: { recipient: string; value: number; data: string }) => {
    const client = await getClient();
    return unwrapNimiq(
      await client.sendBasicTransactionWithData({
        recipient: input.recipient,
        value: input.value,
        data: input.data,
      }),
      "Could not send NIM.",
    );
  }, []);

  const sendUsdtTx = useCallback(async (to: string, amountMinor: string) => {
    const from = ethAddress ?? (await requestEthAccount());
    setEthAddress(from);
    return sendUsdt(from, to, amountMinor);
  }, [ethAddress]);

  const value = useMemo<WalletState>(
    () => ({
      isConnecting,
      isReady,
      hasEthereum,
      errorMessage,
      nimAddress,
      ethAddress,
      consensus,
      connectNim,
      connectEth,
      signMessage,
      sendNim,
      sendUsdt: sendUsdtTx,
    }),
    [
      connectEth,
      connectNim,
      errorMessage,
      ethAddress,
      hasEthereum,
      isConnecting,
      isReady,
      nimAddress,
      consensus,
      sendNim,
      sendUsdtTx,
      signMessage,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}

export function isUserRejection(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("reject") ||
    message.includes("denied") ||
    message.includes("cancel") ||
    message.includes("user abort")
  );
}
