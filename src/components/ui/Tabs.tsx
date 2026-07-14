"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type TabsProps = {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  defaultTab?: string;
  children: (activeTab: string) => ReactNode;
  className?: string;
};

export function Tabs({ tabs, defaultTab, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "focus-ring flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "border-violet text-violet"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {Icon}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4">{children(active)}</div>
    </div>
  );
}
