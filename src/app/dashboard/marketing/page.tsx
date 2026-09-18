import Link from "next/link";
import { Megaphone, Target, Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorPanel } from "@/components/ui/error-panel";
import { SOURCE_CHANNEL_LABEL, CAMPAIGN_PLATFORM_LABEL } from "@/lib/labels";
import { formatCompactRupiah } from "@/lib/utils";

export default async function MarketingPage() {
  try {
  const [leadsBySource, campaigns, topContent, totalLeads] = await Promise.all([
    prisma.lead.groupBy({ by: ["sourceId"], _count: { _all: true } }),
    prisma.campaign.findMany({
      include: { leads: { select: { id: true } }, content: { select: { id: true, revenue: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.content.findMany({ orderBy: { engagement: "desc" }, take: 5, include: { campaign: true } }),
    prisma.lead.count(),
  ]);

  const sources = await prisma.leadSource.findMany();
  const sourceMap = new Map(sources.map((s) => [s.id, s.name]));
  const sourceRows = leadsBySource
    .map((row) => ({
      label: row.sourceId ? SOURCE_CHANNEL_LABEL[sourceMap.get(row.sourceId) ?? ""] ?? "Lainnya" : "Tidak diketahui",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...sourceRows.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Marketing</h1>
          <p className="text-sm text-gray-500">Ringkasan performa akuisisi leads &amp; konten.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/dashboard/campaigns"
            className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-white px-3 py-2 font-medium text-gray-600 hover:bg-surface-subtle"
          >
            <Target className="h-4 w-4" /> Kampanye
          </Link>
          <Link
            href="/dashboard/content"
            className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-white px-3 py-2 font-medium text-gray-600 hover:bg-surface-subtle"
          >
            <ImageIcon className="h-4 w-4" /> Konten
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads berdasarkan Sumber ({totalLeads} total)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {sourceRows.map((row) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-32 flex-shrink-0 truncate text-xs text-gray-500">{row.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${(row.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 flex-shrink-0 text-right text-xs font-semibold text-gray-700">{row.count}</span>
            </div>
          ))}
          {sourceRows.length === 0 && <p className="text-sm text-gray-400">Belum ada data leads.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-brand-500" /> Kampanye Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-surface-subtle px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                  <p className="text-[11px] text-gray-400">{CAMPAIGN_PLATFORM_LABEL[c.platform]}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{c.leads.length} leads</div>
                  <div>{c.content.length} konten</div>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && <p className="text-sm text-gray-400">Belum ada kampanye.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-brand-500" /> Konten Paling Engaging
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topContent.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-surface-subtle px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.title}</p>
                  <p className="text-[11px] text-gray-400">{c.campaign.name}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{c.engagement.toLocaleString("id-ID")} engagement</div>
                  <div>{formatCompactRupiah(c.revenue)}</div>
                </div>
              </div>
            ))}
            {topContent.length === 0 && <p className="text-sm text-gray-400">Belum ada konten.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  } catch (error) {
    return <ErrorPanel error={error} label="Marketing" />;
  }
}
