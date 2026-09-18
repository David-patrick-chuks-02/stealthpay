import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeFunctionData } from "viem";
import { POLYGON_CHAIN_ID_HEX, USDT_POLYGON } from "@/lib/money";
import { getEthereum, requestEthAccount, sendUsdt, switchToPolygon } from "@/lib/ethereum";

describe("Polygon USDT checkout", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses USDT outside Nimiq Pay", () => {
    vi.stubGlobal("window", {});
    expect(() => getEthereum()).toThrow(/inside Nimiq Pay/);
  });

  it("requests an account and switches to Polygon, adding the chain on 4902", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_requestAccounts") return ["0xabc"];
      if (method === "wallet_switchEthereumChain") {
        const error = Object.assign(new Error("missing"), { code: 4902 });
        throw error;
      }
      if (method === "wallet_addEthereumChain") return null;
      throw new Error(method);
    });
    vi.stubGlobal("window", { ethereum: { request } });

    await expect(requestEthAccount()).resolves.toBe("0xabc");
    await switchToPolygon();
    expect(request).toHaveBeenCalledWith({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_CHAIN_ID_HEX }],
    });
    expect(request).toHaveBeenCalledWith({
      method: "wallet_addEthereumChain",
      params: [
        expect.objectContaining({
          chainId: POLYGON_CHAIN_ID_HEX,
          chainName: "Polygon",
        }),
      ],
    });
  });

  it("encodes an ERC-20 transfer to the Polygon USDT contract", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "wallet_switchEthereumChain") return null;
      if (method === "eth_sendTransaction") return "0xhash";
      throw new Error(method);
    });
    vi.stubGlobal("window", { ethereum: { request } });

    const hash = await sendUsdt("0xfrom", "0x1111111111111111111111111111111111111111", "50000000");
    expect(hash).toBe("0xhash");
    const tx = request.mock.calls.find(([args]) => args.method === "eth_sendTransaction")?.[0];
    expect(tx.params[0].to).toBe(USDT_POLYGON);
    expect(tx.params[0].chainId).toBe(POLYGON_CHAIN_ID_HEX);
    expect(tx.params[0].data).toBe(
      encodeFunctionData({
        abi: [
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
        ],
        functionName: "transfer",
        args: ["0x1111111111111111111111111111111111111111", 50_000_000n],
      }),
    );
  });
});
