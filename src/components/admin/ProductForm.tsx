"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/config";
import { toast } from "@/components/site/ToastHost";
import { ImageUpload } from "./ImageUpload";
import type { Product } from "@/products/types";

type Draft = Omit<Product, "gallery"> & { gallery: string[] };

function blank(): Draft {
  return {
    id: `p${Date.now()}`,
    title: "",
    category: "men",
    price: 0,
    oldPrice: null,
    image: "",
    gallery: [],
    description: "",
    badge: "",
    stock: 0,
  };
}

export function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() =>
    initial ? { ...initial, gallery: initial.gallery ?? [] } : blank()
  );
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  async function save() {
    // HARD BLOCK: cannot save a product without a main image URL.
    if (!draft.image) {
      toast("يجب رفع صورة للمنتج أولاً", "error");
      return;
    }
    if (!draft.title || draft.title.length < 2) {
      toast("العنوان مطلوب", "error");
      return;
    }
    if (!draft.price || draft.price <= 0) {
      toast("السعر مطلوب", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await res.json()) as { success: boolean; error?: string };
      if (!j.success) throw new Error(j.error || "فشل الحفظ");
      toast("تم حفظ المنتج", "success");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-black/70 backdrop-blur-md md:items-center md:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl animate-slide-up flex-col overflow-y-auto rounded-t-3xl bg-ink-1/95 p-5 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10 backdrop-blur-xl sm:p-6 md:max-h-[90vh] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl text-gold">
            {initial ? "تعديل منتج" : "منتج جديد"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/70 hover:bg-white/5"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </header>

        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          <div>
            <label className="label">الصورة الرئيسية</label>
            <ImageUpload
              value={draft.image}
              onChange={(url) => update("image", url)}
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">العنوان</label>
              <input
                className="input"
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="label">التصنيف</label>
                <select
                  className="input"
                  value={draft.category}
                  onChange={(e) =>
                    update("category", e.target.value as Product["category"])
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.ar}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">السعر (دج)</label>
                <input
                  type="number"
                  className="input"
                  value={draft.price || ""}
                  onChange={(e) => update("price", Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="label">السعر الأصلي (اختياري)</label>
                <input
                  type="number"
                  className="input"
                  value={draft.oldPrice ?? ""}
                  onChange={(e) =>
                    update("oldPrice", e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
              <div>
                <label className="label">المخزون</label>
                <input
                  type="number"
                  className="input"
                  value={draft.stock ?? 0}
                  onChange={(e) => update("stock", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="label">الوصف</label>
              <textarea
                className="input"
                rows={3}
                value={draft.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>

            <div>
              <label className="label">شارة (مثلاً: 🔥 رائج)</label>
              <input
                className="input"
                value={draft.badge ?? ""}
                onChange={(e) => update("badge", e.target.value)}
              />
            </div>
          </div>
        </div>

        <footer className="mt-6 flex flex-col-reverse items-stretch gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button onClick={onClose} className="btn btn-ghost">
            إلغاء
          </button>
          <button
            disabled={saving || !draft.image}
            onClick={save}
            className="btn btn-primary"
            title={!draft.image ? "يجب رفع صورة أولاً" : undefined}
          >
            {saving ? "جارٍ الحفظ…" : "💾 حفظ المنتج"}
          </button>
        </footer>
      </div>
    </div>
  );
}
