import type { OrderStatus } from "@/orders/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "جديد",
  confirmed: "مؤكد",
  shipped: "شُحن",
  delivered: "سُلّم",
  cancelled: "ملغى",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  new: "bg-amber-500/20 text-amber-200 ring-amber-400/30",
  confirmed: "bg-sky-500/20 text-sky-200 ring-sky-400/30",
  shipped: "bg-indigo-500/20 text-indigo-200 ring-indigo-400/30",
  delivered: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30",
  cancelled: "bg-red-500/20 text-red-200 ring-red-400/30",
};
