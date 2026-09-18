import type { Metadata, Viewport } from "next";
import { Archivo_Black, IBM_Plex_Mono, Mulish } from "next/font/google";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";

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
  title: "StealthPay",
  description: "Private invoices. Not on-chain anonymity.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
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
