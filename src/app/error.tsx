"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <AlertTriangle size={48} className="mb-4 text-danger" />
      <h2 className="text-xl font-semibold text-ink">حدث خطأ غير متوقع</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        نعتذر عن الإزعاج. يمكنك المحاولة مرة أخرى أو العودة لاحقاً.
      </p>
      <Button onClick={reset} className="mt-5">
        إعادة المحاولة
      </Button>
    </div>
  );
}
