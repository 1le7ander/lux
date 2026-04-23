"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, type ChartConfiguration } from "chart.js/auto";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/orders/types";

export function DashboardCharts() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const salesRef = useRef<HTMLCanvasElement | null>(null);
  const statusRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    fetch("/api/orders?admin=1")
      .then((r) => r.json() as Promise<{ success: boolean; items?: Order[] }>)
      .then((j) => {
        if (j.success && j.items) setOrders(j.items);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;

    const byDay = new Map<string, number>();
    const byStatus = new Map<string, number>();
    for (const o of orders) {
      const day = new Date(o.createdAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + o.total);
      byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1);
    }

    let sales: Chart | null = null;
    let status: Chart | null = null;

    if (salesRef.current) {
      const days = Array.from(byDay.keys()).sort();
      const cfg: ChartConfiguration = {
        type: "line",
        data: {
          labels: days,
          datasets: [
            {
              label: "المبيعات (دج)",
              data: days.map((d) => byDay.get(d) ?? 0),
              borderColor: "#d4af37",
              backgroundColor: "rgba(212,175,55,0.2)",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: "#f3e9d2" } } },
          scales: {
            x: { ticks: { color: "#9c9bae" }, grid: { color: "rgba(255,255,255,0.05)" } },
            y: { ticks: { color: "#9c9bae" }, grid: { color: "rgba(255,255,255,0.05)" } },
          },
        },
      };
      sales = new Chart(salesRef.current, cfg);
    }

    if (statusRef.current) {
      const labels = Array.from(byStatus.keys());
      const cfg: ChartConfiguration = {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: labels.map((l) => byStatus.get(l) ?? 0),
              backgroundColor: ["#d4af37", "#6b2d8f", "#8b4bb8", "#f5d76e", "#4a1f66"],
              borderColor: "rgba(7,0,15,0.8)",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { color: "#f3e9d2" } } },
        },
      };
      status = new Chart(statusRef.current, cfg);
    }

    return () => {
      sales?.destroy();
      status?.destroy();
    };
  }, [orders, loading]);

  const revenue = orders.reduce((acc, o) => acc + o.total, 0);
  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="إجمالي الإيرادات" value={formatPrice(revenue)} />
        <Kpi label="الطلبات" value={String(orders.length)} />
        <Kpi label="طلبات جديدة" value={String(newCount)} />
        <Kpi
          label="متوسط السلة"
          value={
            orders.length
              ? formatPrice(Math.round(revenue / orders.length))
              : "—"
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 font-serif text-lg text-white">المبيعات اليومية</h3>
          <div className="h-64">
            <canvas ref={salesRef} />
          </div>
        </div>
        <div className="card p-4">
          <h3 className="mb-3 font-serif text-lg text-white">حالة الطلبات</h3>
          <div className="h-64">
            <canvas ref={statusRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 font-serif text-2xl text-gold">{value}</div>
    </div>
  );
}
