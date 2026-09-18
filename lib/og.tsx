import { getInvoicePreview } from "@/lib/invoice-preview";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const CRT = "#1F2348";
const GOLD = "#E9B213";
const INK = "#FFFFFF";
const MUTE = "rgba(255,255,255,0.72)";

type OgCard = {
  kicker?: string;
  title: string;
  detail?: string;
  amount?: string;
  pill?: string;
};

let fontCache: Promise<{ archivo: Buffer; plex: Buffer }> | null = null;

function loadFonts() {
  if (!fontCache) {
    fontCache = Promise.all([
      readFile(join(process.cwd(), "lib/og-fonts/ArchivoBlack-Regular.ttf")),
      readFile(join(process.cwd(), "lib/og-fonts/IBMPlexMono-Bold.ttf")),
    ]).then(([archivo, plex]) => ({ archivo, plex }));
  }
  return fontCache;
}

function Words({
  text,
  gap = 10,
}: {
  text: string;
  gap?: number;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} style={{ marginRight: index === words.length - 1 ? 0 : gap }}>
          {word}
        </span>
      ))}
    </div>
  );
}

function HexMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill={GOLD} />
      <polygon fill={CRT} points="16,3.2 27.6,9.9 27.6,22.1 16,28.8 4.4,22.1 4.4,9.9" />
    </svg>
  );
}

export async function renderStealthOg({
  kicker = "[ VAULT // READ-ONLY KEYS ]",
  title,
  detail,
  amount,
  pill,
}: OgCard) {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CRT,
          color: INK,
          padding: "64px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            right: 36,
            bottom: 36,
            border: `2px solid ${GOLD}`,
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <HexMark />
            <div
              style={{
                marginLeft: 16,
                fontSize: 26,
                letterSpacing: 3,
                fontFamily: "IBM Plex Mono",
                textTransform: "uppercase",
              }}
            >
              StealthPay
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 1,
              color: GOLD,
              fontFamily: "IBM Plex Mono",
              textTransform: "uppercase",
            }}
          >
            <Words text={kicker} gap={8} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 36 ? 54 : 68,
              lineHeight: 1.08,
              fontFamily: "Archivo Black",
              textTransform: "uppercase",
            }}
          >
            <Words text={title} gap={16} />
          </div>
          {detail ? (
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 28,
                color: MUTE,
                lineHeight: 1.35,
                fontFamily: "IBM Plex Mono",
              }}
            >
              <Words text={detail} gap={16} />
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {pill ? (
            <div
              style={{
                display: "flex",
                background: GOLD,
                color: CRT,
                fontSize: 20,
                fontFamily: "IBM Plex Mono",
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "16px 28px",
                borderRadius: 8,
              }}
            >
              <Words text={pill} gap={8} />
            </div>
          ) : (
            <div />
          )}
          {amount ? (
            <div
              style={{
                display: "flex",
                fontSize: 44,
                color: GOLD,
                fontFamily: "Archivo Black",
              }}
            >
              <Words text={amount} gap={22} />
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Archivo Black", data: fonts.archivo, weight: 400, style: "normal" },
        { name: "IBM Plex Mono", data: fonts.plex, weight: 700, style: "normal" },
      ],
    },
  );
}

export async function renderInvoiceOg(publicId: string) {
  const invoice = await getInvoicePreview(publicId);
  if (!invoice) {
    return renderStealthOg({
      title: "StealthPay invoice",
      detail: "Wallet stays off this page.",
    });
  }
  return renderStealthOg({
    kicker: invoice.status === "settled" ? "SETTLED" : "OPEN INVOICE",
    title: invoice.partyName || "StealthPay invoice",
    detail: invoice.serviceRendered || "Wallet stays off this page.",
    amount: invoice.amountLabel,
    pill: "Wallet stays off this page",
  });
}
