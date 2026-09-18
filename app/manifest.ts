import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StealthPay",
    short_name: "StealthPay",
    description: "Private invoices. Not on-chain anonymity.",
    start_url: "/",
    display: "standalone",
    background_color: "#1F2348",
    theme_color: "#1F2348",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
