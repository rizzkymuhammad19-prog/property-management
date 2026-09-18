"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLead } from "@/actions/leads";
import { Field, TextInput, Select, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export function LeadForm({
  onDone,
  projects,
  sources,
  salesUsers,
  showSalesPicker,
}: {
  onDone: () => void;
  projects: { id: string; name: string }[];
  sources: { id: string; name: string }[];
  salesUsers: { id: string; name: string }[];
  showSalesPicker: boolean;
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
        await createLead(formData);
        onDone();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan lead.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama" required className="col-span-2">
          <TextInput name="name" required placeholder="Nama calon pembeli" />
        </Field>
        <Field label="No. WhatsApp" required>
          <TextInput name="whatsapp" required placeholder="08xxxxxxxxxx" />
        </Field>
        <Field label="Email">
          <TextInput name="email" type="email" placeholder="opsional" />
        </Field>
        <Field label="Proyek" required>
          <Select name="projectId" required defaultValue={projects[0]?.id}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sumber Lead">
          <Select name="sourceId" defaultValue="">
            <option value="">- Pilih -</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Domisili">
          <TextInput name="domisili" placeholder="Kota domisili" />
        </Field>
        <Field label="Pekerjaan">
          <TextInput name="pekerjaan" placeholder="Pekerjaan" />
        </Field>
        <Field label="Budget (Rp)">
          <TextInput name="budget" type="number" placeholder="200000000" />
        </Field>
        <Field label="Tipe Rumah Diminati">
          <TextInput name="tipeRumahDiminati" placeholder="Tipe 36/72" />
        </Field>
        {showSalesPicker && (
          <Field label="Assign ke Sales">
            <Select name="salesId" defaultValue="">
              <option value="">- Belum ditentukan -</option>
              {salesUsers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Prioritas">
          <Select name="priority" defaultValue="MEDIUM">
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
          </Select>
        </Field>
        <Field label="Catatan" className="col-span-2">
          <Textarea name="notes" placeholder="Catatan tambahan (opsional)" />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Lead"}
        </Button>
      </div>
    </form>
  );
}
