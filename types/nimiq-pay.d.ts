export {};

interface RequestArguments {
  method: string;
  params?: unknown;
}

interface EthereumProvider {
  request(args: RequestArguments): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
