import { z } from "zod";

export const COMPANY = {
  brandName: "Imajitek Studio",
  legalName: "PT Imaji Teknologi Bersama",
  email: "imajistudio.id@gmail.com",
  whatsappDisplay: "+62 813-3887-6110",
  whatsappE164: "6281338876110",
  whatsappUrl: "https://wa.me/6281338876110",
  address: "Jl. Kertamukti No. 64",
  mapsUrl: "https://share.google/TMcayT5dXR10Ufsum",
  siteUrl: "https://imajitek.pages.dev",
  copyrightYear: 2026
} as const;

export function buildWhatsAppUrl(message?: string): string {
  if (!message || !message.trim()) {
    return COMPANY.whatsappUrl;
  }
  return `${COMPANY.whatsappUrl}?text=${encodeURIComponent(message.trim())}`;
}

export const CatalogCategoryIdSchema = z.enum(["creative", "ai", "work", "services"]);
export type CatalogCategoryId = z.infer<typeof CatalogCategoryIdSchema>;

export const BillingPeriodSchema = z.enum(["Tahunan", "Bulanan"]);
export type BillingPeriod = z.infer<typeof BillingPeriodSchema>;

export const CatalogItemSchema = z.object({
  id: z.string().min(1),
  cat: CatalogCategoryIdSchema,
  icon: z.string().min(1),
  isBrand: z.boolean(),
  label: z.string().min(1),
  sub: z.string().min(1),
  type: z.enum(["license", "project"]),
  defaultQty: z.number().int().min(1).max(500).default(1),
  defaultBilling: BillingPeriodSchema.default("Tahunan")
});

export type CatalogItem = z.infer<typeof CatalogItemSchema>;

export interface CatalogCategoryMeta {
  id: CatalogCategoryId;
  label: string;
  hint: string;
}

export const CATALOG_CATEGORIES: readonly CatalogCategoryMeta[] = [
  {
    id: "creative",
    label: "Desain & Aset",
    hint: "Software desain, video, AI kreatif & stok aset"
  },
  { id: "ai", label: "AI Tools", hint: "ChatGPT, Claude & Google Gemini resmi" },
  { id: "work", label: "Office & Teknis", hint: "Email kantor, IDE developer & keamanan web" },
  { id: "services", label: "Jasa Web & Figma", hint: "Pembuatan website, web app & design system" }
] as const;

export const CATALOG_ITEMS: readonly CatalogItem[] = [
  {
    id: "adobe-cc",
    cat: "creative",
    icon: "brand-adobe-cc",
    isBrand: true,
    label: "Adobe Creative Cloud Pro",
    sub: "All Apps · Paket Tim",
    type: "license",
    defaultQty: 2,
    defaultBilling: "Tahunan"
  },
  {
    id: "canva",
    cat: "creative",
    icon: "brand-canva",
    isBrand: true,
    label: "Canva Pro & Business",
    sub: "Desain & Brand Kit",
    type: "license",
    defaultQty: 3,
    defaultBilling: "Tahunan"
  },
  {
    id: "magnific",
    cat: "creative",
    icon: "brand-magnific",
    isBrand: true,
    label: "Magnific",
    sub: "AI Creative & Upscaler",
    type: "license",
    defaultQty: 1,
    defaultBilling: "Bulanan"
  },
  {
    id: "envato",
    cat: "creative",
    icon: "brand-envato",
    isBrand: true,
    label: "Envato Elements",
    sub: "Template, Video Stok & Font",
    type: "license",
    defaultQty: 1,
    defaultBilling: "Tahunan"
  },
  {
    id: "figma",
    cat: "creative",
    icon: "brand-figma",
    isBrand: true,
    label: "Figma Organization",
    sub: "UI/UX & Design System",
    type: "license",
    defaultQty: 2,
    defaultBilling: "Tahunan"
  },
  {
    id: "autodesk",
    cat: "creative",
    icon: "brand-autodesk",
    isBrand: true,
    label: "Autodesk Commercial",
    sub: "AutoCAD / Architecture / 3D",
    type: "license",
    defaultQty: 1,
    defaultBilling: "Tahunan"
  },
  {
    id: "chatgpt",
    cat: "ai",
    icon: "brand-chatgpt",
    isBrand: true,
    label: "ChatGPT Plus & Team",
    sub: "OpenAI Workspace Resmi",
    type: "license",
    defaultQty: 2,
    defaultBilling: "Bulanan"
  },
  {
    id: "claude",
    cat: "ai",
    icon: "brand-claude",
    isBrand: true,
    label: "Claude Pro & Team",
    sub: "Anthropic Team Resmi",
    type: "license",
    defaultQty: 2,
    defaultBilling: "Bulanan"
  },
  {
    id: "gemini",
    cat: "ai",
    icon: "brand-gemini",
    isBrand: true,
    label: "Google Gemini",
    sub: "Gemini AI / Workspace",
    type: "license",
    defaultQty: 2,
    defaultBilling: "Tahunan"
  },
  {
    id: "m365",
    cat: "work",
    icon: "brand-microsoft",
    isBrand: true,
    label: "Microsoft 365 Business",
    sub: "Email Kantor & Office",
    type: "license",
    defaultQty: 5,
    defaultBilling: "Tahunan"
  },
  {
    id: "gworkspace",
    cat: "work",
    icon: "brand-google",
    isBrand: true,
    label: "Google Workspace",
    sub: "Email Domain & Drive",
    type: "license",
    defaultQty: 5,
    defaultBilling: "Tahunan"
  },
  {
    id: "jetbrains",
    cat: "work",
    icon: "brand-jetbrains",
    isBrand: true,
    label: "JetBrains All Products",
    sub: "IDE Developer Resmi",
    type: "license",
    defaultQty: 2,
    defaultBilling: "Tahunan"
  },
  {
    id: "github",
    cat: "work",
    icon: "brand-github",
    isBrand: true,
    label: "GitHub Team",
    sub: "Repositori & Kolaborasi",
    type: "license",
    defaultQty: 3,
    defaultBilling: "Tahunan"
  },
  {
    id: "cloudflare",
    cat: "work",
    icon: "brand-cloudflare",
    isBrand: true,
    label: "Cloudflare Business",
    sub: "CDN, WAF & Keamanan Web",
    type: "license",
    defaultQty: 1,
    defaultBilling: "Bulanan"
  },
  {
    id: "web",
    cat: "services",
    icon: "phd-code",
    isBrand: false,
    label: "Pembuatan Website",
    sub: "Company Profile / Web App",
    type: "project",
    defaultQty: 1,
    defaultBilling: "Tahunan"
  },
  {
    id: "design",
    cat: "services",
    icon: "phd-pen-nib",
    isBrand: false,
    label: "Jasa Desain UI/UX Figma",
    sub: "Wireframe + Design System",
    type: "project",
    defaultQty: 1,
    defaultBilling: "Tahunan"
  }
] as const;

export const CATALOG_MAP: ReadonlyMap<string, CatalogItem> = new Map(
  CATALOG_ITEMS.map((item) => [item.id, item])
);

export interface MarqueePill {
  id: string;
  label: string;
  icon: string;
}

export const MARQUEE_TOP_ROW: readonly MarqueePill[] = [
  { id: "adobe-cc", label: "Adobe Creative Cloud Pro", icon: "brand-adobe-cc" },
  { id: "canva", label: "Canva Pro & Business", icon: "brand-canva" },
  { id: "magnific", label: "Magnific", icon: "brand-magnific" },
  { id: "envato", label: "Envato Elements", icon: "brand-envato" },
  { id: "chatgpt", label: "ChatGPT Team & Plus", icon: "brand-chatgpt" },
  { id: "claude", label: "Claude Pro & Team", icon: "brand-claude" },
  { id: "gemini", label: "Google Gemini", icon: "brand-gemini" }
] as const;

export const MARQUEE_BOTTOM_ROW: readonly MarqueePill[] = [
  { id: "figma", label: "Figma Organization", icon: "brand-figma" },
  { id: "m365", label: "Microsoft 365 Business", icon: "brand-microsoft" },
  { id: "gworkspace", label: "Google Workspace", icon: "brand-google" },
  { id: "jetbrains", label: "JetBrains All Products", icon: "brand-jetbrains" },
  { id: "github", label: "GitHub Team", icon: "brand-github" },
  { id: "cloudflare", label: "Cloudflare Business", icon: "brand-cloudflare" },
  { id: "autodesk", label: "Autodesk Commercial", icon: "brand-autodesk" }
] as const;

export type CommandCategory = "all" | "web" | "design" | "license";

export interface HeroCommand {
  id: string;
  category: Exclude<CommandCategory, "all">;
  iconId: string;
  isBrand: boolean;
  name: string;
  type: string;
  title: string;
  desc: string;
  brands: readonly { id: string; name: string }[];
  meta1Label: string;
  meta1Val: string;
  meta2Label: string;
  meta2Val: string;
  highlight: string;
  ctaText: string;
  inquiry: string;
}

export const HERO_COMMANDS: readonly HeroCommand[] = [
  {
    id: "web-company",
    category: "web",
    iconId: "phd-code",
    isBrand: false,
    name: "Website Perusahaan & Portal Web",
    type: "Web Build",
    title: "Website, Landing Page & Aplikasi Web",
    desc: "Dibuat sesuai kebutuhan bisnis Anda, bukan template seadanya. Termasuk setup domain, SSL, optimasi kecepatan muat, dan CMS supaya konten mudah diperbarui sendiri.",
    brands: [],
    meta1Label: "Estimasi Pengerjaan",
    meta1Val: "2 – 4 Minggu",
    meta2Label: "Serah Terima",
    meta2Val: "Git Repo & Panduan",
    highlight: "Source code dan akses server sepenuhnya menjadi milik Anda.",
    ctaText: "Tanyakan Proyek Web",
    inquiry: "Saya ingin berdiskusi tentang pembuatan Website Perusahaan / Aplikasi Web."
  },
  {
    id: "design-system",
    category: "design",
    iconId: "phd-pen-nib",
    isBrand: false,
    name: "Desain UI/UX & Sistem Desain Figma",
    type: "UI/UX",
    title: "Antarmuka Web, Aplikasi & Design System",
    desc: "Mulai dari wireframe, desain tampilan final di Figma, hingga prototipe interaktif. Komponen disusun rapi memakai Auto Layout dan variabel supaya tim developer gampang lanjut.",
    brands: [{ id: "brand-figma", name: "Figma" }],
    meta1Label: "Estimasi Pengerjaan",
    meta1Val: "10 – 14 Hari Kerja",
    meta2Label: "Hasil Akhir",
    meta2Val: "File Figma + Prototipe",
    highlight: "Sudah termasuk panduan warna, tipografi, dan komponen UI.",
    ctaText: "Tanyakan Desain UI/UX",
    inquiry: "Saya butuh jasa desain UI/UX & Design System di Figma."
  },
  {
    id: "lic-creative",
    category: "license",
    iconId: "brand-adobe-cc",
    isBrand: true,
    name: "Lisensi Desain: Adobe CC Pro, Canva & Envato",
    type: "Desain",
    title: "Adobe Creative Cloud Pro, Canva & Envato Elements",
    desc: "Pembelian akun resmi untuk desainer grafis, editor video, dan tim konten. Bisa pesan satuan maupun paket tim untuk beberapa orang sekaligus.",
    brands: [
      { id: "brand-adobe-cc", name: "Adobe CC Pro" },
      { id: "brand-canva", name: "Canva Pro & Business" },
      { id: "brand-envato", name: "Envato Elements" },
      { id: "brand-figma", name: "Figma" }
    ],
    meta1Label: "Aktivasi Akun",
    meta1Val: "Email Anda / Tim",
    meta2Label: "Pembayaran",
    meta2Val: "Transfer Rupiah",
    highlight: "Akun resmi pribadi atau tim, aman dipakai kerja jangka panjang.",
    ctaText: "Tanyakan Lisensi Desain",
    inquiry: "Saya ingin tanya harga lisensi resmi Adobe CC Pro / Canva / Envato Elements."
  },
  {
    id: "lic-magnific",
    category: "license",
    iconId: "brand-magnific",
    isBrand: true,
    name: "Magnific AI · Upscaler & Visual Suite",
    type: "AI Kreatif",
    title: "Magnific (Creative Suite & Image Upscaler)",
    desc: "Pengadaan langganan Magnific resmi untuk tim kreatif, arsitektur, periklanan, atau e-commerce yang perlu memperjelas resolusi dan membuat aset visual AI.",
    brands: [
      { id: "brand-magnific", name: "Magnific" },
      { id: "brand-adobe-cc", name: "Adobe CC Pro" }
    ],
    meta1Label: "Pilihan Paket",
    meta1Val: "Pro / Teams",
    meta2Label: "Pembayaran",
    meta2Val: "Transfer Rupiah",
    highlight: "Tidak perlu repot pakai kartu kredit internasional atau urus kurs sendiri.",
    ctaText: "Tanyakan Paket Magnific",
    inquiry: "Saya tertarik pengadaan akun resmi Magnific AI."
  },
  {
    id: "lic-ai-work",
    category: "license",
    iconId: "brand-chatgpt",
    isBrand: true,
    name: "Lisensi AI: ChatGPT, Claude & Google Gemini",
    type: "AI Tools",
    title: "ChatGPT Team, Claude Team & Google Gemini",
    desc: "Pembelian akun resmi untuk ChatGPT (OpenAI), Claude (Anthropic), dan Google Gemini. Cocok untuk individu maupun satu tim kerja yang butuh ruang kerja lebih terjaga.",
    brands: [
      { id: "brand-chatgpt", name: "ChatGPT" },
      { id: "brand-claude", name: "Claude" },
      { id: "brand-gemini", name: "Gemini" }
    ],
    meta1Label: "Jenis Akun",
    meta1Val: "Plus / Pro / Team",
    meta2Label: "Pembayaran",
    meta2Val: "Transfer Rupiah",
    highlight: "Bisa digabung dalam satu tagihan bersama lisensi desain atau office.",
    ctaText: "Tanyakan Lisensi AI",
    inquiry: "Saya ingin minta penawaran lisensi ChatGPT / Claude / Google Gemini."
  },
  {
    id: "lic-office",
    category: "license",
    iconId: "brand-microsoft",
    isBrand: true,
    name: "Microsoft 365, Google Workspace & DevTools",
    type: "Office & Dev",
    title: "Produktivitas Kantor & Alat Developer",
    desc: "Pengadaan Microsoft 365 Business, Google Workspace, JetBrains, GitHub, Cloudflare, hingga Autodesk beserta bantuan setup email domain kantor.",
    brands: [
      { id: "brand-microsoft", name: "Microsoft 365" },
      { id: "brand-google", name: "Google Workspace" },
      { id: "brand-jetbrains", name: "JetBrains" },
      { id: "brand-github", name: "GitHub" }
    ],
    meta1Label: "Bantuan Setup",
    meta1Val: "Domain & Admin",
    meta2Label: "Pembayaran",
    meta2Val: "Transfer Rupiah",
    highlight: "Jadwal perpanjangan dicatat terpusat agar langganan tidak mendadak putus.",
    ctaText: "Tanyakan Lisensi Tim",
    inquiry: "Saya ingin konsultasi pengadaan Microsoft 365 / Google Workspace / DevTools."
  }
] as const;

export const DOCK_SHORTCUTS = [
  { id: "web-company", label: "Web & Portal", iconId: "phd-code", isBrand: false },
  { id: "design-system", label: "Desain UI/UX", iconId: "brand-figma", isBrand: true },
  { id: "lic-creative", label: "Adobe · Canva · Envato", iconId: "brand-adobe-cc", isBrand: true },
  { id: "lic-magnific", label: "Magnific AI", iconId: "brand-magnific", isBrand: true },
  { id: "lic-ai-work", label: "ChatGPT · Claude · Gemini", iconId: "brand-claude", isBrand: true }
] as const;

export type WebSubModeId = "profile" | "portal" | "webapp";

export const WEB_SUB_MODES: Record<
  WebSubModeId,
  {
    label: string;
    title: string;
    desc: string;
    stack: string;
    d1Label: string;
    d1Val: string;
    d2Label: string;
    d2Val: string;
  }
> = {
  profile: {
    label: "Company Profile",
    title: "Website Perusahaan & Katalog Produk",
    desc: "Tampilan bersih di desktop maupun HP, halaman layanan lengkap, serta CMS supaya tim Anda bisa ganti teks dan foto kapan saja.",
    stack: "Astro · TypeScript · Cloudflare Edge",
    d1Label: "Estimasi Waktu",
    d1Val: "2 – 3 Minggu",
    d2Label: "Serah Terima",
    d2Val: "Git Repo & Akses Server"
  },
  portal: {
    label: "Portal Tim",
    title: "Portal Klien & Dashboard Data",
    desc: "Sistem web internal dengan login per pengguna, pencarian data cepat, dan form pengajuan yang langsung terhubung ke email atau WhatsApp.",
    stack: "React · TypeScript API · PostgreSQL",
    d1Label: "Estimasi Waktu",
    d1Val: "3 – 5 Minggu",
    d2Label: "Hak Akses",
    d2Val: "Role-Based & Aman"
  },
  webapp: {
    label: "Web App",
    title: "Aplikasi Web Operasional Khusus",
    desc: "Solusi kustom sesuai alur kerja perusahaan Anda, lengkap dengan ekspor laporan, API eksternal, dan dokumentasi pemeliharaan.",
    stack: "Full-Stack TypeScript · Edge API",
    d1Label: "Estimasi Waktu",
    d1Val: "4 – 8 Minggu",
    d2Label: "Kepemilikan",
    d2Val: "100% Kode Milik Anda"
  }
};

export const STUDIO_SPECS = {
  W: {
    badge: "Tombol W · Web Development",
    title: "Kode rapi dan seluruh akses menjadi milik Anda",
    desc: "Website dibangun tanpa mengunci klien. Setelah selesai, repositori Git, akses hosting, dan panduan pengelolaan halaman langsung kami serahkan.",
    metricLabel: "Serah Terima",
    metricValue: "Repositori Git & Panduan"
  },
  D: {
    badge: "Tombol D · Desain Figma",
    title: "File desain terstruktur dan mudah dilanjutkan",
    desc: "Setiap halaman didesain dengan komponen modular dan variabel warna/tipografi di Figma, supaya saat masuk ke tahap coding tidak ada ukuran yang membingungkan.",
    metricLabel: "Hasil Desain",
    metricValue: "File Figma + Panduan Brand"
  },
  L: {
    badge: "Tombol L · Aktivasi Lisensi",
    title: "Lisensi aktif langsung ke email Anda atau tim",
    desc: "Pengadaan Adobe Creative Cloud Pro, Canva Pro & Business, Magnific, Envato Elements, hingga ChatGPT, Claude, dan Gemini diproses resmi ke akun milik Anda.",
    metricLabel: "Status Akun",
    metricValue: "Resmi & Non-Sharing"
  },
  S: {
    badge: "Tombol S · Pembayaran & Support",
    title: "Satu tagihan Rupiah dan dukungan setelah rilis",
    desc: "Pembelian beberapa software bisa digabung dalam satu pembayaran transfer Rupiah, lengkap dengan pengingat sebelum masa aktif habis dan bantuan update web.",
    metricLabel: "Metode Bayar",
    metricValue: "Transfer Bank Rupiah"
  }
} as const;

export type StudioSpecKey = keyof typeof STUDIO_SPECS;

export interface FaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Apakah lisensi diaktifkan langsung ke email kami?",
    answer:
      "Ya. Semua langganan Adobe, Canva, Magnific, Envato, ChatGPT, Claude, dan Gemini masuk langsung ke email pribadi atau domain kantor Anda, bukan akun sharing."
  },
  {
    question: "Kenapa harga per akun tidak dipasang angka mati?",
    answer:
      "Karena kurs USD berjalan terus dan setiap vendor punya opsi paket personal, team, bulanan, maupun tahunan. Anda cukup atur jumlah akun per software di katalog agar kami kirimkan harga fix dalam Rupiah."
  },
  {
    question: "Bisa gabung proyek web/Figma sekaligus lisensi tim?",
    answer:
      "Bisa. Anda dapat memesan pembuatan website atau desain Figma terpisah maupun digabung bersama pengadaan software tim dalam satu alur pembayaran."
  },
  {
    question: "Apakah kode website dan file Figma menjadi milik kami?",
    answer:
      "Sepenuhnya milik Anda. Setelah selesai, repositori Git, akses hosting/server, dan file master Figma diserahkan utuh ke akun Anda."
  }
] as const;

export const SCENARIOS = {
  kreatif: {
    tabEyebrow: "TIM KREATIF & KONTEN",
    tabTitle: "Adobe CC Pro, Canva, Magnific & Envato",
    title: "Kombinasi Software Desain, Aset Stok & Visual AI",
    summary:
      "Cocok untuk tim brand, studio desain, atau tim konten media sosial yang butuh akses resmi sehari-hari tanpa bergantian satu akun.",
    tasks: [
      {
        icon: "brand-adobe-cc",
        isBrand: true,
        text: "Adobe Creative Cloud Pro (Photoshop, Illustrator, Premiere)",
        status: "Resmi / Email Tim"
      },
      {
        icon: "brand-canva",
        isBrand: true,
        text: "Canva Pro & Business untuk tim konten & marketing",
        status: "Brand Kit"
      },
      {
        icon: "brand-magnific",
        isBrand: true,
        text: "Magnific AI untuk upscaling & generasi visual produk",
        status: "Kreatif AI"
      },
      {
        icon: "brand-envato",
        isBrand: true,
        text: "Envato Elements untuk template, musik, video & font",
        status: "Aset Stok"
      }
    ]
  },
  produk: {
    tabEyebrow: "TIM PRODUK & WEB",
    tabTitle: "Website Perusahaan, Figma & AI Tools",
    title: "Dari Desain Figma sampai Website Siap Pakai",
    summary:
      "Menyatukan pembuatan website perusahaan, perapian tampilan UI/UX di Figma, dan pengadaan AI tools untuk tim produk.",
    tasks: [
      {
        icon: "brand-figma",
        isBrand: true,
        text: "Desain halaman & Design System di Figma",
        status: "10–14 Hari"
      },
      {
        icon: "phd-code",
        isBrand: false,
        text: "Pembuatan website responsif + CMS mudah update",
        status: "Git Repo"
      },
      {
        icon: "brand-chatgpt",
        isBrand: true,
        text: "ChatGPT Team & Claude Pro untuk riset dan penulisan",
        status: "AI Tim"
      },
      {
        icon: "brand-gemini",
        isBrand: true,
        text: "Google Gemini & Workspace untuk kolaborasi dokumen",
        status: "Terintegrasi"
      }
    ]
  },
  tim: {
    tabEyebrow: "GABUNGAN MULTI-SOFTWARE",
    tabTitle: "Satu Tagihan untuk Semua Langganan",
    title: "Satu Pembayaran Rupiah untuk Semua Langganan",
    summary:
      "Untuk tim yang memakai beberapa software sekaligus (desain, AI, hingga developer tools) dan ingin perpanjangan tercatat rapi.",
    tasks: [
      {
        icon: "brand-adobe-cc",
        isBrand: true,
        text: "Lisensi Adobe CC Pro, Canva Business & Envato Elements",
        status: "Tim Kreatif"
      },
      {
        icon: "brand-claude",
        isBrand: true,
        text: "ChatGPT Team, Claude Team & Google Gemini",
        status: "Tim AI"
      },
      {
        icon: "brand-microsoft",
        isBrand: true,
        text: "Microsoft 365, Google Workspace, GitHub & JetBrains",
        status: "Tim Teknis"
      },
      {
        icon: "phd-shield-check",
        isBrand: false,
        text: "Pengingat masa aktif sebelum tanggal jatuh tempo",
        status: "Terpantau"
      }
    ]
  }
} as const;

export type ScenarioId = keyof typeof SCENARIOS;

export interface OrderFeedItem {
  readonly code: string;
  readonly icon: string;
  readonly isBrand: boolean;
  readonly detail: string;
  readonly meta: string;
  readonly status: "processing" | "active";
  readonly statusLabel: string;
  readonly prefillTopic: string;
  readonly prefillNote: string;
}

export const ORDER_FEED_ITEMS: readonly OrderFeedItem[] = [
  {
    code: "#IMJ-418",
    icon: "brand-adobe-cc",
    isBrand: true,
    detail: "4× Adobe Creative Cloud Pro",
    meta: "Tahunan · Tim Kreatif",
    status: "processing",
    statusLabel: "Diproses",
    prefillTopic: "Pembelian Lisensi Software & AI",
    prefillNote:
      "Saya tertarik memesan 4 akun Adobe Creative Cloud Pro (Tahunan) ke email tim kami."
  },
  {
    code: "#IMJ-417",
    icon: "brand-chatgpt",
    isBrand: true,
    detail: "3× ChatGPT Team + 2× Claude Pro",
    meta: "Bulanan · Tim Produk",
    status: "active",
    statusLabel: "Aktif",
    prefillTopic: "Pembelian Lisensi Software & AI",
    prefillNote: "Mohon penawaran untuk 3 akun ChatGPT Team dan 2 akun Claude Pro."
  },
  {
    code: "#IMJ-416",
    icon: "brand-figma",
    isBrand: true,
    detail: "Website + Design System Figma",
    meta: "Company Profile · Repo Git",
    status: "active",
    statusLabel: "Serah Terima",
    prefillTopic: "Website + Desain + Lisensi",
    prefillNote:
      "Saya ingin berdiskusi pembuatan website perusahaan beserta Design System di Figma."
  },
  {
    code: "#IMJ-415",
    icon: "brand-canva",
    isBrand: true,
    detail: "5× Canva Business + Envato Elements",
    meta: "Tahunan · Tim Brand",
    status: "active",
    statusLabel: "Aktif",
    prefillTopic: "Pembelian Lisensi Software & AI",
    prefillNote: "Mohon penawaran resmi untuk 5 akun Canva Business dan Envato Elements (Tahunan)."
  },
  {
    code: "#IMJ-414",
    icon: "brand-magnific",
    isBrand: true,
    detail: "2× Magnific AI + 2× Google Gemini",
    meta: "Bulanan · Studio Visual",
    status: "active",
    statusLabel: "Aktif",
    prefillTopic: "Pembelian Lisensi Software & AI",
    prefillNote: "Mohon info harga 2 akun Magnific AI dan 2 akun Google Gemini."
  },
  {
    code: "#IMJ-413",
    icon: "brand-microsoft",
    isBrand: true,
    detail: "6× Microsoft 365 Business",
    meta: "Tahunan · Domain Kantor",
    status: "active",
    statusLabel: "Aktif",
    prefillTopic: "Pembelian Lisensi Software & AI",
    prefillNote: "Kami butuh pengadaan 6 akun Microsoft 365 Business untuk email domain kantor."
  }
] as const;
