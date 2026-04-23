"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const sec = Math.floor(diff / 1000);
  return {
    days: Math.floor(sec / 86400),
    hours: Math.floor((sec % 86400) / 3600),
    minutes: Math.floor((sec % 3600) / 60),
    seconds: sec % 60,
  };
}

export function Hero() {
  // target: 3 days from now at midnight
  const [target] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const t = useCountdown(target);

  return (
    <section className="relative overflow-hidden">
      <div className="container-luxe relative flex min-h-[620px] flex-col items-center justify-center py-16 text-center">
        <span className="mb-4 rounded-full border border-gold/30 bg-black/30 px-4 py-1 text-xs tracking-widest text-gold-soft">
          ✦ الكولكشن الجديدة 2025
        </span>
        <h1 className="text-balance font-serif text-5xl font-extrabold leading-tight text-white md:text-7xl">
          <span className="block bg-gradient-to-l from-gold via-gold-soft to-gold bg-clip-text text-transparent">
            أزياء راقية
          </span>
          <span className="block text-white/95">تعكس شخصيتك</span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-white/70">
          اكتشف أحدث صيحات الموضة العالمية بأسعار حصرية لعملاء LUXE في الجزائر
        </p>

        <div className="mt-8 grid grid-cols-4 gap-3 text-center">
          {[
            { k: "يوم", v: t.days },
            { k: "ساعة", v: t.hours },
            { k: "دقيقة", v: t.minutes },
            { k: "ثانية", v: t.seconds },
          ].map((x) => (
            <div
              key={x.k}
              className="w-16 rounded-2xl bg-white/5 px-2 py-3 ring-1 ring-white/10 md:w-20"
            >
              <div className="font-serif text-2xl text-gold">
                {String(x.v).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[11px] text-white/50">{x.k}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="btn btn-primary">
            ← تسوّق الآن
          </Link>
          <Link href="/#offers" className="btn btn-ghost">
            عرض الكولكشن
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-white/60">
          {["شحن سريع", "ضمان الجودة", "إرجاع مجاني", "دعم 24/7"].map((x) => (
            <span key={x} className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
              ✓ {x}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
