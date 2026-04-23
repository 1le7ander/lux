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
      className="w-full max-w-sm card p-6"
      noValidate
    >
      <h1 className="mb-1 font-serif text-2xl text-gold">لوحة الإدارة</h1>
      <p className="mb-5 text-sm text-white/60">LUXE Administration</p>
      <div className="mb-3">
        <label className="label">اسم المستخدم</label>
        <input
          className="input"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          autoComplete="username"
        />
      </div>
      <div className="mb-5">
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
