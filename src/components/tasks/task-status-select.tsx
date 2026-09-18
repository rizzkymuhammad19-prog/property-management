"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TaskStatus } from "@prisma/client";
import { updateTaskStatus } from "@/actions/tasks";
import { TASK_STATUS_LABEL } from "@/lib/labels";

const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_COLOR: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as TaskStatus;
        startTransition(async () => {
          await updateTaskStatus(taskId, next);
          router.refresh();
        });
      }}
      className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50 ${STATUS_COLOR[status]}`}
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {TASK_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
