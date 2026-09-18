"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/guard";

async function assertOwnNotification(id: string) {
  const session = await requireSession();
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif || notif.userId !== session.user.id) {
    throw new Error("Notifikasi tidak ditemukan.");
  }
  return { session, notif };
}

export async function markNotificationRead(id: string) {
  await assertOwnNotification(id);
  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead() {
  const session = await requireSession();
  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
}

export async function deleteNotification(id: string) {
  await assertOwnNotification(id);
  await prisma.notification.delete({ where: { id } });
  revalidatePath("/dashboard/notifications");
}
