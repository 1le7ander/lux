"use client";

import Image from "next/image";
import { useState } from "react";
import { WILAYAS, shippingFor } from "@/lib/wilayas";
import { formatPrice, generateOrderId } from "@/lib/format";
import { toast } from "@/components/site/ToastHost";
import { customerSchema, type CustomerInput } from "@/orders/schema";
import type { Order } from "@/orders/types";
import type { Product } from "@/products/types";

type Step = "form" | "confirm" | "done";

const emptyForm: CustomerInput = {
  name: "",
  phone: "",
  wilaya: "",
  commune: "",
  notes: "",
};

export function OrderModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInput, string>>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const wilayaEn = form.wilaya;
  const shipping = shippingFor(wilayaEn);
  const subtotal = product.price;
  const total = subtotal + shipping;

  const update = <K extends keyof CustomerInput>(k: K, v: CustomerInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validate(): boolean {
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const map: Partial<Record<keyof CustomerInput, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CustomerInput;
        if (!map[key]) map[key] = issue.message;
      }
      setErrors(map);
      toast("يرجى تصحيح الأخطاء في النموذج", "error");
      return false;
    }
    setErrors({});
    return true;
  }

  async function submit() {
    setSubmitting(true);
    try {
      const order: Order = {
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        status: "new",
        customer: form,
        items: [
          {
            id: product.id,
            title: product.title,
            qty: 1,
            price: product.price,
            image: product.image,
          },
        ],
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

      // Mirror to localStorage for offline/admin fallback
      try {
        const key = "luxe_orders";
        const prev = JSON.parse(localStorage.getItem(key) || "[]") as Order[];
        localStorage.setItem(key, JSON.stringify([order, ...prev]));
      } catch {
        /* ignore storage errors */
      }

      setOrderId(order.id);
      setStep("done");
      toast("تم تأكيد طلبك!", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-t-3xl bg-ink-1 p-6 ring-1 ring-white/10 md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl text-gold">
            {step === "form" && "🛍 اطلب الآن"}
            {step === "confirm" && "✅ تأكيد الطلب"}
            {step === "done" && "🎉 تم تأكيد طلبك!"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/70 hover:bg-white/5"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </header>

        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/5">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-ink-3">
            <Image src={product.image} alt={product.title} fill sizes="56px" className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white">{product.title}</p>
            <p className="font-serif text-gold">{formatPrice(product.price)}</p>
          </div>
        </div>

        {step === "form" && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (validate()) setStep("confirm");
            }}
            noValidate
          >
            <div>
              <label className="label">الاسم الكامل</label>
              <input
                className={`input ${errors.name ? "input-error" : ""}`}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="أدخل اسمك الكامل"
              />
              {errors.name && <p className="mt-1 text-xs text-red-300">⚠ {errors.name}</p>}
            </div>
            <div>
              <label className="label">رقم الهاتف</label>
              <input
                className={`input ${errors.phone ? "input-error" : ""}`}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="05xxxxxxxx"
                inputMode="tel"
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
                placeholder="اسم البلدية"
              />
              {errors.commune && <p className="mt-1 text-xs text-red-300">⚠ {errors.commune}</p>}
            </div>
            <div>
              <label className="label">ملاحظات (اختياري)</label>
              <textarea
                className="input"
                rows={2}
                value={form.notes ?? ""}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="مقاس، لون، عنوان إضافي…"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
              >
                إلغاء
              </button>
              <button type="submit" className="btn btn-primary">
                التالي ›
              </button>
            </div>
          </form>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] p-4 text-sm ring-1 ring-white/5">
              <Row label="الاسم" value={form.name} />
              <Row label="الهاتف" value={form.phone} />
              <Row label="الولاية" value={form.wilaya} />
              <Row label="البلدية" value={form.commune} />
              {form.notes && <Row label="ملاحظات" value={form.notes} span />}
            </dl>
            <div className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
              <Row label="المنتج" value={formatPrice(subtotal)} />
              <Row label="الشحن" value={formatPrice(shipping)} />
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-sm text-white/70">المجموع</span>
                <span className="font-serif text-xl text-gold">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="btn btn-ghost"
              >
                ‹ رجوع
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? "جارٍ الإرسال…" : "✅ تأكيد الطلب"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 text-6xl">🎉</div>
            <p className="font-serif text-xl text-white">تم تأكيد طلبك!</p>
            {orderId && (
              <p className="mt-2 text-sm text-white/60">
                رقم الطلب: <span className="font-mono text-gold">{orderId}</span>
              </p>
            )}
            <p className="mt-3 text-sm text-white/60">
              سنتواصل معك قريباً لتأكيد التفاصيل.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={onClose} className="btn btn-primary">
                العودة للتسوق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="text-xs text-white/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-white">{value}</dd>
    </div>
  );
}
