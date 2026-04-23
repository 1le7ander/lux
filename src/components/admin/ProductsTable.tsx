"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { categoryLabel } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { toast } from "@/components/site/ToastHost";
import { ProductForm } from "./ProductForm";
import type { Product } from "@/products/types";

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const j = (await res.json()) as {
        success: boolean;
        items?: Product[];
      };
      if (j.success && j.items) setProducts(j.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function del(id: string) {
    if (!confirm("حذف هذا المنتج؟")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const j = (await res.json()) as { success: boolean; error?: string };
    if (!j.success) {
      toast(j.error || "فشل الحذف", "error");
      return;
    }
    toast("تم الحذف", "success");
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setCreating(true)} className="btn btn-primary">
          + منتج جديد
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-center text-white/50">جارٍ التحميل…</div>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-white/60">
          لا توجد منتجات بعد.
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3">الصورة</th>
                <th className="px-4 py-3">المنتج</th>
                <th className="px-4 py-3">التصنيف</th>
                <th className="px-4 py-3">السعر</th>
                <th className="px-4 py-3">المخزون</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-ink-3">
                      <Image src={p.image} alt={p.title} fill sizes="48px" className="object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 text-white/60">
                    {categoryLabel(p.category)}
                  </td>
                  <td className="px-4 py-3 font-serif text-gold">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 text-white/60">{p.stock ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs ring-1 ring-white/10 hover:bg-white/10"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => del(p.id)}
                        className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300 ring-1 ring-red-400/30 hover:bg-red-500/20"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <ProductForm
          initial={editing ?? undefined}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
