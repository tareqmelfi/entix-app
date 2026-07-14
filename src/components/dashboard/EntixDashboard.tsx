import {
  AlertTriangle,
  Banknote,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  Gauge,
  Landmark,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  Search,
  Settings,
  ShieldCheck,
  UsersRound
} from "lucide-react";

import type { DashboardData, ModuleProgress } from "@/server/dashboard";

type EntixDashboardProps = {
  data: DashboardData;
  authConfigured: boolean;
};

const navItems = [
  { label: "لوحة التحكم", icon: LayoutDashboard, active: true },
  { label: "المعلومات الأساسية", icon: Building2 },
  { label: "القانونية والتسجيل", icon: Landmark },
  { label: "الحوكمة", icon: UsersRound },
  { label: "المالية", icon: Banknote },
  { label: "العمليات", icon: Settings },
  { label: "التكنولوجيا", icon: Database },
  { label: "الامتثال والمخاطر", icon: ShieldCheck },
  { label: "المستندات", icon: FileText },
  { label: "التنبيهات", icon: Bell }
];

const topTabs = [
  { label: "ملف الشركة", icon: Building2 },
  { label: "الحسابات البنكية", icon: Banknote },
  { label: "الهوية والرسالة", icon: ClipboardList },
  { label: "فريق الشركة", icon: UsersRound },
  { label: "التقارير السيادية", icon: Gauge },
  { label: "المستندات", icon: FileText }
];

export function EntixDashboard({ data, authConfigured }: EntixDashboardProps) {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="bg-navy px-4 py-5 text-white">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-lg font-semibold">EntityOS</p>
                <p className="text-xs text-slate-300">منصة إدارة معلومات الشركات</p>
              </div>
            </div>
          </div>

          <section className="mb-5 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-300">الشركة الحالية</p>
            <p className="mt-1 text-sm font-semibold">{data.company.tradeName ?? data.company.legalName}</p>
          </section>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    item.active
                      ? "bg-violet text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">إدارة شركة على منصة Entix.app</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">لوحة التحكم</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-[260px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search size={17} />
                <span>ابحث في المستندات، الشركات، العمليات...</span>
              </div>
              <StatusPill
                label={authConfigured ? "Auth جاهز" : "Auth ينتظر env"}
                tone={authConfigured ? "good" : "warning"}
              />
              <StatusPill
                label={data.source === "database" ? "DB مباشر" : "Baseline"}
                tone={data.source === "database" ? "good" : "warning"}
              />
            </div>
          </header>

          <div className="space-y-5 p-5">
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

            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {topTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.label}
                    className="focus-ring flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet hover:text-violet"
                  >
                    <Icon size={17} />
                    {tab.label}
                  </button>
                );
              })}
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <Panel title="المعلومات المفقودة" icon={AlertTriangle}>
                <div className="mb-3 flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle size={16} />
                  <span>{data.missingRequirements.length} بنود تحتاج معالجة</span>
                </div>
                <div className="space-y-2">
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
                <button
                  type="button"
                  className="focus-ring mt-4 w-full rounded-lg bg-violet px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet/90"
                >
                  رفع المستندات
                </button>
              </Panel>

              <Panel title="تقدم المعلومات" icon={Gauge}>
                <div className="mb-3 flex justify-end">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">
                    {data.company.profileCompletion}%
                  </span>
                </div>
                <div className="space-y-3">
                  {data.modules.map((module) => (
                    <ProgressRow key={module.key} module={module} />
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
              <Panel title="المستندات" icon={FileText}>
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
              </Panel>

              <Panel title="ربط Entix Books" icon={Link2}>
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
              </Panel>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: typeof Gauge;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <Icon size={19} className="text-violet" />
      </div>
      {children}
    </section>
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
  const colors = {
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

function ProgressRow({ module }: { module: ModuleProgress }) {
  const colors = {
    good: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500"
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{module.label}</span>
        <span className="text-slate-500">{module.value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${colors[module.status]}`}
          style={{ width: `${module.value}%` }}
        />
      </div>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: "good" | "warning" }) {
  const className =
    tone === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function DocumentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
    VALID: {
      label: "ساري",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2
    },
    EXPIRING_SOON: {
      label: "ينتهي قريباً",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle
    },
    MISSING: {
      label: "مفقود",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: AlertTriangle
    },
    REVIEW_REQUIRED: {
      label: "مراجعة",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertTriangle
    }
  };

  const item = map[status] ?? map.REVIEW_REQUIRED;
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold ${item.className}`}
    >
      <Icon size={13} />
      {item.label}
    </span>
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
