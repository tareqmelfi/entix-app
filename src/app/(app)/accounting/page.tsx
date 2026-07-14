import { redirect } from "next/navigation";
import { Link2, LockKeyhole } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import { getPageAuthContext } from "@/server/get-page-auth";
import { getAccountingConnections, getAccountingSnapshots } from "@/server/services/accounting";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; tone: "good" | "warning" | "danger" | "neutral" }> = {
  CONNECTED: { label: "متصل", tone: "good" },
  DISCONNECTED: { label: "غير متصل", tone: "neutral" },
  NEEDS_REAUTH: { label: "يحتاج إعادة مصادقة", tone: "warning" },
  ERROR: { label: "خطأ", tone: "danger" }
};

export default async function AccountingPage() {
  const ctx = await getPageAuthContext();
  if (!ctx) redirect("/login");

  const companyId = ctx.companyIds[0];
  const [connections, snapshots] = companyId
    ? await Promise.all([
        getAccountingConnections(ctx, companyId),
        getAccountingSnapshots(ctx, companyId)
      ])
    : [[], []];

  const hasData = connections.length > 0 || snapshots.length > 0;

  return (
    <AppShell authConfigured={true} dbConnected={hasData} companyName={undefined}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink">المحاسبة</h1>
        <p className="mt-1 text-sm text-slate-500">ربط Entix Books والملخصات المالية</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Connection status */}
        <Card>
          <CardHeader title="حالة الربط" icon={<Link2 size={19} />} />
          {connections.length === 0 ? (
            <EmptyState
              icon={<LockKeyhole size={40} />}
              title="الربط غير مفعّل"
              description="ربط Entix Books سيُفعّل لاحقاً عند جاهزية المنصة. لا يمكن كتابة فواتير أو قيود من هنا."
            />
          ) : (
            <div className="space-y-2">
              {connections.map((conn) => {
                const status = statusLabels[conn.status] ?? { label: conn.status, tone: "neutral" as const };
                return (
                  <div key={conn.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-ink">{conn.provider === "ENTIX_IO" ? "Entix Books" : "يدوي"}</p>
                      <p className="text-xs text-slate-400">
                        آخر مزامنة: {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleDateString("ar-SA") : "—"}
                      </p>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Decision rule + snapshots */}
        <Card>
          <CardHeader title="قاعدة القرار" icon={<LockKeyhole size={19} />} />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              Entix.app يقرأ ملخصات مالية من Entix Books عبر API ولا يكتب فواتير أو قيود
              محاسبية من داخل هذه المنصة. الربط سيُفعّل لاحقاً عند جاهزية entix.io.
            </p>
          </div>
          {snapshots.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-ink">آخر اللقطات المالية</p>
              <div className="space-y-2">
                {snapshots.slice(0, 5).map((snap) => (
                  <div key={snap.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <div>
                      <span className="text-slate-600">{snap.period}</span>
                      <span className="mr-2 text-xs text-slate-400">{snap.currency}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-slate-500">إيرادات: {snap.revenue}</span>
                      <span className="text-slate-500">مصروفات: {snap.expenses}</span>
                      <span className="text-slate-500">فواتير معلقة: {snap.outstandingInvoices}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
