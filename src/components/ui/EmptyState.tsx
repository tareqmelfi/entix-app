import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-surface-alt py-12 text-center", className)}>
      {icon && <div className="mb-3 text-slate-300">{icon}</div>}
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-violet", className)} />
  );
}
