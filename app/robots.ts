import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://stealthpay.up.railway.app/sitemap.xml",
    host: "https://stealthpay.up.railway.app",
  };
}
