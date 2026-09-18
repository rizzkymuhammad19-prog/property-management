import { Pencil, Plus, Power, PowerOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { UserForm } from "@/components/settings/user-form";
import { toggleUserActive } from "@/actions/users";
import { ROLE_LABEL } from "@/lib/rbac";

export default async function SettingsPage() {
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Pengaturan — Manajemen User</h1>
          <p className="text-sm text-gray-500">{users.length} akun terdaftar di sistem.</p>
        </div>
        <Modal
          title="Tambah User Baru"
          size="lg"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Tambah User
            </Button>
          }
        >
          <UserForm />
        </Modal>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-brand-50 text-brand-700">{ROLE_LABEL[u.role]}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.phone ?? "-"}</td>
                <td className="px-4 py-3">
                  {u.active ? (
                    <Badge className="bg-emerald-100 text-emerald-700">Aktif</Badge>
                  ) : (
                    <Badge className="bg-gray-200 text-gray-600">Nonaktif</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Modal
                      title={`Edit User — ${u.name}`}
                      size="lg"
                      trigger={
                        <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                      }
                    >
                      <UserForm
                        defaults={{ id: u.id, name: u.name, role: u.role, phone: u.phone, area: u.area }}
                      />
                    </Modal>
                    <ActionButton
                      action={toggleUserActive.bind(null, u.id, !u.active)}
                      confirmMessage={
                        u.active ? `Nonaktifkan akun ${u.name}?` : `Aktifkan kembali akun ${u.name}?`
                      }
                      icon={u.active ? PowerOff : Power}
                      variant={u.active ? "danger" : "ghost"}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
