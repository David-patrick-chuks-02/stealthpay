import { encodeFunctionData } from "viem";
import {
  POLYGON_CHAIN_ID,
  POLYGON_CHAIN_ID_HEX,
  USDT_POLYGON,
} from "@/lib/money";

const transferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

type EthereumProvider = {
  request(args: { method: string; params?: unknown }): Promise<unknown>;
};

export function getEthereum(): EthereumProvider {
  const provider = window.ethereum;
  if (!provider) {
    throw new Error("Open StealthPay inside Nimiq Pay to use USDT.");
  }
  return provider;
}

export async function requestEthAccount(): Promise<string> {
  const provider = getEthereum();
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts[0]) throw new Error("No Ethereum account returned.");
  return accounts[0];
}

export async function switchToPolygon(): Promise<void> {
  const provider = getEthereum();
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_CHAIN_ID_HEX }],
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? Number(error.code) : 0;
    if (code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: POLYGON_CHAIN_ID_HEX,
          chainName: "Polygon",
          nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
          rpcUrls: ["https://polygon-rpc.com"],
          blockExplorerUrls: ["https://polygonscan.com"],
        },
      ],
    });
  }
}

export async function sendUsdt(from: string, to: string, amountMinor: string): Promise<string> {
  await switchToPolygon();
  const provider = getEthereum();
  const data = encodeFunctionData({
    abi: transferAbi,
    functionName: "transfer",
    args: [to as `0x${string}`, BigInt(amountMinor)],
  });
  const hash = (await provider.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: USDT_POLYGON,
        data,
        chainId: POLYGON_CHAIN_ID_HEX,
      },
    ],
  })) as string;
  return hash;
}

export { POLYGON_CHAIN_ID };
