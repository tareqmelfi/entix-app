import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-violet">404</p>
      <h2 className="mt-3 text-xl font-semibold text-ink">الصفحة غير موجودة</h2>
      <p className="mt-2 text-sm text-slate-500">ربما تم نقل الصفحة أو لم تعد متاحة.</p>
      <Link href="/dashboard">
        <Button className="mt-5">العودة للوحة التحكم</Button>
      </Link>
    </div>
  );
}
