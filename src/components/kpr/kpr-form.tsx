"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createKprApplication } from "@/actions/kpr";
import { Field, TextInput, Select, Checkbox, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { FINANCING_TYPE_LABEL } from "@/lib/labels";

export function KprForm({
  onDone,
  bookings,
}: {
  onDone: () => void;
  bookings: { id: string; label: string }[];
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
        await createKprApplication(formData);
        onDone();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan pengajuan KPR.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bank" required>
          <TextInput name="bank" required placeholder="BTN / BCA / Mandiri" />
        </Field>
        <Field label="Skema Pembiayaan">
          <Select name="financingType" defaultValue="COMMERCIAL">
            {Object.entries(FINANCING_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Plafond (Rp)">
          <TextInput name="plafond" type="number" placeholder="Otomatis dari harga - DP" />
        </Field>
        <Field label="Tenor (tahun)">
          <TextInput name="tenor" type="number" defaultValue={15} />
        </Field>
        <Field label="NPWP">
          <TextInput name="npwp" placeholder="Opsional" />
        </Field>
        <Field label="Batas SLA Bank (hari)">
          <TextInput name="slaDays" type="number" defaultValue={14} />
        </Field>
      </div>
      <div className="flex flex-col gap-2">
        <Checkbox name="mbrEligible" label="Memenuhi syarat MBR (subsidi)" />
        <Checkbox name="suratBelumPunyaRumah" label="Sudah punya Surat Belum Punya Rumah (SBPR)" />
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending || bookings.length === 0}>
          {pending ? "Menyimpan..." : "Ajukan KPR"}
        </Button>
      </div>
    </form>
  );
}
