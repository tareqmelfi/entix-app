"use client";

import { Building2, LockKeyhole, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";

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
      <section className="animate-fade-in w-full max-w-[420px] rounded-xl border border-slate-200 bg-surface p-8 shadow-soft">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-violet text-white shadow-sm">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">Entix.app</h1>
            <p className="text-sm text-slate-500">دخول آمن لإدارة الشركات</p>
          </div>
        </div>

        {/* Google sign-in */}
        <Button
          onClick={signInWithGoogle}
          disabled={!googleConfigured || isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LockKeyhole size={18} />
          )}
          {isLoading ? "جاري التحويل…" : "تسجيل الدخول عبر Google"}
        </Button>

        {/* Status messages */}
        {!googleConfigured && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Google OAuth غير مفعّل في البيئة الحالية.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          الدخول بموجب فقط. التسجيل مفتوح للمدعوين حصرياً.
        </p>
      </section>
    </main>
  );
}
