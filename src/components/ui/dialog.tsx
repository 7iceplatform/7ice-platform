"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      className="rounded-xl border border-[--color-7ice-border] bg-white p-0 shadow-lg backdrop:bg-black/50"
      onClose={onClose}
    >
      <div className="p-6">
        <h2 id="dialog-title" className="text-lg font-semibold text-[--color-7ice-graphite]">
          {title}
        </h2>
        {description && (
          <p id="dialog-description" className="mt-1 text-sm text-[--color-7ice-mid-gray]">
            {description}
          </p>
        )}
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
