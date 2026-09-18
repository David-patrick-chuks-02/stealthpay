export const PARTY_TYPES = ["individual", "organization"] as const;

export type PartyType = (typeof PARTY_TYPES)[number];

export function isPartyType(value: string): value is PartyType {
  return (PARTY_TYPES as readonly string[]).includes(value);
}

export function partyTypeLabel(type: PartyType): string {
  return type === "organization" ? "Organization" : "Individual";
}

export function parsePartyName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) {
    throw new Error("Enter a name or organization (2–80 characters).");
  }
  return name;
}

export function parseServiceRendered(raw: string): string {
  const service = raw.trim().replace(/\s+/g, " ");
  if (service.length < 3 || service.length > 160) {
    throw new Error("Describe the service rendered (3–160 characters).");
  }
  return service;
}
