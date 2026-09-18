"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createContent, updateContent } from "@/actions/content";
import { Field, TextInput, Select, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";
import { CAMPAIGN_PLATFORM_LABEL } from "@/lib/labels";

type ContentDefaults = {
  id?: string;
  title?: string;
  campaignId?: string;
  platform?: string;
  contentType?: string | null;
  publishDate?: Date | null;
  views?: number;
  reach?: number;
  engagement?: number;
  leadsCount?: number;
  surveyCount?: number;
  bookingCount?: number;
  revenue?: number;
};

function toDateInput(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function ContentForm({
  campaigns,
  defaults,
}: {
  campaigns: { id: string; name: string }[];
  defaults?: ContentDefaults;
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
          await updateContent(defaults.id, formData);
        } else {
          await createContent(formData);
        }
        close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan konten.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Judul Konten" required className="col-span-2">
          <TextInput name="title" required defaultValue={defaults?.title} placeholder="Reels tur unit tipe 36" />
        </Field>
        {!isEdit && (
          <Field label="Kampanye" required>
            <Select name="campaignId" required defaultValue={defaults?.campaignId ?? campaigns[0]?.id}>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
        <Field label="Jenis Konten">
          <TextInput name="contentType" defaultValue={defaults?.contentType ?? ""} placeholder="Video / Foto / Artikel" />
        </Field>
        <Field label="Tanggal Publish">
          <TextInput name="publishDate" type="date" defaultValue={toDateInput(defaults?.publishDate)} />
        </Field>
        <Field label="Views">
          <TextInput name="views" type="number" defaultValue={defaults?.views ?? 0} />
        </Field>
        <Field label="Reach">
          <TextInput name="reach" type="number" defaultValue={defaults?.reach ?? 0} />
        </Field>
        <Field label="Engagement">
          <TextInput name="engagement" type="number" defaultValue={defaults?.engagement ?? 0} />
        </Field>
        <Field label="Leads Dihasilkan">
          <TextInput name="leadsCount" type="number" defaultValue={defaults?.leadsCount ?? 0} />
        </Field>
        <Field label="Survei Dihasilkan">
          <TextInput name="surveyCount" type="number" defaultValue={defaults?.surveyCount ?? 0} />
        </Field>
        <Field label="Booking Dihasilkan">
          <TextInput name="bookingCount" type="number" defaultValue={defaults?.bookingCount ?? 0} />
        </Field>
        <Field label="Revenue (Rp)">
          <TextInput name="revenue" type="number" defaultValue={defaults?.revenue ?? 0} />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Konten"}
        </Button>
      </div>
    </form>
  );
}
