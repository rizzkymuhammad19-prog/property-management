"use client";

import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Server Component pages cannot pass a plain function (e.g. a render-prop
// `children`) to this Client Component — React can't serialize a raw JS
// closure across the server/client boundary ("Functions cannot be passed
// directly to Client Components..."). Instead, Modal's `children` is normal,
// already-rendered JSX (which Next.js *can* pass from a Server Component),
// and it exposes its own "close" function through context. Any form rendered
// inside a Modal calls useModalClose() to get it instead of receiving it as
// a prop.
const ModalCloseContext = createContext<() => void>(() => {});

export function useModalClose() {
  return useContext(ModalCloseContext);
}

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
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

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
            <ModalCloseContext.Provider value={close}>{children}</ModalCloseContext.Provider>
          </div>
        </div>
      )}
    </>
  );
}
