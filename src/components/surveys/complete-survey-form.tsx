"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeSurvey } from "@/actions/surveys";
import { Field, Textarea, FormError } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/components/ui/modal";

export function CompleteSurveyForm({ surveyId }: { surveyId: string }) {
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
        await completeSurvey(surveyId, formData);
        close();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan hasil survei.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Hasil Survei" hint="Catat kesan/keputusan calon pembeli setelah kunjungan unit.">
        <Textarea name="result" placeholder="Contoh: Tertarik, ingin lanjut booking minggu depan." />
      </Field>

      <FormError message={error} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={close}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : "Tandai Selesai"}
        </Button>
      </div>
    </form>
  );
}
