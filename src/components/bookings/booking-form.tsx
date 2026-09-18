"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking, updateBooking } from "@/actions/bookings";
import { Field, TextInput, Select, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";

type BookingDefaults = {
  id?: string;
  bookingFee?: number;
  price?: number;
  dp?: number;
  notes?: string | null;
};

export function BookingForm({
  onDone,
  leads,
  units,
  salesUsers,
  showSalesPicker,
  defaults,
}: {
  onDone: () => void;
  leads: { id: string; name: string }[];
  units: { id: string; label: string; price: number; dp: number }[];
  salesUsers: { id: string; name: string }[];
  showSalesPicker: boolean;
  defaults?: BookingDefaults;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<
    { id: string; label: string; price: number; dp: number } | undefined
  >(units[0]);
  const router = useRouter();
  const isEdit = Boolean(defaults?.id);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (isEdit && defaults?.id) {
          await updateBooking(defaults.id, formData);
        } else {
          await createBooking(formData);
        }
        onDone();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan booking.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEdit && (
        <>
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
        </>
      )}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Booking Fee (Rp)" required>
          <TextInput
            name="bookingFee"
            type="number"
            required
            defaultValue={defaults?.bookingFee}
            placeholder="5000000"
          />
        </Field>
        <Field label="Harga (Rp)">
          <TextInput
            name="price"
            type="number"
            defaultValue={defaults?.price}
            placeholder={selectedUnit ? String(selectedUnit.price) : "Harga unit"}
          />
        </Field>
        <Field label="DP (Rp)">
          <TextInput
            name="dp"
            type="number"
            defaultValue={defaults?.dp}
            placeholder={selectedUnit ? String(selectedUnit.dp) : "DP unit"}
          />
        </Field>
      </div>
      {!isEdit && showSalesPicker && (
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
        <Textarea name="notes" defaultValue={defaults?.notes ?? ""} placeholder="Catatan tambahan (opsional)" />
      </Field>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending || (!isEdit && units.length === 0)}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Booking"}
        </Button>
      </div>
    </form>
  );
}
