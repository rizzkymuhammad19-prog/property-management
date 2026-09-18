"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generic button that calls a bound Server Action, shows a pending state,
 * and refreshes the current route's server data on success. Used for
 * delete / mark-complete / status-change actions across every module.
 */
export function ActionButton({
  action,
  confirmMessage,
  icon: Icon,
  label,
  variant = "ghost",
  className,
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  icon?: LucideIcon;
  label?: string;
  variant?: "ghost" | "danger" | "solid";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const style = {
    ghost: "text-gray-500 hover:bg-surface-muted",
    danger: "text-red-500 hover:bg-red-50",
    solid: "bg-brand-gradient text-white shadow-glow",
  }[variant];

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirmMessage && !window.confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            try {
              await action();
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
            }
          });
        }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
          style,
          className
        )}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </button>
      {error && <span className="mt-0.5 text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
