import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge, Card, CardHeader, EmptyState, Table, THead, TBody, TR, TH, TD } from "@/components/ui";
import { getPageAuthContext } from "@/server/get-page-auth";
import { getAuditEvents } from "@/server/services/governance";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const ctx = await getPageAuthContext();
  if (!ctx) redirect("/login");

  const events = await getAuditEvents(ctx, undefined, 100);

  return (
    <AppShell authConfigured={true} dbConnected={events.length > 0} companyName={undefined}>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink">الحوكمة والامتثال</h1>
        <p className="mt-1 text-sm text-slate-500">سجل الأحداث وأدلة الامتثال</p>
      </div>

      <Card>
        <CardHeader title="سجل الأحداث" icon={<ShieldCheck size={19} />} action={<Badge tone="neutral">{events.length}</Badge>} />
        {events.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={40} />}
            title="لا توجد أحداث مسجلة"
            description="ستظهر هنا جميع الأحداث والعمليات الحساسة على المنصة"
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>الإجراء</TH>
                <TH>نوع الكيان</TH>
                <TH>المستخدم</TH>
                <TH>التاريخ</TH>
              </TR>
            </THead>
            <TBody>
              {events.map((event) => (
                <TR key={event.id}>
                  <TD className="font-medium text-ink">{event.action}</TD>
                  <TD className="text-slate-500">{event.entityType}</TD>
                  <TD className="text-slate-500">{event.actorUserId ?? "—"}</TD>
                  <TD className="text-slate-500">
                    {new Date(event.createdAt).toLocaleString("ar-SA")}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
}
