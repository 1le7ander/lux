"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE, CATEGORIES } from "@/lib/config";
import { useCart } from "@/stores/cart-store";
import { openCart } from "./cart-bus";

export function Header() {
  const count = useCart((s) => s.count());
  const [navOpen, setNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-0/70 backdrop-blur-xl">
      <div className="container-luxe flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg p-2 text-white/80 hover:bg-white/5 md:hidden"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="القائمة"
          >
            ☰
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-white/80 hover:bg-white/5"
            aria-label="بحث"
          >
            🔍
          </button>
          <button
            type="button"
            className="relative rounded-lg p-2 text-white/80 hover:bg-white/5"
            aria-label="السلة"
            onClick={openCart}
          >
            🛍
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink-0">
                {count}
              </span>
            )}
          </button>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-white/80 md:flex">
          <Link href="/" className="hover:text-gold">الرئيسية</Link>
          <div className="group relative">
            <button className="hover:text-gold">التصنيفات ▾</button>
            <div className="invisible absolute right-0 mt-2 w-56 rounded-2xl bg-ink-2 p-2 opacity-0 shadow-luxe ring-1 ring-white/10 transition group-hover:visible group-hover:opacity-100">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${c.id}`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5"
                >
                  <span>{c.emoji}</span>
                  <span>{c.ar}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link href="/shop" className="hover:text-gold">المتجر</Link>
          <Link href="/#offers" className="hover:text-gold">العروض</Link>
          <Link href="/#about" className="hover:text-gold">من نحن</Link>
          <Link href="/#contact" className="hover:text-gold">اتصل بنا</Link>
        </nav>

        <Link href="/" className="flex items-center gap-2" aria-label={SITE.name}>
          <span className="font-serif text-2xl font-extrabold tracking-wider text-gold">
            {SITE.name}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep font-serif font-extrabold text-ink-0">
            L
          </span>
        </Link>
      </div>

      {navOpen && (
        <nav className="border-t border-white/10 bg-ink-1/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" onClick={() => setNavOpen(false)} className="rounded-xl px-3 py-2 hover:bg-white/5">الرئيسية</Link>
            <Link href="/shop" onClick={() => setNavOpen(false)} className="rounded-xl px-3 py-2 hover:bg-white/5">المتجر</Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/shop/${c.id}`}
                onClick={() => setNavOpen(false)}
                className="rounded-xl px-3 py-2 hover:bg-white/5"
              >
                {c.emoji} {c.ar}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
