"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES", "ADMIN"] as const;

export async function createSurvey(formData: FormData) {
  const session = await requireRole([...ALLOWED_ROLES]);

  const leadId = String(formData.get("leadId") ?? "");
  const unitId = String(formData.get("unitId") ?? "");
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  if (!leadId || !unitId || !scheduledAtRaw) {
    throw new Error("Lead, unit, dan jadwal wajib diisi.");
  }

  if (session.user.role === "SALES") {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.salesId !== session.user.id) {
      throw new Error("Anda hanya bisa membuat survei untuk lead Anda sendiri.");
    }
  }

  await prisma.survey.create({
    data: {
      leadId,
      unitId,
      scheduledAt: new Date(scheduledAtRaw),
    },
  });

  revalidatePath("/dashboard/surveys");
  revalidatePath("/dashboard");
}

async function assertAccess(surveyId: string) {
  const session = await requireSession();
  const survey = await prisma.survey.findUnique({ include: { lead: true }, where: { id: surveyId } });
  if (!survey) throw new Error("Survei tidak ditemukan.");
  if (session.user.role === "SALES" && survey.lead.salesId !== session.user.id) {
    throw new Error("Anda hanya bisa mengubah survei lead Anda sendiri.");
  }
  return survey;
}

export async function updateSurvey(surveyId: string, formData: FormData) {
  await assertAccess(surveyId);

  const unitId = String(formData.get("unitId") ?? "");
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  if (!unitId || !scheduledAtRaw) {
    throw new Error("Unit dan jadwal wajib diisi.");
  }

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      unitId,
      scheduledAt: new Date(scheduledAtRaw),
    },
  });

  revalidatePath("/dashboard/surveys");
  revalidatePath("/dashboard");
}

export async function completeSurvey(surveyId: string, formData: FormData) {
  await assertAccess(surveyId);
  const result = String(formData.get("result") ?? "").trim();

  await prisma.survey.update({
    where: { id: surveyId },
    data: { completedAt: new Date(), result: result || null },
  });

  revalidatePath("/dashboard/surveys");
  revalidatePath("/dashboard");
}

export async function deleteSurvey(surveyId: string) {
  await assertAccess(surveyId);
  await prisma.survey.delete({ where: { id: surveyId } });
  revalidatePath("/dashboard/surveys");
  revalidatePath("/dashboard");
}
