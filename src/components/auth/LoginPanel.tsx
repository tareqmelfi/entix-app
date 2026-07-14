"use client";

import { Building2, LockKeyhole } from "lucide-react";
import { useState } from "react";

type LoginPanelProps = {
  googleConfigured: boolean;
};

export function LoginPanel({ googleConfigured }: LoginPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setIsLoading(true);
    setError(null);

    try {
      const { authClient } = await import("@/lib/auth-client");
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
      });
    } catch {
      setError("تعذر بدء تسجيل الدخول. تحقق من إعدادات Google OAuth.");
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 py-10">
      <section className="w-full max-w-[420px] rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-violet text-white">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">Entix.app</h1>
            <p className="text-sm text-slate-500">دخول آمن لإدارة الشركات</p>
          </div>
        </div>

        <button
          type="button"
          disabled={!googleConfigured || isLoading}
          onClick={signInWithGoogle}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-violet px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet/90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <LockKeyhole size={18} />
          {isLoading ? "جاري التحويل..." : "تسجيل الدخول عبر Google"}
        </button>

        {!googleConfigured ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Google OAuth غير مفعّل في البيئة الحالية.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
