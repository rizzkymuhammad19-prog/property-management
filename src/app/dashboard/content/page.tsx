import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { ContentForm } from "@/components/content/content-form";
import { deleteContent } from "@/actions/content";
import { formatDate } from "@/lib/utils";
import { CAMPAIGN_PLATFORM_LABEL } from "@/lib/labels";

export default async function ContentPage() {
  const [contents, campaigns] = await Promise.all([
    prisma.content.findMany({
      include: { campaign: true },
      orderBy: { publishDate: "desc" },
    }),
    prisma.campaign.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Manajemen Konten</h1>
          <p className="text-sm text-gray-500">{contents.length} konten tercatat.</p>
        </div>
        <Modal
          title="Tambah Konten"
          size="lg"
          trigger={
            <Button size="sm" disabled={campaigns.length === 0}>
              <Plus className="h-4 w-4" /> Tambah Konten
            </Button>
          }
        >
          <ContentForm campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))} />
        </Modal>
      </div>

      {campaigns.length === 0 && (
        <p className="text-sm text-gray-500">
          Buat kampanye terlebih dahulu di modul Kampanye sebelum menambah konten.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kampanye</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Publish</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3">Leads</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contents.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-gray-800">{c.title}</td>
                <td className="px-4 py-3 text-gray-500">{c.campaign.name}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-brand-50 text-brand-700">{CAMPAIGN_PLATFORM_LABEL[c.platform]}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.publishDate ? formatDate(c.publishDate) : "-"}</td>
                <td className="px-4 py-3 text-gray-500">{c.views.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-gray-500">{c.engagement.toLocaleString("id-ID")}</td>
                <td className="px-4 py-3 text-gray-500">{c.leadsCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Modal
                      title="Edit Konten"
                      size="lg"
                      trigger={
                        <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                      }
                    >
                      <ContentForm
                        campaigns={campaigns.map((cm) => ({ id: cm.id, name: cm.name }))}
                        defaults={{
                          id: c.id,
                          title: c.title,
                          campaignId: c.campaignId,
                          platform: c.platform,
                          contentType: c.contentType,
                          publishDate: c.publishDate,
                          views: c.views,
                          reach: c.reach,
                          engagement: c.engagement,
                          leadsCount: c.leadsCount,
                          surveyCount: c.surveyCount,
                          bookingCount: c.bookingCount,
                          revenue: c.revenue,
                        }}
                      />
                    </Modal>
                    <ActionButton
                      action={deleteContent.bind(null, c.id)}
                      confirmMessage={`Hapus konten "${c.title}"?`}
                      icon={Trash2}
                      variant="danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {contents.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada konten.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
