"use server";

import { revalidatePath } from "next/cache";
import type { CampaignPlatform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "DIGITAL_MARKETING"] as const;

function dateOrNull(value: FormDataEntryValue | null): Date | null {
  const s = String(value ?? "");
  return s ? new Date(s) : null;
}
function numOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function createCampaign(formData: FormData) {
  await requireRole([...ALLOWED_ROLES]);

  const name = String(formData.get("name") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "");
  if (!name || !projectId) throw new Error("Nama kampanye dan proyek wajib diisi.");

  await prisma.campaign.create({
    data: {
      projectId,
      name,
      platform: (String(formData.get("platform") ?? "ORGANIC") as CampaignPlatform) || "ORGANIC",
      objective: String(formData.get("objective") ?? "") || null,
      budget: numOrNull(formData.get("budget")),
      startDate: dateOrNull(formData.get("startDate")),
      endDate: dateOrNull(formData.get("endDate")),
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/marketing");
}

export async function updateCampaign(campaignId: string, formData: FormData) {
  await requireRole([...ALLOWED_ROLES]);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Nama kampanye wajib diisi.");

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      name,
      platform: (String(formData.get("platform") ?? "ORGANIC") as CampaignPlatform) || "ORGANIC",
      objective: String(formData.get("objective") ?? "") || null,
      budget: numOrNull(formData.get("budget")),
      startDate: dateOrNull(formData.get("startDate")),
      endDate: dateOrNull(formData.get("endDate")),
    },
  });

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/marketing");
}

export async function deleteCampaign(campaignId: string) {
  await requireRole([...ALLOWED_ROLES]);
  await prisma.campaign.delete({ where: { id: campaignId } });
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/marketing");
}
