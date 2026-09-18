import { createHash } from "crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function shortIdFromCommitment(commitment: string): string {
  return commitment.slice(0, 4).toUpperCase();
}
