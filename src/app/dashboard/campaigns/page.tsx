import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { deleteCampaign } from "@/actions/campaigns";
import { formatDate, formatCompactRupiah } from "@/lib/utils";
import { CAMPAIGN_PLATFORM_LABEL } from "@/lib/labels";

export default async function CampaignsPage() {
  const [campaigns, projects] = await Promise.all([
    prisma.campaign.findMany({
      include: { project: true, leads: { select: { id: true } }, content: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Kampanye Marketing</h1>
          <p className="text-sm text-gray-500">{campaigns.length} kampanye tercatat.</p>
        </div>
        <Modal
          title="Buat Kampanye Baru"
          size="lg"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Buat Kampanye
            </Button>
          }
        >
          {(close) => (
            <CampaignForm onDone={close} projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
          )}
        </Modal>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400">{c.project.name}</p>
              </div>
              <Badge className="bg-brand-50 text-brand-700">{CAMPAIGN_PLATFORM_LABEL[c.platform]}</Badge>
            </div>
            {c.objective && <p className="mb-2 text-xs text-gray-500">{c.objective}</p>}
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>Budget: <span className="font-semibold text-gray-700">{c.budget ? formatCompactRupiah(c.budget) : "-"}</span></div>
              <div>Leads: <span className="font-semibold text-gray-700">{c.leads.length}</span></div>
              <div>Konten: <span className="font-semibold text-gray-700">{c.content.length}</span></div>
              <div>
                Periode:{" "}
                <span className="font-semibold text-gray-700">
                  {c.startDate ? formatDate(c.startDate) : "-"}
                  {c.endDate ? ` – ${formatDate(c.endDate)}` : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 border-t border-surface-border pt-2">
              <Modal
                title="Edit Kampanye"
                size="lg"
                trigger={
                  <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </span>
                }
              >
                {(close) => (
                  <CampaignForm
                    onDone={close}
                    projects={projects.map((p) => ({ id: p.id, name: p.name }))}
                    defaults={{
                      id: c.id,
                      name: c.name,
                      projectId: c.projectId,
                      platform: c.platform,
                      objective: c.objective,
                      budget: c.budget,
                      startDate: c.startDate,
                      endDate: c.endDate,
                    }}
                  />
                )}
              </Modal>
              <ActionButton
                action={deleteCampaign.bind(null, c.id)}
                confirmMessage={`Hapus kampanye "${c.name}"? Konten terkait ikut terhapus.`}
                icon={Trash2}
                variant="danger"
              />
            </div>
          </div>
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-surface-border p-8 text-center text-sm text-gray-400">
            Belum ada kampanye.
          </div>
        )}
      </div>
    </div>
  );
}
