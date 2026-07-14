import { redirect } from "next/navigation";
import { Building2, FileText, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import { getPageAuthContext } from "@/server/get-page-auth";
import { getCompanyById, getCompanyRequirements } from "@/server/services/company";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const ctx = await getPageAuthContext();
  if (!ctx) redirect("/login");

  const companyId = ctx.companyIds[0];
  const company = companyId ? await getCompanyById(ctx, companyId) : null;
  const requirements = companyId ? await getCompanyRequirements(ctx, companyId) : [];

  return (
    <AppShell
      companyName={company?.tradeName ?? company?.legalName}
      healthScore={company?.healthScore}
      authConfigured={true}
      dbConnected={Boolean(company)}
    >
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink">ملف الشركة</h1>
        <p className="mt-1 text-sm text-slate-500">البيانات الأساسية والتسجيل القانوني</p>
      </div>

      {!company ? (
        <EmptyState
          icon={<Building2 size={40} />}
          title="لا توجد شركة مُسجلة"
          description="لم يتم ربط أي شركة بحسابك بعد. تواصل مع مسؤول المنصة لإضافة شركتك."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {/* Company info */}
          <Card>
            <CardHeader title="البيانات الأساسية" icon={<Building2 size={19} />} />
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="الاسم القانوني" value={company.legalName} />
              <Field label="الاسم التجاري" value={company.tradeName ?? "—"} />
              <Field label="الولاية القضائية" value={company.jurisdiction} />
              <Field label="رقم التسجيل" value={company.registrationNumber ?? "—"} />
              <Field label="الرقم الضريبي" value={company.taxNumber ?? "—"} />
              <Field
                label="الحالة"
                value={
                  <Badge tone={company.status === "ACTIVE" ? "good" : "neutral"}>
                    {company.status === "ACTIVE" ? "نشط" : company.status === "ONBOARDING" ? "قيد التسجيل" : company.status}
                  </Badge>
                }
              />
              <Field label="صحة الكيان" value={`${company.healthScore}%`} />
              <Field label="اكتمال الملف" value={`${company.profileCompletion}%`} />
            </dl>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader
              title="سجل المتطلبات"
              icon={<ShieldCheck size={19} />}
              action={<Badge tone="neutral">{requirements.length} بند</Badge>}
            />
            {requirements.length === 0 ? (
              <EmptyState icon={<FileText size={32} />} title="لا توجد متطلبات" />
            ) : (
              <div className="space-y-2">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{req.title}</p>
                      <p className="text-xs text-slate-400">{req.area}</p>
                    </div>
                    <Badge
                      tone={
                        req.status === "COMPLETE"
                          ? "good"
                          : req.severity === "CRITICAL"
                            ? "danger"
                            : req.severity === "HIGH"
                              ? "warning"
                              : "neutral"
                      }
                    >
                      {req.status === "COMPLETE" ? "مكتمل" : req.status === "IN_PROGRESS" ? "قيد المعالجة" : req.status === "MISSING" ? "مفقود" : "محظور"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
