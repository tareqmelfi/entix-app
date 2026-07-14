import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/design-tokens";

type BadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  icon?: ReactNode;
  className?: string;
};

const toneClasses: Record<StatusTone, string> = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-slate-50 text-slate-600 border-slate-200"
};

export function Badge({ children, tone = "neutral", icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
  className
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
