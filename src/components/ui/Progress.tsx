import { cn } from "@/lib/cn";

export function Progress({
  value,
  status = "good",
  className
}: {
  value: number;
  status?: "good" | "warning" | "danger";
  className?: string;
}) {
  const barColor = {
    good: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500"
  };

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all", barColor[status])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProgressRow({
  label,
  value,
  status
}: {
  label: string;
  value: number;
  status: "good" | "warning" | "danger";
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <Progress value={value} status={status} />
    </div>
  );
}
