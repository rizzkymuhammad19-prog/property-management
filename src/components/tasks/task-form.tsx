"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/actions/tasks";
import { Field, TextInput, Select, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { TASK_TYPE_LABEL } from "@/lib/labels";

export function TaskForm({
  onDone,
  leads,
  users,
  showAssignee,
}: {
  onDone: () => void;
  leads: { id: string; name: string }[];
  users: { id: string; name: string }[];
  showAssignee: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createTask(formData);
        onDone();
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
          <Select name="type" required defaultValue="CALL">
            {Object.entries(TASK_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Prioritas">
          <Select name="priority" defaultValue="MEDIUM">
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
          </Select>
        </Field>
        <Field label="Terkait Lead">
          <Select name="leadId" defaultValue="">
            <option value="">- Tidak terkait -</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Jatuh Tempo">
          <TextInput name="dueDate" type="date" />
        </Field>
        {showAssignee && (
          <Field label="Ditugaskan ke" className="col-span-2">
            <Select name="userId" defaultValue="">
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
          <Textarea name="notes" placeholder="Detail tugas (opsional)" />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Tambah Tugas"}
        </Button>
      </div>
    </form>
  );
}
