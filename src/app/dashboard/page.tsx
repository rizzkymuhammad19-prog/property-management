import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactRupiah } from "@/lib/utils";

const UNIT_STATUS_COLOR: Record<string, string> = {
  AVAILABLE: "text-green-600",
  HOLD: "text-yellow-600",
  BOOKED: "text-blue-600",
  KPR: "text-purple-600",
  SOLD: "text-gray-500",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const [
    unitsByStatus,
    totalLeads,
    surveyCount,
    bookingCount,
    kprCount,
    akadCount,
    revenueAgg,
    period,
    overdueFollowUps,
    surveyedNoFollowUp,
    kprSlaBreaches,
  ] = await Promise.all([
    prisma.unit.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.count(),
    prisma.survey.count(),
    prisma.booking.count(),
    prisma.kprApplication.count(),
    prisma.unit.count({ where: { status: "SOLD" } }),
    prisma.booking.aggregate({ _sum: { price: true } }),
    currentPeriod(),
    prisma.followUp.count({
      where: { completedAt: null, scheduledAt: { lt: new Date() } },
    }),
    prisma.survey.count({
      where: {
        completedAt: { not: null },
        lead: { followUps: { none: {} } },
      },
    }),
    prisma.kprApplication.count({
      where: {
        status: { notIn: ["APPROVED", "REJECTED", "AKAD"] },
        slaDueAt: { lt: new Date() },
      },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of unitsByStatus) statusMap[row.status] = row._count._all;
  const totalUnits = Object.values(statusMap).reduce((a, b) => a + b, 0);

  const targets = await prisma.salesTarget.aggregate({
    _sum: { targetRevenue: true },
    where: { period },
  });
  const targetRevenue = targets._sum.targetRevenue ?? 0;
  const realizedRevenue = revenueAgg._sum.price ?? 0;
  const achievement = targetRevenue > 0 ? Math.round((realizedRevenue / targetRevenue) * 100) : 0;

  const attention: { label: string; count: number }[] = [
    { label: "Follow-up terlewat (overdue)", count: overdueFollowUps },
    { label: "Lead sudah survey tapi belum ada follow-up", count: surveyedNoFollowUp },
    { label: "Proses KPR melewati SLA", count: kprSlaBreaches },
  ].filter((a) => a.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Good afternoon{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="text-sm text-gray-500">
          PROPERTY MANAGEMENT — Property Command Center
        </p>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Inventory
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <KpiCard label="Total Unit" value={totalUnits} />
          {(["AVAILABLE", "HOLD", "BOOKED", "KPR", "SOLD"] as const).map((s) => (
            <KpiCard
              key={s}
              label={s}
              value={statusMap[s] ?? 0}
              valueClassName={UNIT_STATUS_COLOR[s]}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Sales Funnel
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <KpiCard label="Leads" value={totalLeads} />
          <KpiCard label="Survey" value={surveyCount} />
          <KpiCard label="Booking" value={bookingCount} />
          <KpiCard label="KPR" value={kprCount} />
          <KpiCard label="Akad" value={akadCount} />
          <KpiCard label="Revenue" value={formatCompactRupiah(realizedRevenue)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target vs Realisasi ({period})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-xs text-gray-400">Target</div>
              <div className="text-lg font-semibold text-gray-800">
                {formatCompactRupiah(targetRevenue)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Realisasi</div>
              <div className="text-lg font-semibold text-gray-800">
                {formatCompactRupiah(realizedRevenue)}
              </div>
            </div>
            <div className="min-w-[160px] flex-1">
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>Achievement</span>
                <span>{achievement}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-navy-700"
                  style={{ width: `${Math.min(achievement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚠ What Needs Attention</CardTitle>
        </CardHeader>
        <CardContent>
          {attention.length === 0 ? (
            <p className="text-sm text-gray-500">
              Tidak ada isu mendesak saat ini. Semua terpantau baik.
            </p>
          ) : (
            <ul className="space-y-2">
              {attention.map((a) => (
                <li
                  key={a.label}
                  className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm"
                >
                  <span className="text-gray-700">
                    <span className="font-semibold">{a.count}</span> {a.label}
                  </span>
                  <span className="text-xs font-medium text-navy-700">View →</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number | string;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-[11px] uppercase tracking-wide text-gray-400">
          {label}
        </div>
        <div className={`text-xl font-semibold text-gray-900 ${valueClassName ?? ""}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
