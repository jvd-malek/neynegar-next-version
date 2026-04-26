// next and components
import Link from "next/link";
import Image from "next/image";
import GlassBox from "@/public/components/home/GlassBox";

// icons
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

// Images
import HomeImg from '@/public/images/Home.webp'

const IntroductionSection = () => (
    <section
        aria-label="بخش معرفی سایت نی‌نگار"
    >
        <div className="flex justify-between items-center flex-col md:flex-row px-4 gap-8">
            <div className="flex-1 pt-8">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight text-black mb-6 text-shadow">
                    هنر خوشنویسی را
                    <br />
                    دریابید،
                    <br />
                    بیاموزید،
                    <br />
                    زنده نگه دارید!
                </h1>

                <p className="text-lg md:text-xl text-justify text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed text-shadow">
                    به دنیای خوشنویسی ایرانی خوش آمدید، جایی که اصالت و زیبایی خطوط فارسی را کشف خواهید کرد.
                </p>

                <div className="flex justify-center gap-4 mb-12 w-[90%] mx-auto items-center">
                    <Link
                        href="/#section-products"
                        className="transition-all text-center cursor-pointer duration-75 bg-black hover:bg-slate-900 active:bg-slate-900 py-2.5 w-full rounded-lg text-white border-2"
                        aria-label="مشاهده محصولات خوشنویسی"
                    >
                        مشاهده محصولات
                    </Link>
                    <Link
                        href="/#section-courses"
                        className="transition-all text-center cursor-pointer duration-75 active:bg-black hover:bg-black py-2.5 w-full rounded-lg hover:text-white active:text-white border-2 border-solid active:border-2"
                        aria-label="آموزش‌های خوشنویسی"
                    >
                        آموزش‌ها
                    </Link>
                </div>
            </div>

            <div className="relative flex-1 flex justify-center items-center mx-2">
                <Image
                    src={HomeImg}
                    alt="تصویر صفحه درباره ما نی نگار"
                    className="object-contain lg:w-[75%] mix-blend-darken"
                    width={600}
                    height={600}
                    loading="lazy"
                    quality={75}
                    sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 600px"
                />

                <div className="rounded-2xl p-2 absolute bottom-4 max-w-sm right-0 bg-black/40 backdrop-blur-sm text-white">
                    <p className="text-center text-xs mb-2 flex gap-2 justify-center items-center">
                        <span className="text-base" aria-hidden="true">
                            <SchoolRoundedIcon fontSize="inherit" />
                        </span>
                        آموزش‌های گام‌به‌گام از مبتدی
                    </p>
                    <Link
                        href="/#section-courses"
                        className="bg-white text-[#2c1e08] px-2 flex justify-center items-center py-1.5 rounded-lg text-xs font-medium hover:bg-white/80 transition cursor-pointer"
                        aria-label="شروع یادگیری خوشنویسی"
                    >
                        شروع یادگیری
                    </Link>
                </div>

                <div className="rounded-2xl p-2 max-w-sm bg-black/40 backdrop-blur-sm absolute -top-4 -right-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-white/20 p-2 w-8 h-8 rounded-full text-base flex justify-center items-center">
                            <EditRoundedIcon className="text-white" fontSize="inherit" aria-hidden="true" />
                        </div>
                        <h3 className="text-sm font-bold text-white">ابزار حرفه‌ای</h3>
                    </div>
                    <ul className="text-white/90 text-xs space-y-2 mb-2">
                        <li>• قلم‌های مخصوص</li>
                        <li>• مرکب‌های طبیعی</li>
                        <li>• کاغذهای دست‌ساز</li>
                    </ul>
                    <Link
                        href="/category/لوازم خوشنویسی"
                        className="border-2 border-white text-white px-2 flex justify-center items-center py-1.5 rounded-lg hover:bg-white/10 transition text-xs cursor-pointer"
                        aria-label="مشاهده لوازم خوشنویسی"
                    >
                        مشاهده محصولات
                    </Link>
                </div>

                <div className="rounded-2xl p-2 bg-black/40 backdrop-blur-sm max-w-36 absolute top-4 -left-8">
                    <h3 className="text-sm font-bold text-white text-center mb-2">مزایای ما</h3>
                    <div className="flex flex-col items-center gap-2 text-xs text-white border-white/15">
                        <GlassBox name="تخصص در خوشنویسی" full />
                        <GlassBox name="تنوع بی‌نظیر" full />
                        <GlassBox name="پشتیبانی تخصصی" full />
                    </div>
                    <p className="text-white text-center mt-2 text-xs">
                        ارائه بهترین خدمات با بالاترین استانداردها
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default IntroductionSection