"use client";

import { useState } from "react";
import { useCart } from "@/stores/cart-store";
import { openCart } from "@/components/site/cart-bus";
import { toast } from "@/components/site/ToastHost";
import { OrderModal } from "@/components/product/OrderModal";
import type { Product } from "@/products/types";

export function ProductActions({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <div className="inline-flex overflow-hidden rounded-full ring-1 ring-white/10">
        <button
          className="px-4 py-2 text-white/70 hover:bg-white/5"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="نقصان"
        >
          −
        </button>
        <span className="w-12 py-2 text-center text-white">{qty}</span>
        <button
          className="px-4 py-2 text-white/70 hover:bg-white/5"
          onClick={() => setQty((q) => q + 1)}
          aria-label="زيادة"
        >
          +
        </button>
      </div>
      <button
        onClick={() => {
          add(product, qty);
          toast("تمت الإضافة إلى السلة", "success");
          openCart();
        }}
        className="btn btn-ghost"
      >
        🛒 أضف للسلة
      </button>
      <button onClick={() => setOrderOpen(true)} className="btn btn-primary">
        🛍 اطلب الآن
      </button>

      {orderOpen && (
        <OrderModal product={product} onClose={() => setOrderOpen(false)} />
      )}
    </div>
  );
}
