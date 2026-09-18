import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactRupiah } from "@/lib/utils";
import { UNIT_STATUS_LABEL } from "@/lib/labels";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Handshake,
  Home,
  Landmark,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

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

  const attention: { label: string; count: number; icon: typeof AlertTriangle }[] = [
    { label: "follow-up terlewat (overdue)", count: overdueFollowUps, icon: AlertTriangle },
    { label: "lead sudah survei tapi belum ada follow-up", count: surveyedNoFollowUp, icon: Users },
    { label: "proses KPR melewati batas waktu (SLA)", count: kprSlaBreaches, icon: Landmark },
  ].filter((a) => a.count > 0);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {greeting()}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Ringkasan performa penjualan &amp; marketing PROPERTY MANAGEMENT hari ini.
        </p>
      </div>

      <div>
        <SectionLabel icon={Home} text="Inventori Unit" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <KpiCard label="Total Unit" value={totalUnits} icon={Building2} />
          {(["AVAILABLE", "HOLD", "BOOKED", "KPR", "SOLD"] as const).map((s) => (
            <KpiCard
              key={s}
              label={UNIT_STATUS_LABEL[s]}
              value={statusMap[s] ?? 0}
              valueClassName={UNIT_STATUS_COLOR[s]}
            />
          ))}
        </div>
      </div>

      <div>
        <SectionLabel icon={TrendingUp} text="Funnel Penjualan" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <KpiCard label="Leads" value={totalLeads} icon={Users} />
          <KpiCard label="Survei" value={surveyCount} />
          <KpiCard label="Booking" value={bookingCount} />
          <KpiCard label="KPR" value={kprCount} />
          <KpiCard label="Akad" value={akadCount} icon={Handshake} />
          <KpiCard label="Revenue" value={formatCompactRupiah(realizedRevenue)} icon={Wallet} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target vs Realisasi ({period})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <div className="text-xs text-gray-400">Target</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCompactRupiah(targetRevenue)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Realisasi</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCompactRupiah(realizedRevenue)}
              </div>
            </div>
            <div className="min-w-[180px] flex-1">
              <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                <span>Capaian</span>
                <span className="font-semibold text-brand-600">{achievement}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${Math.min(achievement, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Perlu Perhatian
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attention.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Tidak ada isu mendesak saat ini. Semua terpantau baik.
            </div>
          ) : (
            <ul className="space-y-2">
              {attention.map((a) => (
                <li
                  key={a.label}
                  className="flex items-center justify-between rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2.5 text-gray-700">
                    <a.icon className="h-4 w-4 flex-shrink-0 text-amber-500" />
                    <span>
                      <span className="font-semibold">{a.count}</span> {a.label}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
                    Lihat <ArrowRight className="h-3 w-3" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: typeof Home; text: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </div>
  );
}

function KpiCard({
  label,
  value,
  valueClassName,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  valueClassName?: string;
  icon?: typeof Home;
}) {
  return (
    <Card className="transition-shadow hover:shadow-card-hover">
      <CardContent className="flex items-center justify-between p-3.5">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-400">
            {label}
          </div>
          <div className={`text-xl font-bold text-gray-900 ${valueClassName ?? ""}`}>
            {value}
          </div>
        </div>
        {Icon && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-gray-400">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}
