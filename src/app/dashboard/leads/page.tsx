import { getServerSession } from "next-auth";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ActionButton } from "@/components/action-button";
import { LeadForm } from "@/components/leads/lead-form";
import { deleteLead } from "@/actions/leads";
import { formatDate } from "@/lib/utils";
import { LEAD_STATUS_LABEL, LEAD_PRIORITY_LABEL } from "@/lib/labels";

const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-sky-100 text-sky-700",
  QUALIFIED: "bg-indigo-100 text-indigo-700",
  SURVEY: "bg-cyan-100 text-cyan-700",
  FOLLOW_UP: "bg-amber-100 text-amber-700",
  BOOKING: "bg-blue-100 text-blue-700",
  KPR: "bg-purple-100 text-purple-700",
  AKAD: "bg-emerald-100 text-emerald-700",
  LOST: "bg-red-100 text-red-700",
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;

  // Sales only ever sees their own leads — enforced here at the query level,
  // not just hidden in the UI.
  const where = role === "SALES" ? { salesId: session?.user.id } : {};

  const [leads, projects, sources, salesUsers] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { sales: true, source: true },
      orderBy: { tanggalMasuk: "desc" },
      take: 50,
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.leadSource.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "SALES", active: true }, orderBy: { name: "asc" } }),
  ]);

  const canDelete = role && ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "ADMIN"].includes(role);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Leads (CRM)</h1>
          <p className="text-sm text-gray-500">
            {role === "SALES"
              ? "Menampilkan leads milik Anda saja."
              : `Menampilkan ${leads.length} leads terbaru.`}
          </p>
        </div>
        <Modal
          title="Tambah Lead Baru"
          description="Data lead akan langsung tersinkron ke seluruh modul."
          size="lg"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Tambah Lead
            </Button>
          }
        >
          <LeadForm
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            sources={sources.map((s) => ({ id: s.id, name: s.name }))}
            salesUsers={salesUsers.map((s) => ({ id: s.id, name: s.name }))}
            showSalesPicker={role !== "SALES"}
          />
        </Modal>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Sumber</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Follow Up Berikutnya</th>
              <th className="px-4 py-3">Prioritas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="transition-colors hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                <td className="px-4 py-3 text-gray-500">{lead.source?.name ?? "-"}</td>
                <td className="px-4 py-3 text-gray-500">{lead.sales?.name ?? "-"}</td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLOR[lead.status]}>
                    {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(lead.nextFollowUp)}
                </td>
                <td className="px-4 py-3">
                  <Badge className={PRIORITY_COLOR[lead.priority]}>
                    {LEAD_PRIORITY_LABEL[lead.priority] ?? lead.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Modal
                      title="Edit Lead"
                      size="lg"
                      trigger={
                        <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                      }
                    >
                      <LeadForm
                        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
                        sources={sources.map((s) => ({ id: s.id, name: s.name }))}
                        salesUsers={salesUsers.map((s) => ({ id: s.id, name: s.name }))}
                        showSalesPicker={role !== "SALES"}
                        defaults={{
                          id: lead.id,
                          name: lead.name,
                          whatsapp: lead.whatsapp,
                          email: lead.email,
                          domisili: lead.domisili,
                          pekerjaan: lead.pekerjaan,
                          budget: lead.budget,
                          tipeRumahDiminati: lead.tipeRumahDiminati,
                          sourceId: lead.sourceId,
                          salesId: lead.salesId,
                          priority: lead.priority,
                          notes: lead.notes,
                        }}
                      />
                    </Modal>
                    {canDelete && (
                      <ActionButton
                        action={deleteLead.bind(null, lead.id)}
                        confirmMessage={`Hapus lead "${lead.name}"? Aksi ini tidak bisa dibatalkan.`}
                        icon={Trash2}
                        variant="danger"
                      />
                    )}
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
