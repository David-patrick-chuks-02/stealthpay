export function jsonError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function requireNimAddress(request: Request): string {
  const header = request.headers.get("x-nimiq-address");
  const query = new URL(request.url).searchParams.get("owner");
  const value = header?.trim() || query?.trim();
  if (!value) throw new Error("Connect a Nimiq address first.");
  return value;
}
