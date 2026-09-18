"use server";

import { revalidatePath } from "next/cache";
import type { LeadPriority, LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/guard";

async function assertLeadAccess(leadId: string) {
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead tidak ditemukan.");
  if (session.user.role === "SALES" && lead.salesId !== session.user.id) {
    throw new Error("Anda hanya bisa mengubah lead milik Anda sendiri.");
  }
  return { session, lead };
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await assertLeadAccess(leadId);

  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { status } }),
    prisma.salesActivity.create({
      data: {
        leadId,
        type: "STATUS_CHANGE",
        note: `Status diubah ke ${status}`,
      },
    }),
  ]);

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

export async function createLead(formData: FormData) {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  if (!name || !whatsapp) throw new Error("Nama dan WhatsApp wajib diisi.");

  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) throw new Error("Proyek wajib dipilih.");

  const sourceId = String(formData.get("sourceId") ?? "") || null;
  const salesId =
    session.user.role === "SALES" ? session.user.id : String(formData.get("salesId") ?? "") || null;

  await prisma.lead.create({
    data: {
      projectId,
      name,
      whatsapp,
      email: String(formData.get("email") ?? "") || null,
      domisili: String(formData.get("domisili") ?? "") || null,
      pekerjaan: String(formData.get("pekerjaan") ?? "") || null,
      budget: numOrNull(formData.get("budget")),
      tipeRumahDiminati: String(formData.get("tipeRumahDiminati") ?? "") || null,
      sourceId,
      salesId,
      priority: (String(formData.get("priority") ?? "MEDIUM") || "MEDIUM") as LeadPriority,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}

export async function updateLead(leadId: string, formData: FormData) {
  const { session } = await assertLeadAccess(leadId);

  const name = String(formData.get("name") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  if (!name || !whatsapp) throw new Error("Nama dan WhatsApp wajib diisi.");

  const salesId =
    session.user.role === "SALES" ? session.user.id : String(formData.get("salesId") ?? "") || null;

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      name,
      whatsapp,
      email: String(formData.get("email") ?? "") || null,
      domisili: String(formData.get("domisili") ?? "") || null,
      pekerjaan: String(formData.get("pekerjaan") ?? "") || null,
      budget: numOrNull(formData.get("budget")),
      tipeRumahDiminati: String(formData.get("tipeRumahDiminati") ?? "") || null,
      sourceId: String(formData.get("sourceId") ?? "") || null,
      salesId,
      priority: (String(formData.get("priority") ?? "MEDIUM") || "MEDIUM") as LeadPriority,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}

export async function deleteLead(leadId: string) {
  const session = await requireSession();
  if (!["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Anda tidak punya akses untuk menghapus lead.");
  }
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}

function numOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
