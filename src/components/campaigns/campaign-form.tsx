"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCampaign, updateCampaign } from "@/actions/campaigns";
import { Field, TextInput, Select, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";
import { CAMPAIGN_PLATFORM_LABEL } from "@/lib/labels";

type CampaignDefaults = {
  id?: string;
  name?: string;
  projectId?: string;
  platform?: string;
  objective?: string | null;
  budget?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

function toDateInput(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function CampaignForm({
  projects,
  defaults,
}: {
  projects: { id: string; name: string }[];
  defaults?: CampaignDefaults;
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
          await updateCampaign(defaults.id, formData);
        } else {
          await createCampaign(formData);
        }
        close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan kampanye.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Kampanye" required className="col-span-2">
          <TextInput name="name" required defaultValue={defaults?.name} placeholder="Promo Akhir Tahun" />
        </Field>
        {!isEdit && (
          <Field label="Proyek" required>
            <Select name="projectId" required defaultValue={defaults?.projectId ?? projects[0]?.id}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Platform">
          <Select name="platform" defaultValue={defaults?.platform ?? "ORGANIC"}>
            {Object.entries(CAMPAIGN_PLATFORM_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Budget (Rp)">
          <TextInput name="budget" type="number" defaultValue={defaults?.budget ?? undefined} placeholder="5000000" />
        </Field>
        <Field label="Tanggal Mulai">
          <TextInput name="startDate" type="date" defaultValue={toDateInput(defaults?.startDate)} />
        </Field>
        <Field label="Tanggal Selesai">
          <TextInput name="endDate" type="date" defaultValue={toDateInput(defaults?.endDate)} />
        </Field>
        <Field label="Objective" className="col-span-2">
          <TextInput name="objective" defaultValue={defaults?.objective ?? ""} placeholder="Brand awareness / lead generation" />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Kampanye"}
        </Button>
      </div>
    </form>
  );
}
