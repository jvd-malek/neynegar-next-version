import "./globals.css";
import Footer from "../lib/Components/Footer/Footer";
import Header from "../lib/Components/Header/Header";
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: "فروشگاه اینترنتی نی‌نگار | لوازم خوشنویسی و هنرهای سنتی",
  description: "فروشگاه اینترنتی نی‌نگار، ارائه‌دهنده لوازم خوشنویسی، قلم‌های مرغوب، کاغذهای باکیفیت و کتاب‌های آموزشی خوشنویسی. خرید آنلاین با بهترین قیمت و تحویل سریع.",
  keywords: ["خوشنویسی", "لوازم خوشنویسی", "قلم خوشنویسی", "کاغذ خوشنویسی", "کتاب خوشنویسی", "هنرهای سنتی", "فروشگاه اینترنتی"],
  robots: "index, follow",
  themeColor: "#f1f5f9",
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "فروشگاه اینترنتی نی‌نگار | لوازم خوشنویسی و هنرهای سنتی",
    description: "فروشگاه اینترنتی نی‌نگار، ارائه‌دهنده لوازم خوشنویسی، قلم‌های مرغوب، کاغذهای باکیفیت و کتاب‌های آموزشی خوشنویسی. خرید آنلاین با بهترین قیمت و تحویل سریع.",
    url: "https://neynegar1.ir/",
    siteName: "نی‌نگار",
    images: [
      {
        url: "https://neynegar1.ir/logo.png",
        width: 800,
        height: 600,
        alt: "لوگو نی‌نگار",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "فروشگاه اینترنتی نی‌نگار | لوازم خوشنویسی و هنرهای سنتی",
    description: "فروشگاه اینترنتی نی‌نگار، ارائه‌دهنده لوازم خوشنویسی، قلم‌های مرغوب، کاغذهای باکیفیت و کتاب‌های آموزشی خوشنویسی. خرید آنلاین با بهترین قیمت و تحویل سریع.",
    images: ["https://neynegar1.ir/logo.png"],
  },
  alternates: {
    canonical: "https://neynegar1.ir/",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning>
      <body
        className="font-[Baloo] bg-slate-50 scroll-smooth min-h-screen flex flex-col"
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
