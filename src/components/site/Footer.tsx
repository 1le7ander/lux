import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/config";

export function Footer() {
  return (
    <footer
      id="contact"
      className="relative mt-12 border-t border-white/10 bg-ink-1/80 py-10 text-sm text-white/70 backdrop-blur-xl sm:py-14"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/40 to-transparent" />
      <div className="container-luxe grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold-deep font-serif font-extrabold text-ink-0 shadow-[0_10px_24px_-8px_rgba(212,175,55,0.5)]">
              L
            </span>
            <span className="gold-text font-serif text-xl font-extrabold tracking-[0.18em]">
              {SITE.name}
            </span>
          </div>
          <p className="max-w-sm leading-relaxed text-white/60">
            متجر الأزياء الفاخر في الجزائر — أزياء راقية تعكس شخصيتك وتمنحك
            إطلالة استثنائية.
          </p>
          <div className="mt-5 flex gap-2">
            <SocialLink label="WhatsApp" href={`https://wa.me/${SITE.whatsapp}`}>W</SocialLink>
            <SocialLink label="Instagram" href="#">I</SocialLink>
            <SocialLink label="Facebook" href="#">F</SocialLink>
            <SocialLink label="Email" href={`mailto:${SITE.email}`}>E</SocialLink>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">روابط سريعة</h4>
          <ul className="space-y-2.5">
            <FootLink href="/">الرئيسية</FootLink>
            <FootLink href="/shop">المتجر</FootLink>
            <FootLink href="/#offers">العروض</FootLink>
            <FootLink href="/admin/login">لوحة الإدارة</FootLink>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">تصنيفات</h4>
          <ul className="grid grid-cols-1 gap-2.5 xs:grid-cols-2 lg:grid-cols-1">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop/${c.id}`}
                  className="inline-flex items-center gap-2 text-white/70 transition hover:text-gold"
                >
                  <span>{c.emoji}</span>
                  <span>{c.ar}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-base text-white">تواصل معنا</h4>
          <ul className="space-y-2.5">
            <li>
              <a href={`tel:+${SITE.whatsapp}`} className="inline-flex items-center gap-2 text-white/70 transition hover:text-gold">
                📞 <span dir="ltr">+{SITE.whatsapp}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 break-all text-white/70 transition hover:text-gold">
                ✉ {SITE.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2 text-white/70">
              📍 الجزائر العاصمة
            </li>
          </ul>
        </div>
      </div>

      <div className="container-luxe mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
        <span>© {new Date().getFullYear()} {SITE.name} — جميع الحقوق محفوظة</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gold">سياسة الخصوصية</a>
          <span className="opacity-40">·</span>
          <a href="#" className="hover:text-gold">الشروط والأحكام</a>
        </div>
      </div>
    </footer>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-block text-white/70 transition hover:translate-x-[-4px] hover:text-gold">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      aria-label={label}
      href={href}
      className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.04] text-white/80 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-gold/15 hover:text-gold hover:ring-gold/40"
    >
      {children}
    </a>
  );
}
