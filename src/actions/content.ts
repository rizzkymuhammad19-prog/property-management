"use server";

import { revalidatePath } from "next/cache";
import type { CampaignPlatform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "DIGITAL_MARKETING"] as const;

function intOrZero(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const s = String(value ?? "");
  return s ? new Date(s) : null;
}

function buildData(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    platform: (String(formData.get("platform") ?? "ORGANIC") as CampaignPlatform) || "ORGANIC",
    contentType: String(formData.get("contentType") ?? "") || null,
    publishDate: dateOrNull(formData.get("publishDate")),
    views: intOrZero(formData.get("views")),
    reach: intOrZero(formData.get("reach")),
    engagement: intOrZero(formData.get("engagement")),
    leadsCount: intOrZero(formData.get("leadsCount")),
    surveyCount: intOrZero(formData.get("surveyCount")),
    bookingCount: intOrZero(formData.get("bookingCount")),
    revenue: intOrZero(formData.get("revenue")),
  };
}

export async function createContent(formData: FormData) {
  await requireRole([...ALLOWED_ROLES]);
  const campaignId = String(formData.get("campaignId") ?? "");
  const data = buildData(formData);
  if (!campaignId || !data.title) throw new Error("Kampanye dan judul konten wajib diisi.");

  await prisma.content.create({ data: { campaignId, ...data } });

  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/marketing");
}

export async function updateContent(contentId: string, formData: FormData) {
  await requireRole([...ALLOWED_ROLES]);
  const data = buildData(formData);
  if (!data.title) throw new Error("Judul konten wajib diisi.");

  await prisma.content.update({ where: { id: contentId }, data });

  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/marketing");
}

export async function deleteContent(contentId: string) {
  await requireRole([...ALLOWED_ROLES]);
  await prisma.content.delete({ where: { id: contentId } });
  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/marketing");
}
