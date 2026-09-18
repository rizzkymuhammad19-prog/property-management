import { getServerSession } from "next-auth";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { FollowUpForm } from "@/components/follow-ups/follow-up-form";
import { markFollowUpComplete, deleteFollowUp } from "@/actions/follow-ups";
import { CONTACT_METHOD_LABEL } from "@/lib/labels";
import { cn, toDatetimeLocal } from "@/lib/utils";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function FollowUpsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  const isSales = role === "SALES";

  const [followUps, leads] = await Promise.all([
    prisma.followUp.findMany({
      where: isSales ? { userId: session?.user.id } : {},
      include: { lead: true, user: true },
      orderBy: { scheduledAt: "asc" },
      take: 100,
    }),
    prisma.lead.findMany({
      where: isSales ? { salesId: session?.user.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Pusat Follow Up</h1>
          <p className="text-sm text-gray-500">
            {isSales ? "Follow-up milik Anda." : `${followUps.length} follow-up terjadwal.`}
          </p>
        </div>
        <Modal
          title="Jadwalkan Follow Up"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Jadwalkan
            </Button>
          }
        >
          <FollowUpForm leads={leads} />
        </Modal>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Jadwal</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">PIC</th>
              <th className="px-4 py-3">Catatan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {followUps.map((f) => {
              const overdue = !f.completedAt && f.scheduledAt < now;
              return (
                <tr key={f.id} className="transition-colors hover:bg-surface-subtle">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.lead.name}</td>
                  <td
                    className={cn(
                      "px-4 py-3",
                      overdue ? "font-semibold text-red-600" : "text-gray-500"
                    )}
                  >
                    {formatDateTime(f.scheduledAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{CONTACT_METHOD_LABEL[f.contactMethod]}</td>
                  <td className="px-4 py-3 text-gray-500">{f.user.name}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-gray-500">{f.notes ?? "-"}</td>
                  <td className="px-4 py-3">
                    {f.completedAt ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Selesai</Badge>
                    ) : overdue ? (
                      <Badge className="bg-red-100 text-red-700">Terlewat</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700">Terjadwal</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Modal
                        title="Edit Follow Up"
                        trigger={
                          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                            <Pencil className="h-3.5 w-3.5" />
                          </span>
                        }
                      >
                        <FollowUpForm
                          leads={leads}
                          defaults={{
                            id: f.id,
                            leadId: f.leadId,
                            scheduledAt: toDatetimeLocal(f.scheduledAt),
                            contactMethod: f.contactMethod,
                            notes: f.notes,
                          }}
                        />
                      </Modal>
                      {!f.completedAt && (
                        <ActionButton
                          action={markFollowUpComplete.bind(null, f.id)}
                          icon={CheckCircle2}
                          label="Selesai"
                          variant="ghost"
                        />
                      )}
                      <ActionButton
                        action={deleteFollowUp.bind(null, f.id)}
                        confirmMessage="Hapus follow-up ini?"
                        icon={Trash2}
                        variant="danger"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {followUps.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada follow-up terjadwal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
