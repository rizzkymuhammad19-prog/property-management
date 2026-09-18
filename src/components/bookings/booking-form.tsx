"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/bookings";
import { Field, TextInput, Select, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

export function BookingForm({
  onDone,
  leads,
  units,
  salesUsers,
  showSalesPicker,
}: {
  onDone: () => void;
  leads: { id: string; name: string }[];
  units: { id: string; label: string; price: number; dp: number }[];
  salesUsers: { id: string; name: string }[];
  showSalesPicker: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<
    { id: string; label: string; price: number; dp: number } | undefined
  >(units[0]);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createBooking(formData);
        onDone();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan booking.");
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
      <Field label="Unit" required hint="Hanya unit berstatus tersedia/ditahan yang muncul.">
        <Select
          name="unitId"
          required
          defaultValue={units[0]?.id ?? ""}
          onChange={(e) => setSelectedUnit(units.find((u) => u.id === e.target.value))}
        >
          {units.length === 0 && <option value="">Tidak ada unit tersedia</option>}
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Booking Fee (Rp)" required>
          <TextInput name="bookingFee" type="number" required placeholder="5000000" />
        </Field>
        <Field label="Harga (Rp)">
          <TextInput
            name="price"
            type="number"
            placeholder={selectedUnit ? String(selectedUnit.price) : "Harga unit"}
          />
        </Field>
        <Field label="DP (Rp)">
          <TextInput
            name="dp"
            type="number"
            placeholder={selectedUnit ? String(selectedUnit.dp) : "DP unit"}
          />
        </Field>
      </div>
      {showSalesPicker && (
        <Field label="Sales">
          <Select name="salesId" defaultValue="">
            <option value="">- Saya sendiri -</option>
            {salesUsers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Catatan">
        <Textarea name="notes" placeholder="Catatan tambahan (opsional)" />
      </Field>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending || units.length === 0}>
          {pending ? "Menyimpan..." : "Buat Booking"}
        </Button>
      </div>
    </form>
  );
}
