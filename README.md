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
