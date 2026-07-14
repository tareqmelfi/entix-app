"use client";

import { useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  ChevronLeft,
  FileText,
  Gauge,
  LayoutDashboard,
  Link2,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
  X
} from "lucide-react";
import { cn } from "@/lib/cn";

const navSections = [
  {
    label: "الرئيسية",
    items: [{ label: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard }]
  },
  {
    label: "الإدارة",
    items: [
      { label: "ملف الشركة", href: "/company", icon: Building2 },
      { label: "المستندات", href: "/documents", icon: FileText },
      { label: "الفريق", href: "/team", icon: UsersRound },
      { label: "المهام", href: "/tasks", icon: Settings }
    ]
  },
  {
    label: "الحوكمة",
    items: [
      { label: "الامتثال", href: "/governance", icon: ShieldCheck },
      { label: "المحاسبة", href: "/accounting", icon: Link2 }
    ]
  }
];

export function AppShell({
  children,
  companyName,
  healthScore,
  authConfigured,
  dbConnected
}: {
  children: ReactNode;
  companyName?: string;
  healthScore?: number;
  authConfigured: boolean;
  dbConnected: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[280px] bg-navy px-4 py-5 text-white lg:block navy-scroll overflow-y-auto">
        <SidebarContent
          companyName={companyName}
          healthScore={healthScore}
          authConfigured={authConfigured}
          dbConnected={dbConnected}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="animate-fade-in absolute inset-y-0 right-0 w-[280px] bg-navy px-4 py-5 text-white overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="focus-ring absolute left-3 top-4 rounded-lg p-1 text-slate-400 hover:bg-white/10"
            >
              <X size={20} />
            </button>
            <SidebarContent
              companyName={companyName}
              healthScore={healthScore}
              authConfigured={authConfigured}
              dbConnected={dbConnected}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:mr-[280px]">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="min-w-0 p-5">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  companyName,
  healthScore,
  authConfigured,
  dbConnected
}: {
  companyName?: string;
  healthScore?: number;
  authConfigured: boolean;
  dbConnected: boolean;
}) {
  return (
    <>
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet">
          <Building2 size={22} />
        </div>
        <div>
          <p className="text-lg font-semibold">Entix.app</p>
          <p className="text-xs text-slate-300">منصة إدارة الشركات</p>
        </div>
      </div>

      {/* Company selector */}
      <section className="mb-5 rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-xs text-slate-300">الشركة الحالية</p>
        <p className="mt-1 truncate text-sm font-semibold">{companyName ?? "لم تُحدد بعد"}</p>
        {healthScore !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-violet" style={{ width: `${healthScore}%` }} />
            </div>
            <span className="text-xs text-slate-300">{healthScore}%</span>
          </div>
        )}
      </section>

      {/* Status pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        <span
          className={cn(
            "rounded-lg border px-2 py-0.5 text-[10px] font-semibold",
            authConfigured ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          )}
        >
          {authConfigured ? "Auth جاهز" : "Auth ينتظر"}
        </span>
        <span
          className={cn(
            "rounded-lg border px-2 py-0.5 text-[10px] font-semibold",
            dbConnected ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          )}
        >
          {dbConnected ? "DB مباشر" : "Baseline"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] uppercase tracking-wide text-slate-400">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>
        <div className="hidden flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex lg:w-[320px]">
          <Search size={17} />
          <span>ابحث في المستندات، الشركات، العمليات…</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="focus-ring relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-violet text-xs font-bold text-white">
            TA
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-ink">المدير</p>
            <p className="text-[10px] text-slate-400">مسؤول المنصة</p>
          </div>
          <ChevronLeft size={16} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}
