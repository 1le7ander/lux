"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/stores/cart-store";
import { closeCart, onCartEvent } from "@/components/site/cart-bus";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/config";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => {
    const offOpen = onCartEvent("open", () => setOpen(true));
    const offClose = onCartEvent("close", () => setOpen(false));
    return () => {
      offOpen();
      offClose();
    };
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const freeShippingMissing = Math.max(0, SITE.freeShippingOver - subtotal);
  const freeShippingPct = Math.min(
    100,
    Math.round((subtotal / SITE.freeShippingOver) * 100)
  );

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => closeCart()}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
        className={`absolute left-0 top-0 flex h-[100dvh] w-full max-w-md flex-col border-r border-white/10 bg-ink-1/95 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-serif text-lg text-gold sm:text-xl">
            🛍 سلة المشتريات
          </h3>
          <button
            onClick={() => closeCart()}
            aria-label="إغلاق"
            className="tap grid place-items-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 text-6xl opacity-40">🛒</div>
              <p className="text-white/80">سلتك فارغة</p>
              <p className="mt-1 text-sm text-white/40">أضف منتجات لتظهر هنا</p>
              <button
                onClick={() => closeCart()}
                className="btn btn-primary mt-6"
              >
                ابدأ التسوق
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((l) => (
                <CartItem key={l.id} line={l} />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-white/10 bg-ink-2/70 p-4 safe-bottom sm:p-5">
            {freeShippingMissing > 0 ? (
              <div className="mb-3 rounded-xl bg-gold/10 p-3 text-xs ring-1 ring-gold/20">
                <div className="mb-2 flex items-center justify-between text-gold-soft">
                  <span>🚚 {formatPrice(freeShippingMissing)} للشحن المجاني</span>
                  <span className="text-[10px] opacity-70">{freeShippingPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold-soft to-gold transition-all duration-700"
                    style={{ width: `${freeShippingPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-3 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 ring-1 ring-emerald-400/20">
                ✓ الشحن مجاني!
              </div>
            )}
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-white/60">المجموع الفرعي</span>
              <span className="font-serif text-lg text-gold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => closeCart()}
              className="btn btn-primary w-full"
            >
              ← متابعة الدفع
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
