"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createKprApplication, updateKprApplication } from "@/actions/kpr";
import { Field, TextInput, Select, Checkbox, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";
import { FINANCING_TYPE_LABEL } from "@/lib/labels";

type KprDefaults = {
  id?: string;
  bank?: string;
  financingType?: string;
  plafond?: number;
  tenor?: number;
  npwp?: string | null;
  mbrEligible?: boolean;
  suratBelumPunyaRumah?: boolean;
};

export function KprForm({
  bookings,
  defaults,
}: {
  bookings: { id: string; label: string }[];
  defaults?: KprDefaults;
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
          await updateKprApplication(defaults.id, formData);
        } else {
          await createKprApplication(formData);
        }
        close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan pengajuan KPR.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <Field label="Booking" required hint="Hanya menampilkan booking yang belum punya pengajuan KPR aktif.">
          <Select name="bookingId" required defaultValue="">
            <option value="" disabled>
              - Pilih booking -
            </option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bank" required>
          <TextInput name="bank" required defaultValue={defaults?.bank} placeholder="BTN / BCA / Mandiri" />
        </Field>
        <Field label="Skema Pembiayaan">
          <Select name="financingType" defaultValue={defaults?.financingType ?? "COMMERCIAL"}>
            {Object.entries(FINANCING_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Plafond (Rp)">
          <TextInput
            name="plafond"
            type="number"
            defaultValue={defaults?.plafond}
            placeholder="Otomatis dari harga - DP"
          />
        </Field>
        <Field label="Tenor (tahun)">
          <TextInput name="tenor" type="number" defaultValue={defaults?.tenor ?? 15} />
        </Field>
        <Field label="NPWP">
          <TextInput name="npwp" defaultValue={defaults?.npwp ?? ""} placeholder="Opsional" />
        </Field>
        <Field
          label="Batas SLA Bank (hari)"
          hint={isEdit ? "Kosongkan jika tidak ingin mengubah batas SLA." : undefined}
        >
          <TextInput name="slaDays" type="number" defaultValue={isEdit ? undefined : 14} />
        </Field>
      </div>
      <div className="flex flex-col gap-2">
        <Checkbox name="mbrEligible" label="Memenuhi syarat MBR (subsidi)" defaultChecked={defaults?.mbrEligible} />
        <Checkbox
          name="suratBelumPunyaRumah"
          label="Sudah punya Surat Belum Punya Rumah (SBPR)"
          defaultChecked={defaults?.suratBelumPunyaRumah}
        />
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending || (!isEdit && bookings.length === 0)}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Ajukan KPR"}
        </Button>
      </div>
    </form>
  );
}
