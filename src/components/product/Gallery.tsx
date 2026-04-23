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
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-2 ring-1 ring-white/10">
        <Image
          src={safe[active]}
          alt={title}
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {safe.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {safe.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 transition ${
                i === active ? "ring-gold" : "ring-white/10 hover:ring-white/30"
              }`}
              aria-label={`صورة ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
