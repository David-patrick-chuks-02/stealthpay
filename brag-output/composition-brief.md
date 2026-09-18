# Hyperframes Composition Brief: StealthPay

## Objective
Create a short launch-style brag video for StealthPay.

## Output
- Composition directory: `stealthpay/brag-output/composition/`
- Rendered video: `stealthpay/brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: `/Users/mac/Documents/github/mini-app/stealthpay`
- Primary files: `app/page.tsx`, `app/invoice/page.tsx`, `app/invoice/[publicId]/page.tsx`, `app/globals.css`, `README.md`
- Product name: StealthPay
- Tagline / strongest claim: Invoices without a public name.
- Key UI: generate form + public invoice (name/service/amount, no wallet)
- Copy that must appear verbatim:
  - Invoices without a public name.
  - StealthPay
  - [ VAULT // READ-ONLY KEYS ]
  - Northwind Studio
  - September retainer
  - 500 NIM
  - Wallet address stays off this page.
  - Private invoices. Not on-chain anonymity.

## Creative Direction
- Tone preset: cinematic
- Creative direction: honest dark-vault invoice film
- Interpretation: gold on #1F2348, uppercase display, no mixer claims
- Angle: private invoice page, honest limit
- Hook: Invoices without a public name.
- Outro / punchline: Private invoices. Not on-chain anonymity.
- Avoid: shielded pool, zk, mixer, generic “privacy redefined”

## Visual Identity
- Background: #1F2348
- Text: #FFFFFF
- Accent: #E9B213
- Display font: system-ui extra-black uppercase (no named webfont without @font-face)
- Body font: ui-monospace
- Visual references: gold hex on navy, gold 500 NIM, hairline panels

## Storyboard
Use `brag-output/brag-plan.md`.

1. Hook — 3.5s — hex, STEALTHPAY, headline
2. Generate — 5.5s — name, service, 500 NIM
3. Payer page — 6.0s — invoice + wallet-off line
4. Outro — 5.0s — StealthPay + honest limit

## Audio
- Audio role: cinematic support
- Music: happy-beats-business-moves-vol-12-by-ende-dot-app.mp3
- Music treatment: volume 0.30, fade last 0.6s
- Music cue guidance: vol-12; amount ~6.56s, wallet-off ~10.93s, limit ~17.47s
- Audio-reactive treatment: subtle gold glow; skip extraction if helper missing
- SFX: interface/bong_001, casino/card-place-2, impact/impactBell_heavy_000
- Copy files into composition/assets/

## Hyperframes Instructions
Follow hyperframes-core / animation / creative / keyframes / cli. Do not run the hyperframes intent interview.
- 15–25s, readable text, real UI recreation
- `npx hyperframes check` then render `--quality looks --output ../brag.mp4`
- User already asked to generate the video — render without waiting for preview approval
