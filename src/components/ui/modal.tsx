"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  trigger,
  title,
  description,
  size = "md",
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const maxWidth = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return (
    <>
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">
        {trigger}
      </span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "relative max-h-[85vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-up",
              maxWidth
            )}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {description && (
                  <p className="mt-0.5 text-sm text-gray-500">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-surface-muted hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children(() => setOpen(false))}
          </div>
        </div>
      )}
    </>
  );
}
