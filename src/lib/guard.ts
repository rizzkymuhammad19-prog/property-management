import { getServerSession } from "next-auth";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

/**
 * Every Server Action must call this first — the client can call an action
 * directly, so route-level middleware protection is not enough on its own.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Sesi tidak valid. Silakan login ulang.");
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new Error("Anda tidak punya akses untuk melakukan aksi ini.");
  }
  return session;
}
