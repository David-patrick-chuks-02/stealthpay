export function apiRequest(
  url: string,
  init: { method?: string; owner?: string; body?: unknown } = {},
) {
  const headers = new Headers();
  if (init.owner) headers.set("x-nimiq-address", init.owner);
  if (init.body !== undefined) headers.set("content-type", "application/json");
  return new Request(`http://stealthpay.test${url}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

export async function readJson(response: Response) {
  return {
    status: response.status,
    body: (await response.json()) as Record<string, unknown>,
  };
}
