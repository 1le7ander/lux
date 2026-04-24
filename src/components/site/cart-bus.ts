"use client";

/**
 * Lightweight event bus used by <Header> and product pages to open the
 * <CartDrawer>. Kept as a tiny EventTarget to avoid lifting cart-open
 * state into a provider just for a transient UI flag.
 */

type CartEventName = "open" | "close";

const target =
  typeof window !== "undefined" ? new EventTarget() : (null as EventTarget | null);

export function openCart(): void {
  target?.dispatchEvent(new Event("open"));
}

export function closeCart(): void {
  target?.dispatchEvent(new Event("close"));
}

export function onCartEvent(name: CartEventName, handler: () => void): () => void {
  if (!target) return () => {};
  target.addEventListener(name, handler);
  return () => target.removeEventListener(name, handler);
}
