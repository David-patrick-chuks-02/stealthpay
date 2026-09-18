import type { Metadata, Viewport } from "next";
import { Archivo_Black, IBM_Plex_Mono, Mulish } from "next/font/google";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";

const siteUrl = "https://stealthpay.up.railway.app";

const archivo = Archivo_Black({
  weight: "400",
  variable: "--font-archivo",
  subsets: ["latin"],
});

const ibm = IBM_Plex_Mono({
  weight: ["400", "500"],
  variable: "--font-ibm",
  subsets: ["latin"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StealthPay — Invoices without a public name",
    template: "%s · StealthPay",
  },
  description:
    "Private invoices for Nimiq Pay. Name or organization, service rendered, and amount. Settle in NIM or Polygon USDT. Not a mixer, not on-chain anonymity.",
  applicationName: "StealthPay",
  keywords: [
    "Nimiq",
    "StealthPay",
    "private invoice",
    "NIM",
    "USDT",
    "mini app",
    "Nimiq Pay",
    "viewing key",
  ],
  authors: [{ name: "StealthPay" }],
  creator: "StealthPay",
  category: "finance",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "StealthPay",
    title: "StealthPay — Invoices without a public name",
    description:
      "Private invoices in Nimiq Pay. Name, service, and amount — wallet stays off the invoice. NIM or USDT checkout, read-only viewing keys, no mixer.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Invoices without a public name.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StealthPay — Invoices without a public name",
    description:
      "Private invoices in Nimiq Pay. Name, service, and amount — wallet stays off the invoice. NIM or USDT checkout, read-only viewing keys, no mixer.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    title: "StealthPay",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1F2348",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${ibm.variable} ${mulish.variable} h-full antialiased`}>
      <body className="min-h-[100dvh] bg-crt font-mono text-ink">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
