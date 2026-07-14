import { redirect } from "next/navigation";
import { Settings, Plus, Circle } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge, Button, Card, CardHeader, EmptyState } from "@/components/ui";
import { getPageAuthContext } from "@/server/get-page-auth";
import { getTasks } from "@/server/services/tasks";

export const dynamic = "force-dynamic";

const priorityTones: Record<string, "good" | "warning" | "danger" | "neutral"> = {
  LOW: "neutral",
  MEDIUM: "warning",
  HIGH: "danger",
  CRITICAL: "danger"
};

const priorityLabels: Record<string, string> = {
  LOW: "منخفضة",
  MEDIUM: "متوسطة",
  HIGH: "عالية",
  CRITICAL: "حرجة"
};

export default async function TasksPage() {
  const ctx = await getPageAuthContext();
  if (!ctx) redirect("/login");

  const companyId = ctx.companyIds[0];
  const tasks = companyId ? await getTasks(ctx, companyId) : [];

  // Group by status for Kanban view
  const columns = [
    { id: "OPEN", label: "مفتوح" },
    { id: "IN_PROGRESS", label: "قيد التنفيذ" },
    { id: "BLOCKED", label: "محظور" },
    { id: "DONE", label: "مكتمل" }
  ];

  return (
    <AppShell authConfigured={true} dbConnected={tasks.length > 0} companyName={undefined}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">المهام والعمليات</h1>
          <p className="mt-1 text-sm text-slate-500">لوحة المهام حسب الوحدة والحالة</p>
        </div>
        <Button>
          <Plus size={16} />
          مهمة جديدة
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Settings size={40} />}
            title="لا توجد مهام"
            description="أنشئ مهام جديدة للعمليات والمتطلبات"
            action={<Button><Plus size={16} /> إنشاء مهمة</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.label);
            return (
              <div key={col.id} className="rounded-lg bg-surface-alt p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                  <Badge tone="neutral">{colTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="animate-fade-in rounded-lg border border-slate-200 bg-surface p-3 shadow-xs"
                    >
                      <p className="text-sm font-medium text-ink">{task.title}</p>
                      {task.description && (
                        <p className="clamp-2 mt-1 text-xs text-slate-400">{task.description}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{task.module}</span>
                        <Badge tone={priorityTones[task.priority] ?? "neutral"}>
                          {priorityLabels[task.priority] ?? task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-xs text-slate-300">
                      <Circle size={16} className="mx-auto mb-1" />
                      فارغ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
