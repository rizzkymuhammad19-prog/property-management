import { Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { KprForm } from "@/components/kpr/kpr-form";
import { KprStatusSelect } from "@/components/kpr/kpr-status-select";
import { deleteKprApplication } from "@/actions/kpr";
import { formatDate, formatRupiah } from "@/lib/utils";
import { FINANCING_TYPE_LABEL } from "@/lib/labels";

export default async function KprPage() {
  const [applications, bookingsWithoutKpr] = await Promise.all([
    prisma.kprApplication.findMany({
      include: { booking: { include: { lead: true, unit: { include: { block: true } } } } },
      orderBy: { applicationDate: "desc" },
    }),
    prisma.booking.findMany({
      where: { kprApplications: { none: {} } },
      include: { lead: true, unit: { include: { block: true } } },
      orderBy: { bookingDate: "desc" },
    }),
  ]);

  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Manajemen KPR</h1>
          <p className="text-sm text-gray-500">{applications.length} pengajuan KPR / pembiayaan.</p>
        </div>
        <Modal
          title="Ajukan KPR Baru"
          size="lg"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Ajukan KPR
            </Button>
          }
        >
          {(close) => (
            <KprForm
              onDone={close}
              bookings={bookingsWithoutKpr.map((b) => ({
                id: b.id,
                label: `${b.lead.name} — Blok ${b.unit.block.name} No. ${b.unit.unitNumber}`,
              }))}
            />
          )}
        </Modal>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Bank</th>
              <th className="px-4 py-3">Skema</th>
              <th className="px-4 py-3">Plafond</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((k) => {
              const slaBreached = k.slaDueAt && k.slaDueAt < now && !["APPROVED", "REJECTED", "AKAD"].includes(k.status);
              return (
                <tr key={k.id} className="transition-colors hover:bg-surface-subtle">
                  <td className="px-4 py-3 font-medium text-gray-800">{k.booking.lead.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    Blok {k.booking.unit.block.name} No. {k.booking.unit.unitNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{k.bank}</td>
                  <td className="px-4 py-3 text-gray-500">{FINANCING_TYPE_LABEL[k.financingType]}</td>
                  <td className="px-4 py-3 text-gray-500">{formatRupiah(k.plafond)}</td>
                  <td className="px-4 py-3">
                    {k.slaDueAt ? (
                      <Badge className={slaBreached ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}>
                        {formatDate(k.slaDueAt)}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <KprStatusSelect kprId={k.id} status={k.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ActionButton
                      action={deleteKprApplication.bind(null, k.id)}
                      confirmMessage="Hapus pengajuan KPR ini?"
                      icon={Trash2}
                      variant="danger"
                    />
                  </td>
                </tr>
              );
            })}
            {applications.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada pengajuan KPR.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
