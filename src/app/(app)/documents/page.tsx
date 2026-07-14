import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge, Card, CardHeader, EmptyState, Table, THead, TBody, TR, TH, TD } from "@/components/ui";
import { getPageAuthContext } from "@/server/get-page-auth";
import { getDocuments } from "@/server/services/documents";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; tone: "good" | "warning" | "danger" | "neutral" }> = {
  VALID: { label: "ساري", tone: "good" },
  EXPIRING_SOON: { label: "ينتهي قريباً", tone: "warning" },
  MISSING: { label: "مفقود", tone: "danger" },
  REVIEW_REQUIRED: { label: "مراجعة", tone: "warning" }
};

export default async function DocumentsPage() {
  const ctx = await getPageAuthContext();
  if (!ctx) redirect("/login");

  const companyId = ctx.companyIds[0];
  const documents = companyId ? await getDocuments(ctx, companyId) : [];

  return (
    <AppShell
      authConfigured={true}
      dbConnected={documents.length > 0}
      companyName={undefined}
    >
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink">المستندات</h1>
        <p className="mt-1 text-sm text-slate-500">مستودع المستندات والشهادات</p>
      </div>

      <Card>
        <CardHeader title="جميع المستندات" icon={<FileText size={19} />} />
        {documents.length === 0 ? (
          <EmptyState
            icon={<FileText size={40} />}
            title="لا توجد مستندات"
            description="لم يتم رفع أي مستندات بعد. ابدأ برفع المستندات الأساسية للشركة."
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>المستند</TH>
                <TH>التصنيف</TH>
                <TH>الحالة</TH>
                <TH>تاريخ الانتهاء</TH>
                <TH>آخر تحديث</TH>
              </TR>
            </THead>
            <TBody>
              {documents.map((doc) => {
                const status = statusLabels[doc.status] ?? { label: doc.status, tone: "neutral" as const };
                return (
                  <TR key={doc.id}>
                    <TD className="font-medium text-ink">{doc.title}</TD>
                    <TD className="text-slate-500">{doc.category}</TD>
                    <TD>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </TD>
                    <TD className="text-slate-500">
                      {doc.expiresAt
                        ? new Date(doc.expiresAt).toLocaleDateString("ar-SA")
                        : "—"}
                    </TD>
                    <TD className="text-slate-500">
                      {new Date(doc.updatedAt).toLocaleDateString("ar-SA")}
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
}
