import { Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";
import { ErrorPanel } from "@/components/ui/error-panel";
import { SalesTargetForm } from "@/components/sales/sales-target-form";
import { deleteSalesTarget } from "@/actions/sales-targets";
import { formatCompactRupiah } from "@/lib/utils";

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function SalesPage() {
  try {
  const period = currentPeriod();

  const [salesUsers, projects, targets] = await Promise.all([
    prisma.user.findMany({ where: { role: "SALES", active: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.salesTarget.findMany({ where: { period }, include: { user: true, project: true } }),
  ]);

  const performance = await Promise.all(
    salesUsers.map(async (sales) => {
      const [leadsCount, bookings, akadCount] = await Promise.all([
        prisma.lead.count({ where: { salesId: sales.id } }),
        prisma.booking.findMany({ where: { salesId: sales.id }, select: { price: true } }),
        prisma.lead.count({ where: { salesId: sales.id, status: "AKAD" } }),
      ]);
      const revenue = bookings.reduce((sum, b) => sum + b.price, 0);
      const target = targets.find((t) => t.userId === sales.id);
      const achievement =
        target?.targetRevenue && target.targetRevenue > 0
          ? Math.round((revenue / target.targetRevenue) * 100)
          : null;
      return {
        sales,
        leadsCount,
        bookingsCount: bookings.length,
        akadCount,
        revenue,
        target,
        achievement,
      };
    })
  );

  const teamTarget = targets.find((t) => !t.userId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Manajemen &amp; KPI Sales</h1>
          <p className="text-sm text-gray-500">Periode {period}</p>
        </div>
        <Modal
          title="Atur Target Sales"
          size="lg"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Atur Target
            </Button>
          }
        >
          <SalesTargetForm
            salesUsers={salesUsers.map((s) => ({ id: s.id, name: s.name }))}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
            defaultPeriod={period}
          />
        </Modal>
      </div>

      {teamTarget && (
        <div className="rounded-2xl border border-surface-border bg-white p-4 text-sm text-gray-600 shadow-card">
          Target tim periode ini: <span className="font-semibold text-gray-800">{formatCompactRupiah(teamTarget.targetRevenue)}</span>
          {teamTarget.targetAkad && <> · target akad <span className="font-semibold text-gray-800">{teamTarget.targetAkad}</span></>}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Leads</th>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Akad</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Target Revenue</th>
              <th className="px-4 py-3">Capaian</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performance.map((p) => (
              <tr key={p.sales.id} className="transition-colors hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-gray-800">{p.sales.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.leadsCount}</td>
                <td className="px-4 py-3 text-gray-500">{p.bookingsCount}</td>
                <td className="px-4 py-3 text-gray-500">{p.akadCount}</td>
                <td className="px-4 py-3 text-gray-500">{formatCompactRupiah(p.revenue)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {p.target?.targetRevenue ? formatCompactRupiah(p.target.targetRevenue) : "-"}
                </td>
                <td className="px-4 py-3">
                  {p.achievement !== null ? (
                    <span
                      className={
                        p.achievement >= 100
                          ? "font-semibold text-emerald-600"
                          : p.achievement >= 60
                          ? "font-semibold text-amber-600"
                          : "font-semibold text-red-500"
                      }
                    >
                      {p.achievement}%
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Modal
                      title={`Atur Target — ${p.sales.name}`}
                      size="lg"
                      trigger={
                        <span className="cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                          Edit Target
                        </span>
                      }
                    >
                      <SalesTargetForm
                        salesUsers={salesUsers.map((s) => ({ id: s.id, name: s.name }))}
                        projects={projects.map((pr) => ({ id: pr.id, name: pr.name }))}
                        defaultUserId={p.sales.id}
                        defaultPeriod={period}
                      />
                    </Modal>
                    {p.target && (
                      <ActionButton
                        action={deleteSalesTarget.bind(null, p.target.id)}
                        confirmMessage="Hapus target sales ini?"
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
  } catch (error) {
    return <ErrorPanel error={error} label="Manajemen & KPI Sales" />;
  }
}
