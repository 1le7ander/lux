export function Announcement() {
  const messages = [
    "🔥 توصيل مجاني للطلبات فوق 3000 دج",
    "✨ ضمان الجودة 100%",
    "💬 دعم 24/7 عبر واتساب",
    "🚚 توصيل لجميع ولايات الجزائر",
    "💎 كولكشن جديدة كل أسبوع",
  ];
  return (
    <div className="overflow-hidden bg-gradient-to-l from-plum-deep via-plum to-plum-deep py-2 text-[11px] tracking-wide text-gold-soft ring-1 ring-inset ring-white/5 sm:text-[12px]">
      <div className="flex animate-marquee gap-10 whitespace-nowrap px-6">
        {[...messages, ...messages].map((m, i) => (
          <span key={i} className="inline-block">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
