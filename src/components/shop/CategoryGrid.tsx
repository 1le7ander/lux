import Link from "next/link";
import { CATEGORIES } from "@/lib/config";

const GRADIENTS: Record<string, string> = {
  men: "from-plum via-plum-deep to-ink-2",
  women: "from-gold/55 via-plum to-ink-3",
  kids: "from-sky-400/45 via-plum to-ink-3",
  accessories: "from-gold/55 via-plum-deep to-ink-2",
  shoes: "from-plum-soft via-plum to-ink-3",
  perfumes: "from-rose-400/50 via-plum to-ink-3",
};

export function CategoryGrid({ counts }: { counts?: Record<string, number> }) {
  return (
    <section className="container-luxe py-12 sm:py-16">
      <header className="mb-6 flex flex-col items-start gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="h-section">
            تسوّق حسب <span className="gold-text">التصنيف</span>
          </h2>
          <p className="h-section-sub">اختر من مجموعتنا المنتقاة بعناية</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.id}
            href={`/shop/${c.id}`}
            style={{ animationDelay: `${i * 60}ms` }}
            className={`group relative aspect-[4/5] animate-slide-up overflow-hidden rounded-2xl bg-gradient-to-br ${
              GRADIENTS[c.id] ?? "from-plum to-ink-2"
            } ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe hover:ring-gold/50`}
          >
            <div className="absolute inset-0 bg-noise opacity-25 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-0/60 via-transparent to-transparent" />
            <div className="relative flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <span className="text-4xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 sm:text-5xl">
                {c.emoji}
              </span>
              <span className="font-serif text-base font-semibold text-white sm:text-lg">
                {c.ar}
              </span>
              <span className="text-[11px] text-white/70 transition-colors group-hover:text-gold-soft sm:text-xs">
                {counts?.[c.id] ?? 0} منتج ›
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
