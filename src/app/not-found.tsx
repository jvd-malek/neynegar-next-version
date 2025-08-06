import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import dribbble from "@/../../public/Img/dribbble_1.gif";
import DescProductBoxes from "@/lib/Components/ProductBoxes/DescProductBoxes";
import { Suspense } from "react";

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
  const errorCode = 404;

  return (
    <>
      {/* بخش اصلی خطای 404 */}
      <main
        className="relative bg-[url(../../public/Img/blue-low.webp)] bg-repeat-x bg-contain w-full h-[80vh] text-white flex flex-col justify-center items-center"
        role="main"
        aria-label="صفحه خطای 404"
      >
        <div className="absolute inset-x-0 -bottom-1 h-[70%] bg-gradient-to-t from-slate-50 to-transparent" />
        <div className="relative z-10 text-center px-4 w-full max-w-4xl">
          {/* نمایش کد خطا */}
          <h1
            className="text-9xl font-bold absolute top-50 left-1/2 -translate-x-1/2 z-10 text-neutral-900/75 animate-pulse"
            aria-label={`کد خطا: ${errorCode.toLocaleString("fa-IR")}`}
            role="status"
          >
            {errorCode.toLocaleString("fa-IR")}
          </h1>

          {/* تصویر انیمیشن */}
          <div className="relative w-full max-w-lg mx-auto h-64 mt-48 bg-slate-50 rounded-2xl">
            <Image
              src={dribbble}
              alt="انیمیشن صفحه یافت نشد"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </div>

          {/* پیام خطا */}
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              به نظر می‌رسد گم شده‌اید!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              صفحه‌ای که به دنبال آن هستید وجود ندارد یا ممکن است حذف شده باشد.
            </p>

            {/* دکمه بازگشت */}
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
        className="mt-40 sm:mt-50 md:mt-40 px-4"
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
    </>
  );
}