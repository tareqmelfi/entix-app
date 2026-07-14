import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
};

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className={cn("w-full border-collapse text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 text-slate-500">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>;
}

export function TR({ children, className, ...props }: { children: ReactNode } & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-slate-50/50", className)} {...props}>
      {children}
    </tr>
  );
}

export function TH({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3 text-right font-medium", className)} {...props}>
      {children}
    </th>
  );
}

export function TD({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3", className)} {...props}>
      {children}
    </td>
  );
}
