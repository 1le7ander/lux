"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/site/ToastHost";

export function LoginForm() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error || "بيانات دخول غير صحيحة");
      toast("تم تسجيل الدخول", "success");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="relative w-full max-w-sm card animate-slide-up p-7 sm:p-8"
      noValidate
    >
      <div className="pointer-events-none absolute -top-10 left-1/2 h-20 w-40 -translate-x-1/2 rounded-full bg-gold/30 blur-3xl" />
      <div className="mb-6 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-soft to-gold-deep font-serif text-2xl font-extrabold text-ink-0 shadow-[0_12px_30px_-8px_rgba(212,175,55,0.55)]">
          L
        </span>
        <h1 className="mt-4 font-serif text-2xl text-white">لوحة الإدارة</h1>
        <p className="mt-1 text-sm text-white/50">LUXE Administration</p>
      </div>
      <div className="mb-4">
        <label className="label">اسم المستخدم</label>
        <input
          className="input"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoComplete="username"
          autoFocus
        />
      </div>
      <div className="mb-6">
        <label className="label">كلمة المرور</label>
        <input
          type="password"
          className="input"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <button disabled={loading} className="btn btn-primary w-full">
        {loading ? "جارٍ التحقق…" : "دخول"}
      </button>
    </form>
  );
}
