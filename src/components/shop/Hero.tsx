"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function useCountdown(target: Date) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = now == null ? 0 : Math.max(0, target.getTime() - now);
  const sec = Math.floor(diff / 1000);
  return {
    ready: now != null,
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
  };
}

export function Hero() {
  const [target] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const t = useCountdown(target);

  return (
    <section className="relative overflow-hidden">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-gold/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-plum/40 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.15]" />

      <div className="container-luxe relative flex min-h-[560px] flex-col items-center justify-center py-14 text-center sm:min-h-[640px] sm:py-20 lg:min-h-[720px] lg:py-24">
        <span className="mb-4 inline-flex animate-fade-in items-center gap-2 rounded-full border border-gold/30 bg-black/40 px-4 py-1.5 text-[11px] tracking-[0.2em] text-gold-soft backdrop-blur-md sm:text-xs">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
          ✦ الكولكشن الجديدة 2025
        </span>
        <h1 className="text-balance font-serif text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-white animate-slide-up sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          <span className="block gold-text drop-shadow-gold">
            أزياء راقية
          </span>
          <span className="mt-1 block text-white/95">تعكس شخصيتك</span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-sm leading-relaxed text-white/70 animate-slide-up sm:text-base md:text-lg">
          اكتشف أحدث صيحات الموضة العالمية بأسعار حصرية لعملاء LUXE في الجزائر
        </p>

        <div className="mt-8 grid grid-cols-4 gap-2 text-center sm:gap-3">
          {[
            { k: "يوم", v: t.days },
            { k: "ساعة", v: t.hours },
            { k: "دقيقة", v: t.minutes },
            { k: "ثانية", v: t.seconds },
          ].map((x) => (
            <div
              key={x.k}
              className="w-[68px] rounded-2xl bg-white/[0.04] px-2 py-3 ring-1 ring-white/10 backdrop-blur-md transition-all hover:ring-gold/40 sm:w-20 sm:py-4"
            >
              <div className="font-serif text-2xl font-bold text-gold sm:text-3xl">
                {t.ready ? String(x.v).padStart(2, "0") : "--"}
              </div>
              <div className="mt-1 text-[10px] tracking-widest text-white/50 sm:text-[11px]">
                {x.k}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row">
          <Link href="/shop" className="btn btn-primary w-full sm:w-auto">
            ← تسوّق الآن
          </Link>
          <Link href="/#offers" className="btn btn-ghost w-full sm:w-auto">
            عرض الكولكشن
          </Link>
        </div>

        <div className="mt-8 flex max-w-xl flex-wrap items-center justify-center gap-2 text-[11px] text-white/60 sm:text-xs">
          {["شحن سريع", "ضمان الجودة", "إرجاع مجاني", "دعم 24/7"].map((x) => (
            <span
              key={x}
              className="chip transition hover:border-gold/30 hover:text-white"
            >
              <span className="text-gold">✓</span> {x}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
