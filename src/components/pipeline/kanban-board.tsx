"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LeadStatus } from "@prisma/client";
import { GripVertical, Phone } from "lucide-react";
import { updateLeadStatus } from "@/actions/leads";
import { LEAD_PRIORITY_LABEL, LEAD_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

export type KanbanLead = {
  id: string;
  name: string;
  whatsapp: string;
  status: LeadStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  salesName: string | null;
};

const COLUMNS: LeadStatus[] = [
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

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-red-500",
};

export function KanbanBoard({ leads: initialLeads, canDrag }: { leads: KanbanLead[]; canDrag: boolean }) {
  const [leads, setLeads] = useState(initialLeads);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const draggedId = useRef<string | null>(null);

  function handleDrop(status: LeadStatus) {
    setDragOverCol(null);
    const leadId = draggedId.current;
    if (!leadId) return;
    const current = leads.find((l) => l.id === leadId);
    if (!current || current.status === status) return;

    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, status);
      } finally {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const items = leads.filter((l) => l.status === col);
        return (
          <div
            key={col}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col);
            }}
            onDragLeave={() => setDragOverCol((c) => (c === col ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(col);
            }}
            className={cn(
              "flex w-64 flex-shrink-0 flex-col rounded-2xl border border-surface-border bg-surface-subtle p-2.5 transition-colors",
              dragOverCol === col && "border-brand-400 bg-brand-50/60"
            )}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                {LEAD_STATUS_LABEL[col]}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-500 shadow-sm">
                {items.length}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              {items.map((lead) => (
                <div
                  key={lead.id}
                  draggable={canDrag}
                  onDragStart={(e) => {
                    draggedId.current = lead.id;
                    e.dataTransfer.setData("text/plain", lead.id);
                  }}
                  className={cn(
                    "group rounded-xl border border-surface-border bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover",
                    canDrag && "cursor-grab active:cursor-grabbing"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
                    {canDrag && (
                      <GripVertical className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 group-hover:text-gray-400" />
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                    <Phone className="h-3 w-3" /> {lead.whatsapp}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span className={cn("h-1.5 w-1.5 rounded-full", PRIORITY_DOT[lead.priority])} />
                      {LEAD_PRIORITY_LABEL[lead.priority]}
                    </span>
                    <span className="text-[11px] text-gray-400">{lead.salesName ?? "-"}</span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-surface-border p-4 text-center text-[11px] text-gray-400">
                  Kosong
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
