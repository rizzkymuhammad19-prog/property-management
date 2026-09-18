"use server";

import { revalidatePath } from "next/cache";
import type { ContactMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES"] as const;

export async function createFollowUp(formData: FormData) {
  const session = await requireRole([...ALLOWED_ROLES]);

  const leadId = String(formData.get("leadId") ?? "");
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  if (!leadId || !scheduledAtRaw) throw new Error("Lead dan jadwal wajib diisi.");

  if (session.user.role === "SALES") {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.salesId !== session.user.id) {
      throw new Error("Anda hanya bisa membuat follow-up untuk lead Anda sendiri.");
    }
  }

  await prisma.followUp.create({
    data: {
      leadId,
      userId: session.user.id,
      scheduledAt: new Date(scheduledAtRaw),
      contactMethod: (String(formData.get("contactMethod") ?? "WHATSAPP") as ContactMethod) || "WHATSAPP",
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: { nextFollowUp: new Date(scheduledAtRaw) },
  });

  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

async function assertOwnFollowUp(followUpId: string) {
  const session = await requireSession();
  const followUp = await prisma.followUp.findUnique({ where: { id: followUpId } });
  if (!followUp) throw new Error("Follow-up tidak ditemukan.");
  if (session.user.role === "SALES" && followUp.userId !== session.user.id) {
    throw new Error("Anda hanya bisa mengubah follow-up milik Anda sendiri.");
  }
  return followUp;
}

export async function updateFollowUp(followUpId: string, formData: FormData) {
  await assertOwnFollowUp(followUpId);

  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");
  if (!scheduledAtRaw) throw new Error("Jadwal wajib diisi.");

  const scheduledAt = new Date(scheduledAtRaw);

  await prisma.followUp.update({
    where: { id: followUpId },
    data: {
      scheduledAt,
      contactMethod: (String(formData.get("contactMethod") ?? "WHATSAPP") as ContactMethod) || "WHATSAPP",
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

export async function markFollowUpComplete(followUpId: string) {
  await assertOwnFollowUp(followUpId);
  await prisma.followUp.update({
    where: { id: followUpId },
    data: { completedAt: new Date() },
  });
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard");
}

export async function deleteFollowUp(followUpId: string) {
  await assertOwnFollowUp(followUpId);
  await prisma.followUp.delete({ where: { id: followUpId } });
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard");
}
