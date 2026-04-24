import type { Metadata, Viewport } from "next";
import { SITE } from "@/lib/config";
import { Announcement } from "@/components/site/Announcement";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastHost } from "@/components/site/ToastHost";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: `${SITE.name} — ${SITE.tagline}. متجر أزياء فاخر في الجزائر.`,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: "متجر أزياء فاخر في الجزائر.",
    locale: "ar_DZ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07000f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        <Announcement />
        <Header />
        <main className="pb-20">{children}</main>
        <Footer />
        <CartDrawer />
        <ToastHost />
      </body>
    </html>
  );
}
