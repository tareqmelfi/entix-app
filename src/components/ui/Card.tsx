import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ className, padded = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-surface shadow-sm",
        padded && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function CardHeader({ title, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="flex items-center gap-2">
        {icon && <span className="text-violet">{icon}</span>}
        {action}
      </div>
    </div>
  );
}
