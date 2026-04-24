"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE, CATEGORIES } from "@/lib/config";
import { useCart } from "@/stores/cart-store";
import { openCart } from "./cart-bus";

export function Header() {
  const count = useCart((s) => s.count());
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (navOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink-0/80 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-ink-0/40 backdrop-blur-md"
      }`}
    >
      <div className="container-luxe flex h-16 items-center justify-between gap-2 sm:h-[72px] sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="tap grid place-items-center rounded-xl text-white/80 transition hover:bg-white/5 hover:text-gold md:hidden"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="القائمة"
            aria-expanded={navOpen}
          >
            <span className="relative block h-5 w-6">
              <span
                className={`absolute inset-x-0 top-1 block h-0.5 bg-current transition-all duration-300 ${
                  navOpen ? "top-2.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 top-2.5 block h-0.5 bg-current transition-all duration-300 ${
                  navOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 top-4 block h-0.5 bg-current transition-all duration-300 ${
                  navOpen ? "top-2.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
          <button
            type="button"
            className="tap hidden place-items-center rounded-xl text-white/80 transition hover:bg-white/5 hover:text-gold sm:grid"
            aria-label="بحث"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <button
            type="button"
            className="tap relative grid place-items-center rounded-xl text-white/80 transition hover:bg-white/5 hover:text-gold"
            aria-label="السلة"
            onClick={openCart}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] animate-pop-in items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink-0 shadow-[0_4px_12px_-2px_rgba(212,175,55,0.6)] ring-2 ring-ink-0">
                {count}
              </span>
            )}
          </button>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-white/80 lg:flex lg:gap-8">
          <NavLink href="/">الرئيسية</NavLink>
          <div className="group relative">
            <button className="inline-flex items-center gap-1 text-white/80 transition hover:text-gold">
              التصنيفات
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className="invisible absolute right-0 top-full w-64 translate-y-1 rounded-2xl border border-white/10 bg-ink-2/95 p-2 opacity-0 shadow-luxe backdrop-blur-xl transition-all duration-300 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${c.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/80 transition hover:bg-white/5 hover:text-gold"
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span>{c.ar}</span>
                </Link>
              ))}
            </div>
          </div>
          <NavLink href="/shop">المتجر</NavLink>
          <NavLink href="/#offers">العروض</NavLink>
          <NavLink href="/#about">من نحن</NavLink>
          <NavLink href="/#contact">اتصل بنا</NavLink>
        </nav>

        <Link href="/" className="group flex items-center gap-2" aria-label={SITE.name}>
          <span className="gold-text font-serif text-xl font-extrabold tracking-[0.18em] sm:text-2xl">
            {SITE.name}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold-deep font-serif font-extrabold text-ink-0 shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] transition-transform group-hover:scale-105 sm:h-10 sm:w-10">
            L
          </span>
        </Link>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-16 z-30 lg:hidden ${
          navOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!navOpen}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            navOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setNavOpen(false)}
        />
        <nav
          className={`absolute inset-x-0 top-0 border-b border-white/10 bg-ink-1/95 backdrop-blur-xl transition-transform duration-300 ${
            navOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="container-luxe flex flex-col gap-1 py-4 text-sm">
            <MobileLink href="/" onSelect={() => setNavOpen(false)}>
              🏠 الرئيسية
            </MobileLink>
            <MobileLink href="/shop" onSelect={() => setNavOpen(false)}>
              🛍 المتجر
            </MobileLink>
            <div className="mt-2 px-3 text-[10px] uppercase tracking-widest text-white/40">
              التصنيفات
            </div>
            <div className="grid grid-cols-2 gap-2 px-1 py-1">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${c.id}`}
                  onClick={() => setNavOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-3 text-white/80 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-gold active:scale-[0.98]"
                >
                  <span className="text-base">{c.emoji}</span>
                  <span>{c.ar}</span>
                </Link>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 px-1">
              <MobileLink href="/#offers" onSelect={() => setNavOpen(false)}>
                🔥 العروض
              </MobileLink>
              <MobileLink href="/#contact" onSelect={() => setNavOpen(false)}>
                ✉ اتصل بنا
              </MobileLink>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative py-1 text-white/80 transition hover:text-gold"
    >
      {children}
      <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-px w-0 bg-gradient-to-l from-transparent via-gold to-transparent transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onSelect,
}: {
  href: string;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-gold active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}
