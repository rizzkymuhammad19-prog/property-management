"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "SALES_MANAGER"] as const;

function numOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function upsertSalesTarget(formData: FormData) {
  await requireRole([...ALLOWED_ROLES]);

  const userId = String(formData.get("userId") ?? "") || null;
  const projectId = String(formData.get("projectId") ?? "");
  const period = String(formData.get("period") ?? "").trim();
  if (!projectId || !period) throw new Error("Proyek dan periode wajib diisi.");

  const data = {
    targetUnit: numOrNull(formData.get("targetUnit")),
    targetBooking: numOrNull(formData.get("targetBooking")),
    targetAkad: numOrNull(formData.get("targetAkad")),
    targetRevenue: numOrNull(formData.get("targetRevenue")),
  };

  const existing = await prisma.salesTarget.findFirst({
    where: { userId, projectId, period },
  });

  if (existing) {
    await prisma.salesTarget.update({ where: { id: existing.id }, data });
  } else {
    await prisma.salesTarget.create({ data: { userId, projectId, period, ...data } });
  }

  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
}

export async function deleteSalesTarget(id: string) {
  await requireRole([...ALLOWED_ROLES]);
  await prisma.salesTarget.delete({ where: { id } });
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
}
