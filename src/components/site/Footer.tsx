import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/config";

export function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-white/10 bg-ink-1/70 py-12 text-sm text-white/70"
    >
      <div className="container-luxe grid gap-10 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep font-serif font-extrabold text-ink-0">
              L
            </span>
            <span className="font-serif text-xl font-extrabold tracking-wider text-gold">
              {SITE.name}
            </span>
          </div>
          <p className="leading-relaxed text-white/60">
            متجر الأزياء الفاخر في الجزائر — أزياء راقية تعكس شخصيتك وتمنحك
            إطلالة استثنائية.
          </p>
          <div className="mt-4 flex gap-2">
            <a
              aria-label="WhatsApp"
              href={`https://wa.me/${SITE.whatsapp}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            >
              W
            </a>
            <a aria-label="Instagram" href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10">I</a>
            <a aria-label="Facebook" href="#" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10">F</a>
            <a
              aria-label="Email"
              href={`mailto:${SITE.email}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            >
              E
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-base text-white">روابط سريعة</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-gold">الرئيسية</Link></li>
            <li><Link href="/shop" className="hover:text-gold">المتجر</Link></li>
            <li><Link href="/#offers" className="hover:text-gold">العروض</Link></li>
            <li><Link href="/admin/login" className="hover:text-gold">لوحة الإدارة</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-base text-white">تصنيفات</h4>
          <ul className="space-y-2">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/shop/${c.id}`} className="hover:text-gold">
                  {c.emoji} {c.ar}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-base text-white">تواصل معنا</h4>
          <ul className="space-y-2">
            <li>
              <a href={`tel:+${SITE.whatsapp}`} className="hover:text-gold">
                📞 +{SITE.whatsapp}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-gold">
                ✉ {SITE.email}
              </a>
            </li>
            <li><a href="#" className="hover:text-gold">📍 الجزائر العاصمة</a></li>
          </ul>
        </div>
      </div>

      <div className="container-luxe mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
        <span>© {new Date().getFullYear()} {SITE.name} — جميع الحقوق محفوظة</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gold">سياسة الخصوصية</a>
          <span>·</span>
          <a href="#" className="hover:text-gold">الشروط والأحكام</a>
        </div>
      </div>
    </footer>
  );
}
