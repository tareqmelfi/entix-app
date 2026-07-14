"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl"
};

export function Modal({ open, onClose, title, children, className, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "animate-fade-in relative w-full rounded-xl border border-slate-200 bg-surface shadow-lg",
          sizeMap[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <button onClick={onClose} className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
