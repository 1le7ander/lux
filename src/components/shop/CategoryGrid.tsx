import Link from "next/link";
import { CATEGORIES } from "@/lib/config";

const GRADIENTS: Record<string, string> = {
  men: "from-plum to-ink-2",
  women: "from-gold/50 to-plum",
  kids: "from-sky-400/40 to-plum",
  accessories: "from-gold/50 to-plum-deep",
  shoes: "from-plum-soft to-ink-3",
  perfumes: "from-rose-400/40 to-plum",
};

export function CategoryGrid({ counts }: { counts?: Record<string, number> }) {
  return (
    <section className="container-luxe py-12">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-3xl text-white md:text-4xl">
            تسوّق حسب <span className="text-gold">التصنيف</span>
          </h2>
          <p className="mt-1 text-white/60">اختر من مجموعتنا المنتقاة بعناية</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.id}`}
            className={`group relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br ${GRADIENTS[c.id] ?? "from-plum to-ink-2"} ring-1 ring-white/10 hover:ring-gold/40`}
          >
            <div className="absolute inset-0 bg-noise opacity-30" />
            <div className="relative flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <span className="text-4xl">{c.emoji}</span>
              <span className="font-serif text-base text-white">{c.ar}</span>
              <span className="text-xs text-white/60">
                {counts?.[c.id] ?? 0} منتج ›
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
