"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guard";

export async function createUser(formData: FormData) {
  await requireRole(["SUPER_ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!name || !email || !password || !role) {
    throw new Error("Nama, email, password, dan role wajib diisi.");
  }
  if (password.length < 6) throw new Error("Password minimal 6 karakter.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email sudah terdaftar.");

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      phone: String(formData.get("phone") ?? "") || null,
      area: String(formData.get("area") ?? "") || null,
    },
  });

  revalidatePath("/dashboard/settings");
}

export async function updateUser(userId: string, formData: FormData) {
  await requireRole(["SUPER_ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as Role;
  if (!name || !role) throw new Error("Nama dan role wajib diisi.");

  const password = String(formData.get("password") ?? "");

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      role,
      phone: String(formData.get("phone") ?? "") || null,
      area: String(formData.get("area") ?? "") || null,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath("/dashboard/settings");
}

export async function toggleUserActive(userId: string, active: boolean) {
  const session = await requireRole(["SUPER_ADMIN"]);
  if (session.user.id === userId && !active) {
    throw new Error("Anda tidak bisa menonaktifkan akun Anda sendiri.");
  }
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/dashboard/settings");
}
