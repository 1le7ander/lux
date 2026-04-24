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
    <section className="container-luxe py-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
        <div>
          <h1 className="font-serif text-2xl text-gold sm:text-3xl">
            لوحة الإدارة
          </h1>
          <p className="text-xs text-white/50 sm:text-sm">
            LUXE admin console
          </p>
        </div>
        <button onClick={logout} className="btn btn-ghost !px-4 !py-2 !text-xs">
          خروج
        </button>
      </header>

      <nav className="mb-6 flex flex-nowrap gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap sm:overflow-visible">
        {([
          ["dashboard", "📊 اللوحة"],
          ["orders", "📦 الطلبات"],
          ["products", "🛍 المنتجات"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-all duration-300 sm:px-5 ${
              tab === id
                ? "bg-gradient-to-l from-gold-soft to-gold text-ink-0 ring-gold shadow-[0_10px_24px_-8px_rgba(212,175,55,0.55)]"
                : "bg-white/[0.03] text-white/70 ring-white/10 hover:bg-white/[0.08] hover:text-white hover:ring-white/20"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="animate-fade-in">
        {tab === "dashboard" && <DashboardCharts />}
        {tab === "orders" && <OrdersTable />}
        {tab === "products" && <ProductsTable />}
      </div>
    </section>
  );
}
