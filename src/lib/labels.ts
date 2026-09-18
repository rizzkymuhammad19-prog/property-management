// Display labels (Bahasa Indonesia) for enum values coming from Prisma.
// The enum values themselves stay in English to match the database schema —
// only what's shown on screen is translated here.

export const UNIT_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Tersedia",
  HOLD: "Ditahan",
  BOOKED: "Dibooking",
  KPR: "Proses KPR",
  SOLD: "Terjual",
};

export const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  QUALIFIED: "Qualified",
  SURVEY: "Survei",
  FOLLOW_UP: "Follow Up",
  BOOKING: "Booking",
  KPR: "Proses KPR",
  AKAD: "Akad",
  LOST: "Hilang",
};

export const LEAD_PRIORITY_LABEL: Record<string, string> = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
};

export const CONTACT_METHOD_LABEL: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  PHONE_CALL: "Telepon",
  SMS: "SMS",
  MEETING: "Meeting",
  SURVEY: "Survei",
  OTHER: "Lainnya",
};

export const BOOKING_PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Belum Bayar",
  PARTIAL: "Sebagian",
  PAID: "Lunas",
};

export const KPR_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Diajukan",
  ANALYSIS: "Analisa Bank",
  SURVEY_BANK: "Survei Bank",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  AKAD: "Akad",
};

export const FINANCING_TYPE_LABEL: Record<string, string> = {
  SUBSIDIZED_FLPP: "Subsidi FLPP",
  SUBSIDIZED_BP2BT: "Subsidi BP2BT",
  COMMERCIAL: "Komersial",
};

export const TASK_TYPE_LABEL: Record<string, string> = {
  CALL: "Telepon",
  WHATSAPP: "WhatsApp",
  FOLLOW_UP: "Follow Up",
  SURVEY: "Survei",
  MEETING: "Meeting",
  PRESENTATION: "Presentasi",
  CLOSING: "Closing",
  DOCUMENT: "Dokumen",
};

export const TASK_STATUS_LABEL: Record<string, string> = {
  TODO: "Belum Dikerjakan",
  IN_PROGRESS: "Dikerjakan",
  DONE: "Selesai",
};

export const CAMPAIGN_PLATFORM_LABEL: Record<string, string> = {
  META_ADS: "Meta Ads",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  GOOGLE_ADS: "Google Ads",
  ORGANIC: "Organik",
  EVENT: "Event",
  REFERRAL: "Referral",
};

export const SOURCE_CHANNEL_LABEL: Record<string, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  GOOGLE: "Google",
  WEBSITE: "Website",
  WHATSAPP: "WhatsApp",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  EVENT: "Event",
  MARKETPLACE: "Marketplace",
  OTHER: "Lainnya",
};
