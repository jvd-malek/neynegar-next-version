import "./globals.css";
import Footer from "../lib/Components/Footer/Footer";
import Header from "../lib/Components/Header/Header";
import { Metadata, Viewport } from 'next';
import { Bounce, ToastContainer } from 'react-toastify';
import { Suspense } from "react";


export const metadata: Metadata = {
  title: "فروشگاه نی‌نگار | لوازم خوشنویسی و هنرهای سنتی",
  description: "فروشگاه نی‌نگار، ارائه‌دهنده لوازم خوشنویسی، قلم‌های مرغوب، کاغذهای باکیفیت و کتاب‌های آموزشی خوشنویسی. خرید آنلاین با بهترین قیمت و تحویل سریع.",
  keywords: ["خوشنویسی", "لوازم خوشنویسی", "قلم خوشنویسی", "کاغذ خوشنویسی", "کتاب خوشنویسی", "هنرهای سنتی", "فروشگاه اینترنتی"],
  robots: "index, follow",
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "فروشگاه نی‌نگار | لوازم خوشنویسی و هنرهای سنتی",
    description: "فروشگاه نی‌نگار، ارائه‌دهنده لوازم خوشنویسی، قلم‌های مرغوب، کاغذهای باکیفیت و کتاب‌های آموزشی خوشنویسی. خرید آنلاین با بهترین قیمت و تحویل سریع.",
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
    title: "فروشگاه نی‌نگار | لوازم خوشنویسی و هنرهای سنتی",
    description: "فروشگاه نی‌نگار، ارائه‌دهنده لوازم خوشنویسی، قلم‌های مرغوب، کاغذهای باکیفیت و کتاب‌های آموزشی خوشنویسی. خرید آنلاین با بهترین قیمت و تحویل سریع.",
    images: ["https://neynegar1.ir/logo.png"],
  },
  alternates: {
    canonical: "https://neynegar1.ir/",
  },
  verification: {
    google: "JXdipV6eRMT7wZ-j8PGZXqInpd9z75XPR7sn-5i9zUU"
  }
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
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning className="scroll-smooth select-none">
      <body
        className="font-[Baloo] bg-slate-50 min-h-screen flex flex-col"
      >
          <ToastContainer
            position="top-center"
            autoClose={5000}
            limit={2}
            hideProgressBar={false}
            newestOnTop
            closeOnClick={false}
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Bounce}
            style={{
              top: '85px',
              left: '20px',
              right: '20px',
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: 'calc(5vh)'
            }}
            toastStyle={{
              marginBottom: '5px',
              borderRadius: '8px'
            }}
          />
        <Suspense>
          <Header />
        </Suspense>
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
