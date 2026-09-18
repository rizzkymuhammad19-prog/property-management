"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSurvey } from "@/actions/surveys";
import { Field, TextInput, Select, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export function SurveyForm({
  onDone,
  leads,
  units,
}: {
  onDone: () => void;
  leads: { id: string; name: string }[];
  units: { id: string; label: string }[];
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
        await createSurvey(formData);
        onDone();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan survei.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Lead" required>
        <Select name="leadId" required defaultValue="">
          <option value="" disabled>
            - Pilih lead -
          </option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Unit yang Disurvei" required>
        <Select name="unitId" required defaultValue="">
          <option value="" disabled>
            - Pilih unit -
          </option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Jadwal Survei" required>
        <TextInput name="scheduledAt" type="datetime-local" required />
      </Field>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Jadwalkan Survei"}
        </Button>
      </div>
    </form>
  );
}
