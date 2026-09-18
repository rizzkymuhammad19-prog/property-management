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
