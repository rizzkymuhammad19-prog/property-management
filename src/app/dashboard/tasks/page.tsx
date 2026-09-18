import { getServerSession } from "next-auth";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskStatusSelect } from "@/components/tasks/task-status-select";
import { deleteTask } from "@/actions/tasks";
import { formatDate, toDateInput } from "@/lib/utils";
import { TASK_TYPE_LABEL, LEAD_PRIORITY_LABEL } from "@/lib/labels";

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  const isSales = role === "SALES";

  const [tasks, leads, users] = await Promise.all([
    prisma.task.findMany({
      where: isSales ? { userId: session?.user.id } : {},
      include: { lead: true, user: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
    prisma.lead.findMany({
      where: isSales ? { salesId: session?.user.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Manajemen Tugas</h1>
          <p className="text-sm text-gray-500">
            {isSales ? "Tugas milik Anda." : `${tasks.length} tugas tercatat.`}
          </p>
        </div>
        <Modal
          title="Tambah Tugas"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Tambah Tugas
            </Button>
          }
        >
          {(close) => (
            <TaskForm
              onDone={close}
              leads={leads}
              users={users.map((u) => ({ id: u.id, name: u.name }))}
              showAssignee={!isSales}
            />
          )}
        </Modal>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">PIC</th>
              <th className="px-4 py-3">Jatuh Tempo</th>
              <th className="px-4 py-3">Prioritas</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-gray-800">{TASK_TYPE_LABEL[t.type]}</td>
                <td className="px-4 py-3 text-gray-500">{t.lead?.name ?? "-"}</td>
                <td className="px-4 py-3 text-gray-500">{t.user.name}</td>
                <td className="px-4 py-3 text-gray-500">{t.dueDate ? formatDate(t.dueDate) : "-"}</td>
                <td className="px-4 py-3">
                  <Badge className={PRIORITY_COLOR[t.priority]}>{LEAD_PRIORITY_LABEL[t.priority]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <TaskStatusSelect taskId={t.id} status={t.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Modal
                      title="Edit Tugas"
                      trigger={
                        <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                      }
                    >
                      {(close) => (
                        <TaskForm
                          onDone={close}
                          leads={leads}
                          users={users.map((u) => ({ id: u.id, name: u.name }))}
                          showAssignee={!isSales}
                          defaults={{
                            id: t.id,
                            type: t.type,
                            priority: t.priority,
                            leadId: t.leadId,
                            dueDate: toDateInput(t.dueDate),
                            userId: t.userId,
                            notes: t.notes,
                          }}
                        />
                      )}
                    </Modal>
                    <ActionButton
                      action={deleteTask.bind(null, t.id)}
                      confirmMessage="Hapus tugas ini?"
                      icon={Trash2}
                      variant="danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada tugas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
