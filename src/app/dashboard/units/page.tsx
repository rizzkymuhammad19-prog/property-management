import { prisma } from "@/lib/prisma";
import { UnitStatusBadge } from "@/components/status-badge";
import { ErrorPanel } from "@/components/ui/error-panel";
import { formatCompactRupiah } from "@/lib/utils";
import { UNIT_STATUS_LABEL } from "@/lib/labels";

export default async function UnitsPage() {
  try {
  const blocks = await prisma.block.findMany({
    include: { units: { orderBy: { unitNumber: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Properti &amp; Unit</h1>
        <p className="text-sm text-gray-500">Site plan — arahkan kursor ke unit untuk detail tipe &amp; harga</p>
      </div>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-surface-border bg-white p-4 text-xs text-gray-500 shadow-card">
        <Legend color="bg-green-500" label={UNIT_STATUS_LABEL.AVAILABLE} />
        <Legend color="bg-yellow-500" label={UNIT_STATUS_LABEL.HOLD} />
        <Legend color="bg-blue-500" label={UNIT_STATUS_LABEL.BOOKED} />
        <Legend color="bg-purple-500" label={UNIT_STATUS_LABEL.KPR} />
        <Legend color="bg-gray-400" label={UNIT_STATUS_LABEL.SOLD} />
      </div>

      {blocks.map((block) => (
        <div key={block.id} className="rounded-2xl border border-surface-border bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-gradient text-[11px] font-bold text-white">
              {block.name}
            </span>
            <span className="text-sm font-semibold text-gray-700">Blok {block.name}</span>
            <span className="text-xs text-gray-400">({block.units.length} unit)</span>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-10">
            {block.units.map((unit) => (
              <div
                key={unit.id}
                title={`${unit.type} · ${formatCompactRupiah(unit.price)}`}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-surface-border p-2 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="text-xs font-semibold text-gray-700">
                  {unit.unitNumber}
                </div>
                <UnitStatusBadge status={unit.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  } catch (error) {
    return <ErrorPanel error={error} label="Properti & Unit" />;
  }
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
