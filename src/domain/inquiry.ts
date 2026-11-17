import { z } from "zod";
import { BillingPeriodSchema } from "./catalog";

export const SelectedQuoteItemSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  type: z.enum(["license", "project"]),
  quantity: z.number().int().min(1).max(500),
  billing: z.union([BillingPeriodSchema, z.literal("Proyek Custom")])
});

export type SelectedQuoteItem = z.infer<typeof SelectedQuoteItemSchema>;

export const SpamChallengeSchema = z.object({
  a: z.number().int().min(1).max(9),
  b: z.number().int().min(1).max(9),
  answer: z.number().int().min(2).max(18)
});

export type SpamChallenge = z.infer<typeof SpamChallengeSchema>;

function countUrls(text: string): number {
  const matches = text.match(/https?:\/\/\S+/gi);
  return matches ? matches.length : 0;
}

export const InquiryRequestSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, "Nama Anda atau perusahaan minimal 2 karakter.")
    .max(120, "Nama terlalu panjang (maksimal 120 karakter)."),
  whatsapp: z
    .string()
    .trim()
    .min(8, "Masukkan nomor WhatsApp yang valid (minimal 8 digit).")
    .max(32, "Nomor WhatsApp terlalu panjang.")
    .regex(/^[+0-9()\s-]{8,32}$/, "Format nomor WhatsApp tidak valid."),
  email: z
    .string()
    .trim()
    .max(160)
    .refine(
      (val) => val === "" || z.string().email().safeParse(val).success,
      "Format email tidak valid."
    )
    .optional()
    .default(""),
  topic: z.string().trim().max(120).optional().default("Konsultasi Umum"),
  notes: z
    .string()
    .trim()
    .max(2000, "Catatan kebutuhan maksimal 2.000 karakter.")
    .refine(
      (val) => countUrls(val) <= 2,
      "Mohon batasi tautan eksternal maksimal 2 link agar tidak ditolak filter anti-spam."
    )
    .optional()
    .default(""),
  selectedItems: z.array(SelectedQuoteItemSchema).max(30).optional().default([]),
  source: z.enum(["home", "contact", "catalog"]).optional().default("home"),
  website: z.string().max(200).optional().default(""),
  formStartedAt: z.number().int().positive().optional(),
  spamChallenge: SpamChallengeSchema.optional(),
  turnstileToken: z.string().max(2048).optional()
});

export type InquiryRequest = z.infer<typeof InquiryRequestSchema>;

export const InquirySuccessResponseSchema = z.object({
  ok: z.literal(true),
  inquiryId: z.string(),
  receivedAt: z.string(),
  summary: z.string(),
  emailDispatched: z.boolean().optional()
});

export const InquiryErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  message: z.string(),
  fieldErrors: z.record(z.string(), z.string()).optional()
});

export type InquirySuccessResponse = z.infer<typeof InquirySuccessResponseSchema>;
export type InquiryErrorResponse = z.infer<typeof InquiryErrorResponseSchema>;
export type InquiryApiResponse = InquirySuccessResponse | InquiryErrorResponse;
