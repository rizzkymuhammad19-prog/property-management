import { getServerSession } from "next-auth";
import { ClipboardCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { ErrorPanel } from "@/components/ui/error-panel";
import { SurveyForm } from "@/components/surveys/survey-form";
import { CompleteSurveyForm } from "@/components/surveys/complete-survey-form";
import { deleteSurvey } from "@/actions/surveys";
import { formatDate, toDatetimeLocal } from "@/lib/utils";

export default async function SurveysPage() {
  try {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  const isSales = role === "SALES";

  const [surveys, leads, units] = await Promise.all([
    prisma.survey.findMany({
      where: isSales ? { lead: { salesId: session?.user.id } } : {},
      include: { lead: true, unit: { include: { block: true } } },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    }),
    prisma.lead.findMany({
      where: isSales ? { salesId: session?.user.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.unit.findMany({
      include: { block: true },
      orderBy: [{ block: { name: "asc" } }, { unitNumber: "asc" }],
    }),
  ]);

  const unitOptions = units.map((u) => ({
    id: u.id,
    label: `Blok ${u.block.name} No. ${u.unitNumber} — ${u.type}`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Survei</h1>
          <p className="text-sm text-gray-500">{surveys.length} jadwal survei unit.</p>
        </div>
        <Modal
          title="Jadwalkan Survei Unit"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Jadwalkan Survei
            </Button>
          }
        >
          <SurveyForm leads={leads} units={unitOptions} />
        </Modal>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Jadwal</th>
              <th className="px-4 py-3">Hasil</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {surveys.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-gray-800">{s.lead.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  Blok {s.unit.block.name} No. {s.unit.unitNumber}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(s.scheduledAt)}</td>
                <td className="max-w-[220px] truncate px-4 py-3 text-gray-500">{s.result ?? "-"}</td>
                <td className="px-4 py-3">
                  {s.completedAt ? (
                    <Badge className="bg-emerald-100 text-emerald-700">Selesai</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700">Terjadwal</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Modal
                      title="Edit Survei"
                      description={`Lead: ${s.lead.name}`}
                      trigger={
                        <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                      }
                    >
                      <SurveyForm
                        leads={leads}
                        units={unitOptions}
                        defaults={{
                          id: s.id,
                          leadId: s.leadId,
                          unitId: s.unitId,
                          scheduledAt: toDatetimeLocal(s.scheduledAt),
                        }}
                      />
                    </Modal>
                    {!s.completedAt && (
                      <Modal
                        title="Tandai Survei Selesai"
                        description={`Lead: ${s.lead.name}`}
                        trigger={
                          <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                            <ClipboardCheck className="h-3.5 w-3.5" /> Selesai
                          </span>
                        }
                      >
                        <CompleteSurveyForm surveyId={s.id} />
                      </Modal>
                    )}
                    <ActionButton
                      action={deleteSurvey.bind(null, s.id)}
                      confirmMessage="Hapus jadwal survei ini?"
                      icon={Trash2}
                      variant="danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {surveys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada jadwal survei.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  } catch (error) {
    return <ErrorPanel error={error} label="Survei" />;
  }
}
