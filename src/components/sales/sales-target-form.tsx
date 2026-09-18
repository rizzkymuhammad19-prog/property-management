"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertSalesTarget } from "@/actions/sales-targets";
import { Field, TextInput, Select, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";

export function SalesTargetForm({
  salesUsers,
  projects,
  defaultUserId,
  defaultPeriod,
}: {
  salesUsers: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  defaultUserId?: string;
  defaultPeriod: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const close = useModalClose();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await upsertSalesTarget(formData);
        close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan target.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sales">
          <Select name="userId" defaultValue={defaultUserId ?? ""}>
            <option value="">- Target Tim (semua sales) -</option>
            {salesUsers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
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
        <Field label="Periode" required hint="Format: YYYY-MM">
          <TextInput name="period" required defaultValue={defaultPeriod} placeholder="2026-09" />
        </Field>
        <Field label="Target Unit Terjual">
          <TextInput name="targetUnit" type="number" placeholder="10" />
        </Field>
        <Field label="Target Booking">
          <TextInput name="targetBooking" type="number" placeholder="15" />
        </Field>
        <Field label="Target Akad">
          <TextInput name="targetAkad" type="number" placeholder="8" />
        </Field>
        <Field label="Target Revenue (Rp)" className="col-span-2">
          <TextInput name="targetRevenue" type="number" placeholder="1000000000" />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Target"}
        </Button>
      </div>
    </form>
  );
}
