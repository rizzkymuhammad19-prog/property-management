export function ModulePlaceholder({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Modul ini masuk di {phase} pada roadmap pengembangan. Struktur data dan
        RBAC-nya sudah siap di database, tinggal dibangun UI-nya.
      </p>
    </div>
  );
}
