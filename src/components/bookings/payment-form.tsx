"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addBookingPayment } from "@/actions/bookings";
import { Field, TextInput, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

export function PaymentForm({
  onDone,
  bookingId,
  remaining,
}: {
  onDone: () => void;
  bookingId: string;
  remaining: number;
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
        await addBookingPayment(bookingId, formData);
        onDone();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan pembayaran.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-gray-500">
        Sisa DP yang belum dibayar: <span className="font-semibold text-gray-700">{formatRupiah(remaining)}</span>
      </p>
      <Field label="Jumlah Pembayaran (Rp)" required>
        <TextInput name="amount" type="number" required placeholder="1000000" />
      </Field>
      <Field label="Metode Pembayaran">
        <TextInput name="method" placeholder="Transfer Bank / Tunai" />
      </Field>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Catat Pembayaran"}
        </Button>
      </div>
    </form>
  );
}
