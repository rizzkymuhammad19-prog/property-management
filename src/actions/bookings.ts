"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES", "ADMIN"] as const;

function num(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function createBooking(formData: FormData) {
  const session = await requireRole([...ALLOWED_ROLES]);

  const leadId = String(formData.get("leadId") ?? "");
  const unitId = String(formData.get("unitId") ?? "");
  if (!leadId || !unitId) throw new Error("Lead dan unit wajib dipilih.");

  if (session.user.role === "SALES") {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.salesId !== session.user.id) {
      throw new Error("Anda hanya bisa membuat booking untuk lead Anda sendiri.");
    }
  }

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) throw new Error("Unit tidak ditemukan.");
  if (unit.status === "SOLD" || unit.status === "BOOKED" || unit.status === "KPR") {
    throw new Error("Unit ini sudah tidak tersedia untuk booking baru.");
  }

  const salesId = session.user.role === "SALES" ? session.user.id : String(formData.get("salesId") ?? session.user.id);

  await prisma.$transaction([
    prisma.booking.create({
      data: {
        leadId,
        unitId,
        salesId,
        bookingFee: num(formData.get("bookingFee")),
        price: num(formData.get("price")) || unit.price,
        dp: num(formData.get("dp")) || unit.dp,
        notes: String(formData.get("notes") ?? "") || null,
      },
    }),
    prisma.unit.update({ where: { id: unitId }, data: { status: "BOOKED" } }),
    prisma.lead.update({ where: { id: leadId }, data: { status: "BOOKING" } }),
  ]);

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/units");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}

async function assertBookingAccess(bookingId: string) {
  const session = await requireSession();
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");
  if (session.user.role === "SALES" && booking.salesId !== session.user.id) {
    throw new Error("Anda hanya bisa mengubah booking milik Anda sendiri.");
  }
  return booking;
}

export async function updateBooking(bookingId: string, formData: FormData) {
  await assertBookingAccess(bookingId);

  const bookingFee = num(formData.get("bookingFee"));
  if (bookingFee <= 0) throw new Error("Booking fee harus lebih dari 0.");

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      bookingFee,
      price: num(formData.get("price")) || undefined,
      dp: num(formData.get("dp")) || undefined,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function addBookingPayment(bookingId: string, formData: FormData) {
  const booking = await assertBookingAccess(bookingId);
  const amount = num(formData.get("amount"));
  if (amount <= 0) throw new Error("Jumlah pembayaran harus lebih dari 0.");

  await prisma.bookingPayment.create({
    data: {
      bookingId,
      amount,
      method: String(formData.get("method") ?? "") || null,
    },
  });

  const payments = await prisma.bookingPayment.aggregate({
    _sum: { amount: true },
    where: { bookingId },
  });
  const totalPaid = payments._sum.amount ?? 0;
  const paymentStatus = totalPaid >= booking.dp ? "PAID" : totalPaid > 0 ? "PARTIAL" : "PENDING";

  await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus } });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
}

export async function deleteBooking(bookingId: string) {
  await requireRole(["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "ADMIN"]);
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking tidak ditemukan.");

  await prisma.$transaction([
    prisma.bookingPayment.deleteMany({ where: { bookingId } }),
    prisma.booking.delete({ where: { id: bookingId } }),
    prisma.unit.update({ where: { id: booking.unitId }, data: { status: "AVAILABLE" } }),
  ]);

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/units");
  revalidatePath("/dashboard");
}
