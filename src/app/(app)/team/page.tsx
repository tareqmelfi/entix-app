import { redirect } from "next/navigation";
import { UsersRound, UserPlus } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge, Button, Card, CardHeader, EmptyState, Table, THead, TBody, TR, TH, TD } from "@/components/ui";
import { getPageAuthContext } from "@/server/get-page-auth";
import { getTeamMembers, getInvites } from "@/server/services/team";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  PLATFORM_ADMIN: "مسؤول المنصة",
  ORGANIZATION_ADMIN: "مسؤول المنظمة",
  OPERATIONS_MANAGER: "مدير العمليات",
  OPERATIONS_MEMBER: "عضو العمليات",
  FINANCE_VIEWER: "مشاهد المالية",
  AUDITOR_READONLY: "مدقق — قراءة فقط"
};

const statusLabels: Record<string, { label: string; tone: "good" | "warning" | "danger" | "neutral" }> = {
  ACTIVE: { label: "نشط", tone: "good" },
  PENDING: { label: "قيد الانتظار", tone: "warning" },
  REVOKED: { label: "ملغى", tone: "danger" },
  ACCEPTED: { label: "مقبول", tone: "good" }
};

export default async function TeamPage() {
  const ctx = await getPageAuthContext();
  if (!ctx) redirect("/login");

  const [members, invites] = await Promise.all([getTeamMembers(ctx), getInvites(ctx)]);

  return (
    <AppShell authConfigured={true} dbConnected={members.length > 0} companyName={undefined}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">الفريق والأدوار</h1>
          <p className="mt-1 text-sm text-slate-500">إدارة الأعضاء والدعوات</p>
        </div>
        <Button>
          <UserPlus size={16} />
          دعوة عضو
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Members */}
        <Card>
          <CardHeader title="الأعضاء" icon={<UsersRound size={19} />} action={<Badge tone="neutral">{members.length}</Badge>} />
          {members.length === 0 ? (
            <EmptyState icon={<UsersRound size={32} />} title="لا يوجد أعضاء" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>الاسم</TH>
                  <TH>البريد</TH>
                  <TH>الدور</TH>
                  <TH>الحالة</TH>
                </TR>
              </THead>
              <TBody>
                {members.map((m) => {
                  const status = statusLabels[m.status] ?? { label: m.status, tone: "neutral" as const };
                  return (
                    <TR key={m.id}>
                      <TD className="font-medium text-ink">{m.name ?? "—"}</TD>
                      <TD className="text-slate-500">{m.email}</TD>
                      <TD className="text-slate-600">{roleLabels[m.role] ?? m.role}</TD>
                      <TD><Badge tone={status.tone}>{status.label}</Badge></TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </Card>

        {/* Invites */}
        <Card>
          <CardHeader title="الدعوات" icon={<UserPlus size={19} />} action={<Badge tone="neutral">{invites.length}</Badge>} />
          {invites.length === 0 ? (
            <EmptyState icon={<UserPlus size={32} />} title="لا توجد دعوات" description="دعوة أعضاء جدد عبر البريد الإلكتروني" />
          ) : (
            <div className="space-y-2">
              {invites.map((inv) => {
                const status = statusLabels[inv.status] ?? { label: inv.status, tone: "neutral" as const };
                return (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-ink">{inv.email}</p>
                      <p className="text-xs text-slate-400">{roleLabels[inv.role] ?? inv.role}</p>
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
