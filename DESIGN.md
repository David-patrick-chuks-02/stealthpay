# Design System: StealthPay

Reading this as: mobile-first Nimiq Pay mini app for contractors issuing private invoices, with official Nimiq dark identity (Nimiq-blue radial, gold hex, Mulish + Archivo Black + IBM Plex Mono).

Dials: VARIANCE 4 / MOTION 3 / DENSITY 6.

## 1. Visual Theme & Atmosphere

A classified invoice vault on Nimiq blue. Gold hex lockup, gold radial CTAs, hairline frames, corner ticks. Generate captures individual or organization name, service rendered, and amount. Wallet address stays off the invoice page. Premium and readable — not neon cyberpunk, not a mixer. Copy must say “private invoices”, never “on-chain anonymity”.

## 2. Color Palette & Roles

Official tokens from the [Nimiq Design Kit](https://nimiq.dev/raw/design-kit/index.md) / `nimiq-style` theme.css:

- **Nimiq Blue** (#1F2348) + radial `#260133 → #1F2348` — Page canvas
- **Nimiq Blue Darkened** (#151833) — Panels, fields, banners
- **Off-White Ink** (#FFFFFF) — Primary text
- **Mute** (rgba(255,255,255,0.58)) — Metadata
- **Hairline** (rgba(255,255,255,0.12)) — Borders and frames
- **Nimiq Gold** (#E9B213) + radial `#EC991C → #E9B213` — Primary fill, hex plate, amounts, selected nav
- **Nimiq Green** (#21BCA5) — SETTLED
- **Nimiq Orange** (#FC8702) — OPEN status, caution
- **Light Blue on Dark** (#0CA6FE) — Optional secondary signal only; do not compete with gold CTAs

Never use purple, neon green glow, or pure #000000 as a large fill.

## 3. Typography Rules

- **Display:** Archivo Black, uppercase structural headers (GENERATE, AUDIT, VAULT)
- **UI labels:** IBM Plex Mono, 14–16px, generous tracking
- **Brand wordmark:** Mulish
- **Numbers:** IBM Plex Mono / Archivo, oversized amounts in gold
- **Banned:** Inter, generic serifs, emojis, gradient text

## 4. Component Stylings

- **Buttons:** 8px radius, min-height 52px. Primary gold radial with Nimiq-blue text. Secondary gold outline. Active press `translateY(1px)`.
- **Lockup:** Nimiq-blue hex on a gold 8px plate.
- **Segmented control:** Two rectangles, selected = gold radial.
- **QR well:** White plate, 2px gold border, high-contrast QR.
- **Ledger rows:** Hairline separators, gold amount, status in green or orange.
- **Loaders:** Skeleton bars in panel color. No circular spinners.
- **Empty states:** Bracketed mono copy, e.g. `[ NO INVOICES ]`.

## 5. Layout Principles

Single column, 18px gutters, max-width 430px. Technical corner frames on intro hero only. Product chrome is a top identity bar plus bottom nav: Invoice / Pay / Audit. `min-h-[100dvh]`. No overlapping layers. No floating glass nav.

## 6. Motion & Interaction

Sparse. 200ms transform/opacity. No scanline animation that harms readability. No GSAP pinning. Hardware-accelerated transforms only.

## 7. Anti-Patterns (Banned)

No emojis, no Inter, no neon outer glows, no purple, no glassmorphism, no fake zk copy, no custodial “withdraw from pool” UX, no Lucide icons (Phosphor only), no 3-column marketing grids inside the WebView, no “Unleash privacy”.
