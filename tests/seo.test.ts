import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { invoiceShareMetadata } from "@/lib/invoice-preview";
import { ogContentType, ogSize } from "@/lib/og";

describe("StealthPay SEO", () => {
  it("puts / first and includes invoice, pay, and audit", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls[0]).toBe("https://stealthpay.up.railway.app/");
    expect(urls).toEqual(
      expect.arrayContaining([
        "https://stealthpay.up.railway.app/",
        "https://stealthpay.up.railway.app/invoice",
        "https://stealthpay.up.railway.app/pay",
        "https://stealthpay.up.railway.app/audit",
      ]),
    );
    expect(sitemap()[0]?.priority).toBe(1);
  });

  it("exposes robots, a PWA manifest, and branded icons", () => {
    expect(robots()).toMatchObject({
      sitemap: "https://stealthpay.up.railway.app/sitemap.xml",
      host: "https://stealthpay.up.railway.app",
    });
    const web = manifest();
    expect(web.name).toBe("StealthPay");
    expect(web.start_url).toBe("/");
    expect(web.theme_color).toBe("#1F2348");
    expect(web.icons?.map((icon) => icon.src)).toEqual([
      "/favicon.ico",
      "/icon.png",
      "/apple-icon.png",
    ]);
  });

  it("keeps home metadata pointed at the live origin", () => {
    const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
    const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
    expect(layout).toContain('const siteUrl = "https://stealthpay.up.railway.app"');
    expect(home).toContain('canonical: "/"');
    expect(home).toContain("WebApplication");
    expect(home).toContain("opengraph-image");
    expect(layout).toContain('url: "/opengraph-image"');
    expect(layout).toContain("summary_large_image");
  });

  it("builds invoice share cards without leaking a wallet", () => {
    expect(ogSize).toEqual({ width: 1200, height: 630 });
    expect(ogContentType).toBe("image/png");
    const meta = invoiceShareMetadata(
      {
        publicId: "8F3A9C2B",
        partyType: "organization",
        partyName: "Northwind Studio",
        serviceRendered: "September retainer",
        amountLabel: "500 NIM",
        status: "open",
      },
      "pay",
    );
    expect(meta.title).toBe("500 NIM · Northwind Studio");
    expect(String(meta.description)).toMatch(/September retainer/);
    expect(String(meta.description)).not.toMatch(/NQ\d{2}/);
    expect(meta.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "/pay/8F3A9C2B/opengraph-image",
        type: "image/png",
        width: 1200,
        height: 630,
      }),
    ]);
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      images: ["/pay/8F3A9C2B/opengraph-image"],
    });
  });
});
