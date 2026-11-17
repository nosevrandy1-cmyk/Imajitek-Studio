# Imajitek Studio (PT Imaji Teknologi Bersama)

Platform web resmi **Imajitek Studio** (**PT Imaji Teknologi Bersama**) untuk layanan pembuatan website & aplikasi web, desain antarmuka & Design System Figma, serta pengadaan lisensi software kreatif & AI resmi dengan pembayaran Rupiah.

## Arsitektur & Teknologi

- **Framework:** [Astro 5](https://astro.build/) dengan Islands Architecture (zero-JS HTML secara default, React 19 hanya terhidrasi pada komponen interaktif).
- **Language:** TypeScript strict mode (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, nol `any`).
- **Styling:** Modular Vanilla CSS design system (`src/styles/tokens.css`, `base.css`, `components.css`) dengan font lokal self-hosted (`@fontsource/plus-jakarta-sans` & `@fontsource/jetbrains-mono`).
- **Validation & Domain Layer:** Zod schema terpadu (`src/domain/catalog.ts`, `src/domain/inquiry.ts`) antara frontend React Islands dan Cloudflare Edge API.
- **Edge Backend:** Cloudflare Pages Functions (`functions/api/inquiry.ts` & `functions/api/health.ts`) dengan proteksi honeypot, batas payload, dukungan opsional Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`), dan webhook notification (`INQUIRY_WEBHOOK_URL`).
- **Security Headers:** Dikonfigurasi via `public/_headers` (CSP ketat, HSTS, `X-Frame-Options: DENY`, immutable caching `/_astro/*`).
- **Quality & CI:** Vitest, ESLint (`jsx-a11y` + `eslint-plugin-astro`), Prettier, `astro check`, dan GitHub Actions (`.github/workflows/ci.yml`).

## Struktur Folder

```text
├── .github/workflows/ci.yml    # Pipeline CI (typecheck, lint, format, test, build)
├── functions/api/              # Cloudflare Pages Functions (/api/health, /api/inquiry)
├── public/                     # Aset statis, robots.txt, _headers keamanan Cloudflare
├── src/
│   ├── components/             # Layout primitives & IconSprite SVG
│   │   └── islands/            # React interactive islands (HeroLauncher, CatalogBuilder, InquiryForm, dll.)
│   ├── domain/                 # Schema Zod & sumber kebenaran katalog & inquiry
│   ├── layouts/                # BaseLayout SEO + self-hosted fonts
│   ├── lib/                    # Fungsi murni quote state & event bus antar-island
│   ├── pages/                  # Rute multi-halaman (/, /web-desain, /software, /hubungi)
│   └── styles/                 # Design tokens, base layout & component stylesheets
├── tests/                      # Unit & API handler tests (Vitest)
├── astro.config.mjs
└── wrangler.toml
```

## Perintah Pengembangan

```bash
pnpm install        # Pasang dependensi
pnpm dev            # Jalankan server lokal Astro
pnpm verify         # Jalankan typecheck + lint + format:check + vitest + astro build
```

## Deploy ke Cloudflare Pages

1. Hubungkan repositori GitHub ke **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Konfigurasi Build Settings:
   - **Framework preset:** `Astro`
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
3. **Konfigurasi Email Form (`imajistudio.id@gmail.com`) & Anti-Spam Turnstile:**
   - Tambahkan **Environment Variables / Secrets** di **Cloudflare Pages Dashboard → Settings → Environment variables**:
     - `RESEND_API_KEY` — API key dari [Resend](https://resend.com/) agar setiap pengajuan form langsung masuk ke `imajistudio.id@gmail.com`.
     - `TURNSTILE_SECRET_KEY` — Secret key **Cloudflare Turnstile** untuk verifikasi CAPTCHA di sisi edge.
     - `PUBLIC_TURNSTILE_SITE_KEY` — Site key **Cloudflare Turnstile** untuk widget CAPTCHA pada formulir (bila belum diisi, formulir otomatis memakai tantangan verifikasi anti-spam bawaan + honeypot + guard kecepatan bot).
     - `INQUIRY_TO_EMAIL` _(opsional)_ — Default mengarah ke `imajistudio.id@gmail.com`.
     - `INQUIRY_FROM_EMAIL` _(opsional)_ — Alamat pengirim domain terverifikasi (default: `Imajitek Studio <onboarding@resend.dev>`).
     - `INQUIRY_WEBHOOK_URL` _(opsional)_ — Webhook Slack / Discord / CRM tambahan.
