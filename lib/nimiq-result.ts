import type { ErrorResponse } from "@nimiq/mini-app-sdk";

export function unwrapNimiq<T>(result: T | ErrorResponse, fallback: string): T {
  if (result && typeof result === "object" && "error" in result) {
    throw new Error(result.error.message || fallback);
  }
  return result;
}
