import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Gauge,
  Link2,
  Upload
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge, Button, Card, CardHeader, Progress, ProgressRow, StatusPill } from "@/components/ui";
import type { DashboardData, ModuleProgress } from "@/server/dashboard";
import type { StatusTone } from "@/lib/design-tokens";

type EntixDashboardProps = {
  data: DashboardData;
  authConfigured: boolean;
};

export function EntixDashboard({ data, authConfigured }: EntixDashboardProps) {
  const companyName = data.company.tradeName ?? data.company.legalName;

  return (
    <AppShell
      companyName={companyName}
      healthScore={data.company.healthScore}
      authConfigured={authConfigured}
      dbConnected={data.source === "database"}
    >
      {/* Hero — health score + metrics */}
      <section className="grid gap-4 rounded-lg bg-navy p-5 text-white lg:grid-cols-[1fr_180px]">
        <div className="grid grid-cols-3 gap-3 text-center sm:max-w-[360px]">
          <MetricNumber label="عاجلة" value={data.summary.urgent} tone="danger" />
          <MetricNumber label="قريبة" value={data.summary.dueSoon} tone="warning" />
          <MetricNumber label="مكتملة" value={data.summary.completed} tone="good" />
        </div>
        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="text-right">
            <p className="text-sm text-slate-300">صحة الكيان</p>
            <p className="text-xs text-slate-400">{data.company.legalName}</p>
          </div>
          <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-violet bg-white/10">
            <span className="text-xl font-bold">{data.company.healthScore}%</span>
          </div>
        </div>
      </section>

      {/* Progress + Missing requirements */}
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="المعلومات المفقودة"
            icon={<AlertTriangle size={19} />}
            action={
              <Badge tone="danger">{data.missingRequirements.length} بنود</Badge>
            }
          />
          <div className="space-y-2">
            {data.missingRequirements.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">لا توجد بنود مفقودة 🎉</p>
            )}
            {data.missingRequirements.map((item) => (
              <div
                key={`${item.area}-${item.title}`}
                className={`rounded-lg border px-3 py-3 ${missingTone(item.severity)}`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs opacity-75">{item.area}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 w-full">
            <Upload size={16} />
            رفع المستندات
          </Button>
        </Card>

        <Card>
          <CardHeader title="تقدم المعلومات" icon={<Gauge size={19} />} />
          <div className="mb-3 flex justify-end">
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">
              إجمالي: {data.company.profileCompletion}%
            </span>
          </div>
          <div className="space-y-3">
            {data.modules.map((module) => (
              <ProgressRow key={module.key} label={module.label} value={module.value} status={module.status} />
            ))}
          </div>
        </Card>
      </section>

      {/* Documents + Entix Books bridge */}
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader title="المستندات" icon={<FileText size={19} />} />
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">المستند</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">آخر تحديث</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.documents.map((document) => (
                  <tr key={`${document.title}-${document.status}`}>
                    <td className="px-4 py-3 font-medium text-ink">{document.title}</td>
                    <td className="px-4 py-3">
                      <DocumentStatusBadge status={document.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{document.ageLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="ربط Entix Books" icon={<Link2 size={19} />} />
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ink">حالة الربط المحاسبي</p>
              <p className="mt-2 text-sm text-slate-600">{data.entixIo.message}</p>
              <div className="mt-3">
                <StatusPill
                  label={bridgeLabel(data.entixIo.status)}
                  tone={data.entixIo.status === "connected" ? "good" : "warning"}
                />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-ink">قاعدة القرار</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Entix.app يقرأ ملخصات مالية من Entix Books عبر API ولا يكتب فواتير أو قيود
                محاسبية من داخل هذه المنصة.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}

function MetricNumber({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "danger" | "warning" | "good";
}) {
  const colors: Record<string, string> = {
    danger: "text-red-400",
    warning: "text-amber-400",
    good: "text-emerald-400"
  };

  return (
    <div>
      <p className={`text-2xl font-bold ${colors[tone]}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}

function DocumentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: StatusTone; icon: typeof CheckCircle2 }> = {
    VALID: { label: "ساري", tone: "good", icon: CheckCircle2 },
    EXPIRING_SOON: { label: "ينتهي قريباً", tone: "warning", icon: AlertTriangle },
    MISSING: { label: "مفقود", tone: "danger", icon: AlertTriangle },
    REVIEW_REQUIRED: { label: "مراجعة", tone: "warning", icon: AlertTriangle }
  };

  const item = map[status] ?? map.REVIEW_REQUIRED;
  const Icon = item.icon;

  return (
    <Badge tone={item.tone} icon={<Icon size={13} />}>
      {item.label}
    </Badge>
  );
}

function missingTone(severity: string) {
  if (severity === "CRITICAL") return "border-red-200 bg-red-50 text-red-800";
  if (severity === "HIGH") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function bridgeLabel(status: string) {
  if (status === "connected") return "متصل";
  if (status === "unhealthy") return "غير صحي";
  if (status === "error") return "خطأ";
  return "غير مفعّل";
}
