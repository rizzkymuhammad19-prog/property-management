import { prisma } from "@/lib/prisma";
import { UnitStatusBadge } from "@/components/status-badge";
import { formatCompactRupiah } from "@/lib/utils";

export default async function UnitsPage() {
  const blocks = await prisma.block.findMany({
    include: { units: { orderBy: { unitNumber: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Properties & Units</h1>
        <p className="text-sm text-gray-500">Site plan — klik status untuk detail unit</p>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <Legend color="bg-green-500" label="AVAILABLE" />
        <Legend color="bg-yellow-500" label="HOLD" />
        <Legend color="bg-blue-500" label="BOOKED" />
        <Legend color="bg-purple-500" label="KPR" />
        <Legend color="bg-gray-400" label="SOLD" />
      </div>

      {blocks.map((block) => (
        <div key={block.id} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-gray-700">
            BLOCK {block.name}
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-10">
            {block.units.map((unit) => (
              <div
                key={unit.id}
                title={`${unit.type} · ${formatCompactRupiah(unit.price)}`}
                className="flex flex-col items-center gap-1 rounded-lg border border-gray-100 p-2 text-center hover:border-navy-300"
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
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
