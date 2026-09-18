"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFollowUp } from "@/actions/follow-ups";
import { Field, TextInput, Select, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { CONTACT_METHOD_LABEL } from "@/lib/labels";

export function FollowUpForm({
  onDone,
  leads,
}: {
  onDone: () => void;
  leads: { id: string; name: string }[];
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
        await createFollowUp(formData);
        onDone();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan follow-up.");
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
      <Field label="Jadwal" required>
        <TextInput name="scheduledAt" type="datetime-local" required />
      </Field>
      <Field label="Metode Kontak">
        <Select name="contactMethod" defaultValue="WHATSAPP">
          {Object.entries(CONTACT_METHOD_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Catatan">
        <Textarea name="notes" placeholder="Rencana pembahasan / hasil follow-up sebelumnya" />
      </Field>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Jadwalkan Follow Up"}
        </Button>
      </div>
    </form>
  );
}
