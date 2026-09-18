// Rendered instead of a page's normal content when its data-fetching throws.
// Next.js hides the real error message behind a generic "Application error"
// screen in production for uncaught Server Component errors (only a "digest"
// is shown, and the real message only lives in the hosting provider's server
// logs). By catching the error ourselves inside each page and rendering it
// here, the actual message + stack show up directly in the browser — no
// server log access needed to diagnose it.
export function ErrorPanel({ error, label }: { error: unknown; label?: string }) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">{label ?? "Halaman ini"}</h1>
        <p className="text-sm text-gray-500">Terjadi error saat memuat data halaman ini.</p>
      </div>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-semibold">Pesan error:</p>
        <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-white/60 p-2 font-mono text-xs">
          {message}
        </p>
        {stack && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold text-red-700">
              Detail teknis (stack trace) — screenshot bagian ini untuk dikirim
            </summary>
            <pre className="mt-1 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white/60 p-2 text-[11px] text-red-700">
              {stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
