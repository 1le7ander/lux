"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Toast = {
  id: number;
  message: string;
  variant: "info" | "success" | "error" | "warning";
};

const bus = typeof window !== "undefined" ? new EventTarget() : null;

export function toast(
  message: string,
  variant: Toast["variant"] = "info"
): void {
  bus?.dispatchEvent(
    new CustomEvent("toast", { detail: { message, variant } })
  );
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!bus) return;
    const handler = (e: Event) => {
      const { message, variant } = (e as CustomEvent<{
        message: string;
        variant: Toast["variant"];
      }>).detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    bus.addEventListener("toast", handler);
    return () => bus.removeEventListener("toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-full px-5 py-2.5 text-sm font-medium shadow-luxe ring-1 backdrop-blur animate-slide-up",
            t.variant === "success" &&
              "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
            t.variant === "error" &&
              "bg-red-500/15 text-red-200 ring-red-400/30",
            t.variant === "warning" &&
              "bg-amber-500/15 text-amber-200 ring-amber-400/30",
            t.variant === "info" &&
              "bg-white/10 text-white ring-white/15"
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
