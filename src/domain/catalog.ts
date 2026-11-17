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
  { id: "services", label: "Web & Desain", hint: "Pembuatan website, aplikasi web & desain grafis" }
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
    label: "Jasa Desain Grafis",
    sub: "Korporat, UMKM & Personal",
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

export interface WebDesainPoint {
  readonly title: string;
  readonly desc: string;
}

export interface WebDesainTab {
  readonly key: "W" | "D" | "S";
  readonly tabLabel: string;
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly listHeading: string;
  readonly listKind: "benefits" | "steps";
  readonly points: readonly WebDesainPoint[];
}

export const WEB_DESAIN_TABS: readonly WebDesainTab[] = [
  {
    key: "W",
    tabLabel: "Website & Aplikasi Web",
    eyebrow: "Bagian 1 · Website & Web App",
    heading: "Website Perusahaan, Landing Page & Aplikasi Web",
    description:
      "Kami membangun website yang cepat, aman, dan mudah dikelola—mulai dari halaman profil bisnis, katalog produk UMKM, hingga aplikasi web operasional.",
    listHeading: "Poin Keunggulan",
    listKind: "benefits",
    points: [
      {
        title: "Desain Responsif & Cepat",
        desc: "Tampilan optimal di layar komputer maupun smartphone dengan waktu muat yang ringan."
      },
      {
        title: "Kepemilikan Penuh",
        desc: "Serah terima lengkap mencakup source code (repositori Git) dan akses penuh ke hosting/server."
      },
      {
        title: "Siap Berkembang",
        desc: "Struktur kode yang rapi dan mudah dikembangkan sesuai pertumbuhan bisnis Anda."
      }
    ]
  },
  {
    key: "D",
    tabLabel: "Desain Grafis",
    eyebrow: "Bagian 2 · Desain Grafis",
    heading: "Desain Grafis Korporat, UMKM & Personal",
    description:
      "Layanan perancangan visual profesional untuk berbagai skala kebutuhan—baik untuk standar komunikasi perusahaan, promosi UMKM, maupun proyek personal.",
    listHeading: "Poin Keunggulan",
    listKind: "benefits",
    points: [
      {
        title: "Kebutuhan Korporat & Instansi",
        desc: "Desain company profile, laporan tahunan/proyek, materi presentasi, publikasi, dan aset identitas perusahaan."
      },
      {
        title: "Kebutuhan UMKM & Brand Lokal",
        desc: "Desain logo, kemasan, katalog produk, poster promosi, hingga konten visual media sosial."
      },
      {
        title: "File Master Siap Pakai",
        desc: "Seluruh hasil desain diserahkan dalam format siap cetak maupun digital beserta file masternya."
      }
    ]
  },
  {
    key: "S",
    tabLabel: "Standar & Cara Kerja",
    eyebrow: "Bagian 3 · Standar & Cara Kerja",
    heading: "Alur Kerja Transparan & Terukur",
    description:
      "Proses pengerjaan yang jelas dari diskusi awal hingga serah terima aset, tanpa biaya tersembunyi.",
    listHeading: "Langkah Kerja",
    listKind: "steps",
    points: [
      {
        title: "Diskusi & Pemetaan Kebutuhan",
        desc: "Memahami target, referensi visual, atau spesifikasi teknis yang Anda butuhkan."
      },
      {
        title: "Penawaran & Kesepakatan",
        desc: "Rincian ruang lingkup kerja, durasi pengerjaan, dan estimasi biaya yang transparan."
      },
      {
        title: "Pengerjaan & Revisi Terarah",
        desc: "Proses produksi dengan pembaruan berkala dan sesi revisi sesuai kesepakatan."
      },
      {
        title: "Serah Terima Penuh",
        desc: "Penyerahan hasil akhir beserta kode sumber, akses akun, atau file master desain."
      }
    ]
  }
] as const;

export type WebDesainTabKey = WebDesainTab["key"];

export const STUDIO_SPECS = {
  W: {
    badge: "Tombol W · Web Development",
    title: "Website Perusahaan, Landing Page & Aplikasi Web",
    desc: "Website dibangun cepat, aman, dan mudah dikelola dengan serah terima penuh source code (repositori Git) serta akses penuh ke hosting/server.",
    metricLabel: "Serah Terima",
    metricValue: "Repositori Git & Akses Server"
  },
  D: {
    badge: "Tombol D · Desain Grafis",
    title: "Desain Grafis Korporat, UMKM & Personal",
    desc: "Perancangan visual profesional mulai dari company profile, materi presentasi, logo, kemasan, hingga konten digital beserta file master siap pakai.",
    metricLabel: "Hasil Desain",
    metricValue: "Format Cetak, Digital & File Master"
  },
  L: {
    badge: "Tombol L · Aktivasi Lisensi",
    title: "Lisensi aktif langsung ke email Anda atau tim",
    desc: "Pengadaan Adobe Creative Cloud Pro, Canva Pro & Business, Magnific, Envato Elements, hingga ChatGPT, Claude, dan Gemini langsung ke email resmi Anda.",
    metricLabel: "Status Akun",
    metricValue: "Resmi & Non-Sharing"
  },
  S: {
    badge: "Tombol S · Standar & Cara Kerja",
    title: "Alur Kerja Transparan & Terukur",
    desc: "Proses pengerjaan yang jelas mulai dari diskusi kebutuhan, penawaran terperinci, revisi terarah, hingga serah terima aset secara penuh.",
    metricLabel: "Jaminan",
    metricValue: "Tanpa Biaya Tersembunyi"
  }
} as const;

export type StudioSpecKey = keyof typeof STUDIO_SPECS;

export interface FaqItem {
  question: string;
  answer: string;
  imageSrc: string;
  imageAlt: string;
}

export const HOME_FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Apakah lisensi masuk langsung ke email kami?",
    answer:
      "Ya. Semua langganan Adobe, Canva, Magnific, Envato, ChatGPT, Claude, dan Gemini aktif langsung ke email pribadi atau domain kantor Anda, bukan akun sharing.",
    imageSrc: "/images/faq/faq-01.webp",
    imageAlt:
      "Meja kerja minimalis dengan laptop terbuka dan amplop aktivasi lisensi resmi ke email perusahaan"
  },
  {
    question: "Mengapa harga per akun tidak tampil langsung?",
    answer:
      "Kurs USD bersifat dinamis dan tiap vendor punya paket personal, tim, bulanan, maupun tahunan. Susun kebutuhan akun di katalog dan kami kirimkan rincian harga final dalam Rupiah.",
    imageSrc: "/images/faq/faq-02.webp",
    imageAlt:
      "Tablet estimasi, kalkulator meja, dan catatan perencanaan harga paket lisensi dalam Rupiah"
  },
  {
    question: "Bisakah gabung proyek web, desain, dan lisensi?",
    answer:
      "Bisa. Anda dapat memesan pembuatan website, jasa desain grafis, maupun pengadaan software tim secara terpisah atau sekaligus dalam satu penawaran.",
    imageSrc: "/images/faq/faq-03.webp",
    imageAlt:
      "Monitor kerja dengan wireframe tata letak web, laptop, dan buku catatan desain visual studio"
  },
  {
    question: "Apakah kode dan file master jadi milik kami?",
    answer:
      "Sepenuhnya milik Anda. Setelah proyek selesai, repositori Git, akses hosting/server, dan seluruh file master desain diserahkan utuh ke akun Anda.",
    imageSrc: "/images/faq/faq-04.webp",
    imageAlt:
      "Laptop, keyboard mekanikal, drive arsip, dan folder proyek serah terima kode dan file master desain"
  },
  {
    question: "Bagaimana jika software tidak ada di daftar?",
    answer:
      "Anda dapat mengetikkan nama software atau kebutuhan jasa khusus di kolom pencarian Hero atau input tambahan di bawah daftar katalog untuk kami bantu carikan penawarannya.",
    imageSrc: "/images/faq/faq-05.webp",
    imageAlt:
      "Buku catatan terbuka dan laptop untuk pencatatan permintaan pengadaan software khusus"
  },
  {
    question: "Apakah tersedia invoice resmi dalam Rupiah?",
    answer:
      "Tersedia. Seluruh pengadaan dikelola oleh PT Imaji Teknologi Bersama dengan bukti transaksi dan penagihan resmi dalam mata uang Rupiah.",
    imageSrc: "/images/faq/faq-06.webp",
    imageAlt:
      "Arsip binder dan map penagihan perusahaan untuk transaksi invoice resmi PT Imaji Teknologi Bersama"
  }
] as const;

export interface SoftwareSuiteEntry {
  vendor: string;
  suite: string;
  includedTools: readonly string[];
  summary: string;
}

export const SOFTWARE_SUITE_DIRECTORY: readonly SoftwareSuiteEntry[] = [
  {
    vendor: "Adobe",
    suite: "Adobe Creative Cloud Pro",
    includedTools: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Adobe Premiere Pro",
      "Adobe After Effects",
      "Adobe InDesign",
      "Adobe Lightroom",
      "Adobe Acrobat Pro",
      "Adobe Audition",
      "Adobe XD"
    ],
    summary:
      "Lisensi resmi Adobe All Apps maupun Single App langsung ke email perusahaan atau pribadi."
  },
  {
    vendor: "Canva",
    suite: "Canva Pro & Canva Business",
    includedTools: ["Canva Pro", "Canva Teams / Business", "Brand Kit", "Magic Studio AI"],
    summary:
      "Langganan Canva resmi untuk tim marketing, desain konten media sosial, dan presentasi."
  },
  {
    vendor: "Magnific & Envato",
    suite: "Magnific AI & Envato Elements",
    includedTools: [
      "Magnific AI Upscaler",
      "Magnific Relight & Style Transfer",
      "Envato Elements",
      "Video Stock, Font & Template"
    ],
    summary:
      "Akses resmi generator/upscaler visual AI Magnific dan perpustakaan aset Envato Elements."
  },
  {
    vendor: "Figma",
    suite: "Figma Organization & Design System",
    includedTools: ["Figma Design", "Figma Dev Mode", "FigJam", "Design System Tokens"],
    summary:
      "Lisensi kursi Figma tim maupun jasa pembuatan UI/UX dan komponen Auto Layout siap dev."
  },
  {
    vendor: "AI Productivity",
    suite: "ChatGPT, Claude & Google Gemini",
    includedTools: [
      "ChatGPT Plus",
      "ChatGPT Team / Business",
      "OpenAI",
      "Claude Pro",
      "Claude Team (Anthropic)",
      "Google Gemini Advanced / Workspace"
    ],
    summary:
      "Pengadaan akun AI resmi non-sharing dengan pembayaran Rupiah untuk perusahaan dan individu."
  },
  {
    vendor: "Office, Cloud & Engineering",
    suite: "Microsoft 365, Google Workspace, Autodesk, JetBrains & GitHub",
    includedTools: [
      "Microsoft 365 Business (Word, Excel, PowerPoint, Outlook, Teams)",
      "Google Workspace (Gmail Bisnis, Drive, Meet)",
      "Autodesk AutoCAD / Revit / 3ds Max / Fusion",
      "JetBrains All Products (IntelliJ IDEA, WebStorm, PyCharm, PhpStorm)",
      "GitHub Team",
      "Cloudflare Business"
    ],
    summary:
      "Kebutuhan email domain perusahaan, CAD/3D arsitektur, IDE developer, dan keamanan web."
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
      "Mohon penawaran untuk 4 akun Adobe Creative Cloud Pro (Tahunan) ke email tim kami."
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
      "Saya ingin berkonsultasi mengenai pembuatan website perusahaan beserta Design System di Figma."
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
    prefillNote: "Mohon penawaran resmi untuk 2 akun Magnific AI dan 2 akun Google Gemini."
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
