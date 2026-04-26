// next
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

// images
import dribbble from "@/public/images/404.gif";
import Header from "@/public/components/header/Header";
import Footer from "@/public/components/footer/Footer";

// components
import DescProductBoxes from "@/public/components/home/DescProductBoxes";

export const metadata: Metadata = {
  title: "صفحه مورد نظر یافت نشد (۴۰۴) | فروشگاه نی نگار",
  description: "صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است. می‌توانید از صفحه اصلی شروع کنید.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://neynegar1.ir/404",
  },
  openGraph: {
    title: "صفحه یافت نشد - نی نگار",
    description: "صفحه مورد نظر شما وجود ندارد. به صفحه اصلی بازگردید.",
    url: "https://neynegar1.ir",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'صفحه یافت نشد - نی نگار',
    description: 'صفحه مورد نظر شما وجود ندارد. به صفحه اصلی بازگردید.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function Page404() {
  return (
    <>
      <Header />
      <main
        className="w-full flex flex-col justify-center items-center"
        role="main"
        aria-label="صفحه خطای 404"
      >
        <div className="text-center px-4 w-full max-w-4xl">

          <div className="relative w-full max-w-lg mx-auto h-64 mt-6 bg-slate-50 rounded-2xl">
            <h1
              className="text-9xl font-bold absolute top-1 left-1/2 -translate-x-1/2 z-10 text-neutral-900/75 animate-pulse"
              aria-label='کد خطا: 404'
              role="status"
            >
              404
            </h1>
            <Image
              src={dribbble}
              alt="انیمیشن صفحه یافت نشد"
              fill
              sizes="(max-width: 768px) 100px, 150px"
              className="object-contain rounded-2xl"
              loading="lazy"
            />
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              به نظر می‌رسد گم شده‌اید!
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              صفحه‌ای که به دنبال آن هستید وجود ندارد یا ممکن است حذف شده باشد.
            </p>

            <Link
              href="/"
              className="
                inline-block
                bg-black hover:bg-gray-800 
                text-white font-medium
                py-3 px-8
                rounded-full
                transition-colors duration-300
                shadow-lg hover:shadow-xl
                text-lg
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
              "
              aria-label="بازگشت به صفحه اصلی"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </main>

      {/* بخش پیشنهاد محصولات */}
      <section
        className="mt-20 sm:mt-30 md:mt-20 px-4"
        aria-label="پیشنهاد محصولات"
      >
        <div className="container mx-auto">
          <h2 className="md:text-2xl text-lg font-bold text-center text-gray-800 mb-28">
            ❤️ شاید این محصولات را دوست داشته باشید ❤️
          </h2>
          <Suspense fallback={<div>در حال بارگذاری محصولات...</div>}>
            <DescProductBoxes />
          </Suspense>
        </div>
      </section>
      <Footer />
    </>
  );
}