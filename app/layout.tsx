// next
import type { Metadata, Viewport } from "next";

// CSS and swiper css
import "./globals.css";

// fonts
import { Mahoor } from "./fonts";

// components
import { Bounce, ToastContainer } from 'react-toastify';
// import MaintenanceMode from "@/public/components/home/MaintenanceMode";

export const metadata: Metadata = {
  title: "نی نگار | لوازم و آموزش خوشنویسی",
  description: "به دنیای هنر و قلم خوش آمدید! نی نگار، گنجینه‌ای از بهترین‌ها برای علاقه‌مندان به کتاب‌های نفیس و تخصصی در حوزه هنر، خوشنویسی و صنایع دستی، و همچنین مرکز عرضه لوازم باکیفیت هنری است. ما اینجا هستیم تا با ارائه محصولاتی منحصر به فرد و آموزشی، شما را در مسیر خلاقیت و شکوفایی هنری همراهی کنیم.",
  keywords: ["خوشنویسی", "لوازم خوشنویسی", "قلم خوشنویسی", "کاغذ خوشنویسی", "کتاب خوشنویسی", "هنرهای سنتی", "فروشگاه اینترنتی"],
  robots: "index, follow",
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: "نی نگار | لوازم و آموزش خوشنویسی",
    description: "به دنیای هنر و قلم خوش آمدید! نی نگار، گنجینه‌ای از بهترین‌ها برای علاقه‌مندان به کتاب‌های نفیس و تخصصی در حوزه هنر، خوشنویسی و صنایع دستی، و همچنین مرکز عرضه لوازم باکیفیت هنری است. ما اینجا هستیم تا با ارائه محصولاتی منحصر به فرد و آموزشی، شما را در مسیر خلاقیت و شکوفایی هنری همراهی کنیم.",
    url: "https://neynegar1.ir/",
    siteName: "نی نگار",
    images: [
      {
        url: "https://neynegar1.ir/logo.png",
        width: 800,
        height: 600,
        alt: "لوگو نی نگار",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "نی نگار | لوازم و آموزش خوشنویسی",
    description: "به دنیای هنر و قلم خوش آمدید! نی نگار، گنجینه‌ای از بهترین‌ها برای علاقه‌مندان به کتاب‌های نفیس و تخصصی در حوزه هنر، خوشنویسی و صنایع دستی، و همچنین مرکز عرضه لوازم باکیفیت هنری است. ما اینجا هستیم تا با ارائه محصولاتی منحصر به فرد و آموزشی، شما را در مسیر خلاقیت و شکوفایی هنری همراهی کنیم.",
    images: ["https://neynegar1.ir/logo.png"],
  },
  alternates: {
    canonical: "https://neynegar1.ir/",
  },
  verification: {
    google: "JXdipV6eRMT7wZ-j8PGZXqInpd9z75XPR7sn-5i9zUU"
  },
  manifest: "/manifest.ts",
  other: {
    enamad: "9617960"
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
    <html lang="fa-IR" dir="rtl" suppressHydrationWarning data-scroll-behavior="smooth" className={`scroll-smooth select-none`}>
      <body
        className={`${Mahoor.className} antialiased bg-mist-100`}
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
        {children}
        {/* <MaintenanceMode /> */}
      </body>
    </html>
  );
}
