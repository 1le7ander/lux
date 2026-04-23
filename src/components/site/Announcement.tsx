export function Announcement() {
  const messages = [
    "🔥 توصيل مجاني للطلبات فوق 3000 دج",
    "✨ ضمان الجودة 100%",
    "💬 دعم 24/7 عبر واتساب",
    "🚚 توصيل لجميع ولايات الجزائر",
    "💎 كولكشن جديدة كل أسبوع",
  ];
  return (
    <div className="overflow-hidden bg-gradient-to-l from-plum via-plum-deep to-plum py-2 text-[12px] text-gold-soft ring-1 ring-inset ring-white/5">
      <div className="relative flex animate-[scroll_30s_linear_infinite] gap-10 whitespace-nowrap px-6">
        {[...messages, ...messages].map((m, i) => (
          <span key={i} className="inline-block tracking-wide">
            {m}
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
