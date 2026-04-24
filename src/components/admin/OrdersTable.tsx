"use client";

import { useEffect, useState } from "react";
import { formatDateTime, formatPrice } from "@/lib/format";
import { toast } from "@/components/site/ToastHost";
import type { Order, OrderStatus } from "@/orders/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "شُحن",
  delivered: "سُلّم",
  cancelled: "ملغى",
};

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders?admin=1")
      .then((r) => r.json() as Promise<{ success: boolean; items?: Order[] }>)
      .then((j) => {
        if (j.success && j.items) setOrders(j.items);
      })
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const j = (await res.json()) as { success: boolean; error?: string };
    if (!j.success) {
      toast(j.error || "فشل التحديث", "error");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    toast("تم التحديث", "success");
  }

  if (loading) return <SkeletonTable />;

  if (orders.length === 0) {
    return (
      <div className="card p-10 text-center text-white/60">
        لا توجد طلبات بعد.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] text-right text-sm">
        <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-white/50">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">التاريخ</th>
            <th className="px-4 py-3">العميل</th>
            <th className="px-4 py-3">الهاتف</th>
            <th className="px-4 py-3">الولاية</th>
            <th className="px-4 py-3">الإجمالي</th>
            <th className="px-4 py-3">الحالة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-mono text-xs text-gold">{o.id}</td>
              <td className="px-4 py-3 text-white/70">{formatDateTime(o.createdAt)}</td>
              <td className="px-4 py-3">{o.customer.name}</td>
              <td className="px-4 py-3 font-mono text-white/70">{o.customer.phone}</td>
              <td className="px-4 py-3">{o.customer.wilaya}</td>
              <td className="px-4 py-3 font-serif text-gold">
                {formatPrice(o.total)}
              </td>
              <td className="px-4 py-3">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                  className="rounded-xl bg-white/5 px-2 py-1 text-xs text-white ring-1 ring-white/10"
                >
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="card p-6 text-center text-white/50">
      <span className="inline-block h-4 w-40 animate-pulse rounded bg-white/10" />
    </div>
  );
}
