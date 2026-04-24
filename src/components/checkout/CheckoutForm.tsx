"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/stores/cart-store";
import { formatPrice, generateOrderId } from "@/lib/format";
import { WILAYAS, shippingFor } from "@/lib/wilayas";
import { customerSchema, type CustomerInput } from "@/orders/schema";
import { toast } from "@/components/site/ToastHost";
import type { Order } from "@/orders/types";

const emptyForm: CustomerInput = {
  name: "",
  phone: "",
  wilaya: "",
  commune: "",
  notes: "",
};

export function CheckoutForm() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const shipping = useMemo(() => shippingFor(form.wilaya), [form.wilaya]);
  const total = subtotal + shipping;

  const update = <K extends keyof CustomerInput>(k: K, v: CustomerInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast("السلة فارغة", "error");
      return;
    }
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const map: Partial<Record<keyof CustomerInput, string>> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof CustomerInput;
        if (!map[k]) map[k] = i.message;
      }
      setErrors(map);
      toast("يرجى تصحيح الأخطاء في النموذج", "error");
      return;
    }

    setSubmitting(true);
    try {
      const order: Order = {
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        status: "new",
        customer: form,
        items: items.map((l) => ({
          id: l.id,
          title: l.title,
          qty: l.qty,
          price: l.price,
          image: l.image,
        })),
        subtotal,
        shipping,
        total,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error || "فشل إرسال الطلب");

      try {
        const prev = JSON.parse(localStorage.getItem("luxe_orders") || "[]") as Order[];
        localStorage.setItem("luxe_orders", JSON.stringify([order, ...prev]));
      } catch {
        /* ignore */
      }
      setOrderId(order.id);
      clear();
      toast("تم تأكيد طلبك!", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-xl card animate-pop-in p-8 text-center sm:p-10">
        <div className="mb-4 text-6xl">🎉</div>
        <h2 className="font-serif text-2xl text-white sm:text-3xl">تم تأكيد طلبك!</h2>
        <p className="mt-2 text-white/60">
          رقم الطلب: <span className="font-mono text-gold">{orderId}</span>
        </p>
        <p className="mt-3 text-sm text-white/50">
          سنتواصل معك قريباً عبر الهاتف لتأكيد التوصيل.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            العودة للرئيسية
          </Link>
          <Link href="/shop" className="btn btn-ghost">
            متابعة التسوق
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl card p-8 text-center sm:p-10">
        <div className="mb-4 text-5xl opacity-40">🛒</div>
        <p className="text-white/70">سلتك فارغة — أضف منتجات للمتابعة.</p>
        <Link href="/shop" className="btn btn-primary mt-6">
          ابدأ التسوق
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]" noValidate>
      <div className="space-y-4 card p-5 sm:p-6">
        <h3 className="font-serif text-lg text-white">معلومات التوصيل</h3>
        <div>
          <label className="label">الاسم الكامل</label>
          <input
            className={`input ${errors.name ? "input-error" : ""}`}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          {errors.name && <p className="mt-1 text-xs text-red-300">⚠ {errors.name}</p>}
        </div>
        <div>
          <label className="label">رقم الهاتف</label>
          <input
            className={`input ${errors.phone ? "input-error" : ""}`}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            inputMode="tel"
            placeholder="05xxxxxxxx"
          />
          {errors.phone && <p className="mt-1 text-xs text-red-300">⚠ {errors.phone}</p>}
        </div>
        <div>
          <label className="label">الولاية</label>
          <select
            className={`input ${errors.wilaya ? "input-error" : ""}`}
            value={form.wilaya}
            onChange={(e) => update("wilaya", e.target.value)}
          >
            <option value="">اختر الولاية</option>
            {WILAYAS.map(([n, en, ar]) => (
              <option key={n} value={en}>
                {String(n).padStart(2, "0")} — {ar} — {en}
              </option>
            ))}
          </select>
          {errors.wilaya && <p className="mt-1 text-xs text-red-300">⚠ {errors.wilaya}</p>}
        </div>
        <div>
          <label className="label">البلدية</label>
          <input
            className={`input ${errors.commune ? "input-error" : ""}`}
            value={form.commune}
            onChange={(e) => update("commune", e.target.value)}
          />
          {errors.commune && (
            <p className="mt-1 text-xs text-red-300">⚠ {errors.commune}</p>
          )}
        </div>
        <div>
          <label className="label">ملاحظات (اختياري)</label>
          <textarea
            className="input"
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>
      </div>

      <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
        <h3 className="mb-4 font-serif text-lg text-white">ملخّص الطلب</h3>
        <ul className="space-y-3">
          {items.map((l) => (
            <li key={l.id} className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-ink-3">
                <Image src={l.image} alt={l.title} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="line-clamp-1 text-sm">{l.title}</p>
                <p className="text-xs text-white/50">× {l.qty}</p>
              </div>
              <span className="font-serif text-sm text-gold">
                {formatPrice(l.price * l.qty)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm">
          <Row label="المجموع الفرعي" value={formatPrice(subtotal)} />
          <Row label="الشحن" value={formatPrice(shipping)} />
        </dl>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-sm text-white/70">المجموع</span>
          <span className="font-serif text-2xl text-gold">{formatPrice(total)}</span>
        </div>
        <button
          disabled={submitting}
          className="btn btn-primary mt-5 w-full"
        >
          {submitting ? "جارٍ الإرسال…" : "✅ تأكيد الطلب"}
        </button>
      </aside>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
