"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLead, updateLead } from "@/actions/leads";
import { Field, TextInput, Select, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";

type LeadDefaults = {
  id?: string;
  name?: string;
  whatsapp?: string;
  email?: string | null;
  domisili?: string | null;
  pekerjaan?: string | null;
  budget?: number | null;
  tipeRumahDiminati?: string | null;
  sourceId?: string | null;
  salesId?: string | null;
  priority?: string;
  notes?: string | null;
};

export function LeadForm({
  projects,
  sources,
  salesUsers,
  showSalesPicker,
  defaults,
}: {
  projects: { id: string; name: string }[];
  sources: { id: string; name: string }[];
  salesUsers: { id: string; name: string }[];
  showSalesPicker: boolean;
  defaults?: LeadDefaults;
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
          await updateLead(defaults.id, formData);
        } else {
          await createLead(formData);
        }
        close();
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
          <TextInput name="name" required defaultValue={defaults?.name} placeholder="Nama calon pembeli" />
        </Field>
        <Field label="No. WhatsApp" required>
          <TextInput name="whatsapp" required defaultValue={defaults?.whatsapp} placeholder="08xxxxxxxxxx" />
        </Field>
        <Field label="Email">
          <TextInput name="email" type="email" defaultValue={defaults?.email ?? ""} placeholder="opsional" />
        </Field>
        {!isEdit && (
          <Field label="Proyek" required>
            <Select name="projectId" required defaultValue={projects[0]?.id}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Sumber Lead">
          <Select name="sourceId" defaultValue={defaults?.sourceId ?? ""}>
            <option value="">- Pilih -</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Domisili">
          <TextInput name="domisili" defaultValue={defaults?.domisili ?? ""} placeholder="Kota domisili" />
        </Field>
        <Field label="Pekerjaan">
          <TextInput name="pekerjaan" defaultValue={defaults?.pekerjaan ?? ""} placeholder="Pekerjaan" />
        </Field>
        <Field label="Budget (Rp)">
          <TextInput name="budget" type="number" defaultValue={defaults?.budget ?? undefined} placeholder="200000000" />
        </Field>
        <Field label="Tipe Rumah Diminati">
          <TextInput
            name="tipeRumahDiminati"
            defaultValue={defaults?.tipeRumahDiminati ?? ""}
            placeholder="Tipe 36/72"
          />
        </Field>
        {showSalesPicker && (
          <Field label="Assign ke Sales">
            <Select name="salesId" defaultValue={defaults?.salesId ?? ""}>
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
          <Select name="priority" defaultValue={defaults?.priority ?? "MEDIUM"}>
            <option value="LOW">Rendah</option>
            <option value="MEDIUM">Sedang</option>
            <option value="HIGH">Tinggi</option>
          </Select>
        </Field>
        <Field label="Catatan" className="col-span-2">
          <Textarea name="notes" defaultValue={defaults?.notes ?? ""} placeholder="Catatan tambahan (opsional)" />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Lead"}
        </Button>
      </div>
    </form>
  );
}
