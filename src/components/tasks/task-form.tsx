"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask, updateTask } from "@/actions/tasks";
import { Field, TextInput, Select, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";
import { TASK_TYPE_LABEL } from "@/lib/labels";

type TaskDefaults = {
  id?: string;
  type?: string;
  priority?: string;
  leadId?: string | null;
  dueDate?: string;
  userId?: string | null;
  notes?: string | null;
};

export function TaskForm({
  leads,
  users,
  showAssignee,
  defaults,
}: {
  leads: { id: string; name: string }[];
  users: { id: string; name: string }[];
  showAssignee: boolean;
  defaults?: TaskDefaults;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const close = useModalClose();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (isEdit && defaults?.id) {
          await updateTask(defaults.id, formData);
        } else {
          await createTask(formData);
        }
        close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan tugas.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Jenis Tugas" required>
          <Select name="type" required defaultValue={defaults?.type ?? "CALL"}>
            {Object.entries(TASK_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Prioritas">
          <Select name="priority" defaultValue={defaults?.priority ?? "MEDIUM"}>
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
          </Select>
        </Field>
        <Field label="Terkait Lead">
          <Select name="leadId" defaultValue={defaults?.leadId ?? ""}>
            <option value="">- Tidak terkait -</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Jatuh Tempo">
          <TextInput name="dueDate" type="date" defaultValue={defaults?.dueDate ?? ""} />
        </Field>
        {showAssignee && (
          <Field label="Ditugaskan ke" className="col-span-2">
            <Select name="userId" defaultValue={defaults?.userId ?? ""}>
              <option value="">- Saya sendiri -</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Catatan" className="col-span-2">
          <Textarea name="notes" defaultValue={defaults?.notes ?? ""} placeholder="Detail tugas (opsional)" />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Tugas"}
        </Button>
      </div>
    </form>
  );
}
