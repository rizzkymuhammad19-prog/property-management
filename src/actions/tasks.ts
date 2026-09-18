"use server";

import { revalidatePath } from "next/cache";
import type { LeadPriority, TaskStatus, TaskType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/guard";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "SALES"] as const;

export async function createTask(formData: FormData) {
  const session = await requireRole([...ALLOWED_ROLES]);

  const type = String(formData.get("type") ?? "") as TaskType;
  if (!type) throw new Error("Jenis tugas wajib dipilih.");

  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const leadId = String(formData.get("leadId") ?? "") || null;
  const assignedTo =
    session.user.role === "SALES" ? session.user.id : String(formData.get("userId") ?? session.user.id);

  await prisma.task.create({
    data: {
      leadId,
      userId: assignedTo,
      type,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      priority: (String(formData.get("priority") ?? "MEDIUM") as LeadPriority) || "MEDIUM",
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/dashboard/tasks");
}

async function assertOwnTask(taskId: string) {
  const session = await requireSession();
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Tugas tidak ditemukan.");
  if (session.user.role === "SALES" && task.userId !== session.user.id) {
    throw new Error("Anda hanya bisa mengubah tugas Anda sendiri.");
  }
  return task;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await assertOwnTask(taskId);
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath("/dashboard/tasks");
}

export async function deleteTask(taskId: string) {
  await assertOwnTask(taskId);
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/dashboard/tasks");
}
