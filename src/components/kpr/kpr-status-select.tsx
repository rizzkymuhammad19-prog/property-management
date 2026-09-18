"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { KprStatus } from "@prisma/client";
import { updateKprStatus } from "@/actions/kpr";
import { KPR_STATUS_LABEL } from "@/lib/labels";

const STATUS_ORDER: KprStatus[] = ["SUBMITTED", "ANALYSIS", "SURVEY_BANK", "APPROVED", "REJECTED", "AKAD"];

export function KprStatusSelect({ kprId, status }: { kprId: string; status: KprStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as KprStatus;
        startTransition(async () => {
          await updateKprStatus(kprId, next);
          router.refresh();
        });
      }}
      className="rounded-lg border border-surface-border bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {KPR_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
