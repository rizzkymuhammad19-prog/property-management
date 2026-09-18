"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser } from "@/actions/users";
import { Field, TextInput, Select, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";
import { ROLE_LABEL } from "@/lib/rbac";

type UserDefaults = {
  id?: string;
  name?: string;
  role?: string;
  phone?: string | null;
  area?: string | null;
};

export function UserForm({ defaults }: { defaults?: UserDefaults }) {
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
          await updateUser(defaults.id, formData);
        } else {
          await createUser(formData);
        }
        close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan user.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Lengkap" required className="col-span-2">
          <TextInput name="name" required defaultValue={defaults?.name} />
        </Field>
        {!isEdit && (
          <Field label="Email" required className="col-span-2">
            <TextInput name="email" type="email" required placeholder="nama@propertymanagement.local" />
          </Field>
        )}
        <Field label="Role" required>
          <Select name="role" required defaultValue={defaults?.role ?? "SALES"}>
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="No. Telepon">
          <TextInput name="phone" defaultValue={defaults?.phone ?? ""} />
        </Field>
        <Field label="Area / Wilayah" className="col-span-2">
          <TextInput name="area" defaultValue={defaults?.area ?? ""} />
        </Field>
        <Field
          label={isEdit ? "Password Baru" : "Password"}
          required={!isEdit}
          hint={isEdit ? "Kosongkan jika tidak ingin mengubah password." : "Minimal 6 karakter."}
          className="col-span-2"
        >
          <TextInput name="password" type="password" required={!isEdit} minLength={6} />
        </Field>
      </div>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah User"}
        </Button>
      </div>
    </form>
  );
}
