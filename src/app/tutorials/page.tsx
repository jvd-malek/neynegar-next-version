import Image from "next/image";
import dribbble from "@/../../public/Img/dribbble_1.gif";
import Link from "next/link";
import DescProductBoxes from "@/lib/Components/ProductBoxes/DescProductBoxes";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "آموزش‌ها | فروشگاه نی نگار",
    description: "بخش آموزش‌های نی نگار به زودی راه‌اندازی خواهد شد. در این بخش، آموزش‌های کاربردی و مفید برای شما آماده می‌شود.",
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://neynegar1.ir/tutorials",
    },
    openGraph: {
        title: "آموزش‌ها - نی نگار",
        description: "بخش آموزش‌های نی نگار به زودی راه‌اندازی خواهد شد",
        url: "https://neynegar1.ir/tutorials",
        type: "website",
    },
    twitter: {
        card: 'summary_large_image',
        title: 'آموزش‌ها - نی نگار',
        description: 'بخش آموزش‌های نی نگار به زودی راه‌اندازی خواهد شد',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
    },
};

function Tutorials() {
    return (
        <>
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="relative w-full max-w-lg mx-auto h-64 mt-32 bg-white rounded-2xl">
                        <Image
                            src={dribbble}
                            alt="انیمیشن صفحه یافت نشد"
                            fill
                            className="object-contain rounded-2xl"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 my-4">به زودی</h1>
                    <p className="text-xl text-gray-600 mb-2">این بخش در حال آماده‌سازی است</p>
                    <p className="mb-6">🙌</p>
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
            <section
                className="mt-40 sm:mt-50 md:mt-40 px-4"
                aria-label="پیشنهاد محصولات"
            >
                <div className="container mx-auto">
                    <h2 className="md:text-2xl text-lg font-bold text-center text-gray-800 mb-28">
                        ❤️ شاید این محصولات را دوست داشته باشید ❤️
                    </h2>
                    <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
                        <DescProductBoxes />
                    </Suspense>
                </div>
            </section>
        </>
    );
}

export default Tutorials;