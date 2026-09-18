import { getServerSession } from "next-auth";
import { Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard, type KanbanLead } from "@/components/pipeline/kanban-board";
import { Modal } from "@/components/ui/modal";
import { ErrorPanel } from "@/components/ui/error-panel";
import { LeadForm } from "@/components/leads/lead-form";
import { Button } from "@/components/ui/button";

export default async function PipelinePage() {
  try {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  const where = role === "SALES" ? { salesId: session?.user.id } : {};

  const [leads, projects, sources, salesUsers] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { sales: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.leadSource.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "SALES", active: true }, orderBy: { name: "asc" } }),
  ]);

  const kanbanLeads: KanbanLead[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    whatsapp: l.whatsapp,
    status: l.status,
    priority: l.priority,
    salesName: l.sales?.name ?? null,
  }));

  const canDrag = role !== undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Pipeline Penjualan</h1>
          <p className="text-sm text-gray-500">
            Drag kartu lead antar kolom untuk mengubah status secara langsung.
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

      <KanbanBoard leads={kanbanLeads} canDrag={canDrag} />
    </div>
  );
  } catch (error) {
    return <ErrorPanel error={error} label="Pipeline Penjualan" />;
  }
}
