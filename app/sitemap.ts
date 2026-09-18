import type { MetadataRoute } from "next";

const siteUrl = "https://stealthpay.up.railway.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/invoice", "/pay", "/audit"];
  return routes.map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
