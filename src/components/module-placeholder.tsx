import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

export function ModulePlaceholder({
  title,
  phase,
  icon: Icon = Construction,
}: {
  title: string;
  phase: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-white text-center shadow-card">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" />
      </span>
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <p className="mt-1.5 max-w-sm text-sm text-gray-500">
        Modul ini masuk di <span className="font-semibold text-gray-700">{phase}</span> pada
        roadmap pengembangan. Struktur data dan RBAC-nya sudah siap di database, tinggal
        dibangun tampilannya.
      </p>
    </div>
  );
}
