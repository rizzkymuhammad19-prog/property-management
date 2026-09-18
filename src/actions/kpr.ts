"use server";

import { revalidatePath } from "next/cache";
import type { FinancingType, KprStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "ADMIN"] as const;

function num(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function createKprApplication(formData: FormData) {
  await requireRole([...ALLOWED_ROLES]);

  const bookingId = String(formData.get("bookingId") ?? "");
  const bank = String(formData.get("bank") ?? "").trim();
  if (!bookingId || !bank) throw new Error("Booking dan nama bank wajib diisi.");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");

  const slaDays = Number(formData.get("slaDays") ?? 14) || 14;
  const slaDueAt = new Date();
  slaDueAt.setDate(slaDueAt.getDate() + slaDays);

  await prisma.$transaction([
    prisma.kprApplication.create({
      data: {
        bookingId,
        unitId: booking.unitId,
        salesId: booking.salesId,
        bank,
        financingType: (String(formData.get("financingType") ?? "COMMERCIAL") as FinancingType) || "COMMERCIAL",
        plafond: num(formData.get("plafond")) || booking.price - booking.dp,
        tenor: Math.round(num(formData.get("tenor"))) || 15,
        mbrEligible: formData.get("mbrEligible") === "on",
        npwp: String(formData.get("npwp") ?? "") || null,
        suratBelumPunyaRumah: formData.get("suratBelumPunyaRumah") === "on",
        slaDueAt,
      },
    }),
    prisma.unit.update({ where: { id: booking.unitId }, data: { status: "KPR" } }),
    prisma.lead.update({ where: { id: booking.leadId }, data: { status: "KPR" } }),
  ]);

  revalidatePath("/dashboard/kpr");
  revalidatePath("/dashboard/units");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}

export async function updateKprStatus(kprId: string, status: KprStatus) {
  await requireRole([...ALLOWED_ROLES]);

  const kpr = await prisma.kprApplication.findUnique({
    where: { id: kprId },
    include: { booking: true },
  });
  if (!kpr) throw new Error("Pengajuan KPR tidak ditemukan.");

  await prisma.kprApplication.update({ where: { id: kprId }, data: { status } });

  if (status === "AKAD") {
    await prisma.$transaction([
      prisma.unit.update({ where: { id: kpr.unitId }, data: { status: "SOLD" } }),
      prisma.lead.update({ where: { id: kpr.booking.leadId }, data: { status: "AKAD" } }),
    ]);
  }

  revalidatePath("/dashboard/kpr");
  revalidatePath("/dashboard/units");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}

export async function deleteKprApplication(kprId: string) {
  await requireRole([...ALLOWED_ROLES]);
  await prisma.kprApplication.delete({ where: { id: kprId } });
  revalidatePath("/dashboard/kpr");
  revalidatePath("/dashboard");
}
