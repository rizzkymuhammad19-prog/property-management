import { cn } from "@/lib/utils";
import { UNIT_STATUS_LABEL } from "@/lib/labels";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  HOLD: "bg-yellow-100 text-yellow-700",
  BOOKED: "bg-blue-100 text-blue-700",
  KPR: "bg-purple-100 text-purple-700",
  SOLD: "bg-gray-200 text-gray-700",
};

export function UnitStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLE[status] ?? "bg-gray-100 text-gray-600"
      )}
    >
      {UNIT_STATUS_LABEL[status] ?? status}
    </span>
  );
}
