import type { LeadStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorPanel } from "@/components/ui/error-panel";
import { RevenueTrendChart, FunnelChart, SalesLeaderboardChart } from "@/components/reports/charts";
import { LEAD_STATUS_LABEL } from "@/lib/labels";
import { formatCompactRupiah } from "@/lib/utils";

const MONTH_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportsPage() {
  try {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [bookings, leadsByStatus, salesUsers] = await Promise.all([
    prisma.booking.findMany({
      where: { bookingDate: { gte: sixMonthsAgo } },
      select: { price: true, bookingDate: true },
    }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.findMany({ where: { role: "SALES", active: true } }),
  ]);

  // Build the last 6 months buckets in order, even if empty.
  const months: { key: string; label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({ key: monthKey(d), label: MONTH_LABEL[d.getMonth()], revenue: 0 });
  }
  for (const b of bookings) {
    const key = monthKey(b.bookingDate);
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.revenue += b.price;
  }

  const funnelOrder: LeadStatus[] = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "SURVEY",
    "FOLLOW_UP",
    "BOOKING",
    "KPR",
    "AKAD",
    "LOST",
  ];
  const statusCountMap = new Map<LeadStatus, number>(leadsByStatus.map((r) => [r.status, r._count._all]));
  const funnelData = funnelOrder.map((status) => ({
    status: LEAD_STATUS_LABEL[status],
    count: statusCountMap.get(status) ?? 0,
  }));

  const leaderboard = await Promise.all(
    salesUsers.map(async (u) => {
      const revenue = await prisma.booking.aggregate({ _sum: { price: true }, where: { salesId: u.id } });
      return { name: u.name.split(" ")[0], revenue: revenue._sum.price ?? 0 };
    })
  );
  leaderboard.sort((a, b) => b.revenue - a.revenue);

  const totalRevenue6mo = months.reduce((sum, m) => sum + m.revenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Laporan</h1>
        <p className="text-sm text-gray-500">Analitik penjualan &amp; funnel 6 bulan terakhir.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren Revenue Booking ({formatCompactRupiah(totalRevenue6mo)} / 6 bulan)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueTrendChart data={months.map((m) => ({ month: m.label, revenue: m.revenue }))} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funnel Konversi Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnelData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard Revenue Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <SalesLeaderboardChart data={leaderboard} />
            ) : (
              <p className="text-sm text-gray-400">Belum ada data sales.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
  } catch (error) {
    return <ErrorPanel error={error} label="Laporan" />;
  }
}
