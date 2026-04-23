"use client";

import { useState } from "react";
import { OrdersTable } from "./OrdersTable";
import { ProductsTable } from "./ProductsTable";
import { DashboardCharts } from "./DashboardCharts";

type Tab = "dashboard" | "orders" | "products";

export function AdminShell() {
  const [tab, setTab] = useState<Tab>("dashboard");

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <section className="container-luxe py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-gold">لوحة الإدارة</h1>
          <p className="text-sm text-white/60">LUXE admin console</p>
        </div>
        <button onClick={logout} className="btn btn-ghost">
          خروج
        </button>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">
        {([
          ["dashboard", "📊 اللوحة"],
          ["orders", "📦 الطلبات"],
          ["products", "🛍 المنتجات"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-5 py-2 text-sm ring-1 transition ${
              tab === id
                ? "bg-gold text-ink-0 ring-gold"
                : "bg-white/[0.03] text-white/70 ring-white/10 hover:bg-white/[0.06]"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "dashboard" && <DashboardCharts />}
      {tab === "orders" && <OrdersTable />}
      {tab === "products" && <ProductsTable />}
    </section>
  );
}
