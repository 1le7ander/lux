"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const safe = images.length > 0 ? images : ["https://picsum.photos/800/1000"];

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-2 ring-1 ring-white/10 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
        <Image
          key={safe[active]}
          src={safe[active]}
          alt={title}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="animate-fade-in object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-0/30 via-transparent to-transparent" />
      </div>
      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:gap-3">
          {safe.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 transition-all duration-300 sm:h-24 sm:w-24 ${
                i === active
                  ? "ring-2 ring-gold shadow-[0_8px_24px_-6px_rgba(212,175,55,0.5)]"
                  : "ring-white/10 hover:ring-white/40 opacity-70 hover:opacity-100"
              }`}
              aria-label={`صورة ${i + 1}`}
              aria-pressed={i === active}
            >
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
