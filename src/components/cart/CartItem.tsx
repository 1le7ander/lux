"use client";

import Image from "next/image";
import { useCart, type CartLine } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";

export function CartItem({ line }: { line: CartLine }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  return (
    <li className="flex gap-3 rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-3">
        <Image
          src={line.image}
          alt={line.title}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white/90">{line.title}</p>
          <button
            onClick={() => remove(line.id)}
            className="text-xs text-white/40 hover:text-red-300"
            aria-label="حذف"
          >
            ✕
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="inline-flex overflow-hidden rounded-full ring-1 ring-white/10">
            <button
              className="px-3 py-1 text-white/70 hover:bg-white/5"
              onClick={() => setQty(line.id, line.qty - 1)}
              aria-label="نقصان"
            >
              −
            </button>
            <span className="w-10 text-center text-sm text-white">{line.qty}</span>
            <button
              className="px-3 py-1 text-white/70 hover:bg-white/5"
              onClick={() => setQty(line.id, line.qty + 1)}
              aria-label="زيادة"
            >
              +
            </button>
          </div>
          <span className="font-serif text-sm text-gold">
            {formatPrice(line.price * line.qty)}
          </span>
        </div>
      </div>
    </li>
  );
}
