// next and components
import Link from "next/link";
import GlassBox from "./GlassBox";

const HeaderSection = () => {

  return (
    <section
      className={`relative w-full flex justify-center items-center font-bold my-12 background py-12`}
      aria-label="بخش معرفی نی‌نگار و ویژگی‌های آن"
    >

      <div className="absolute inset-x-0 -bottom-1 h-[50%] bg-linear-to-t from-mist-100 to-transparent" />
      <div className="absolute inset-x-0 -top-1 h-[50%] bg-linear-to-b from-mist-100 to-transparent" />

      <div className="flex justify-between relative items-center flex-col bg-black/20 backdrop-blur-xs lg:w-[50%] w-[85%] p-4 rounded-xl sm:gap-6 gap-3">

        <Link
          href="#section-about"
          className="cursor-pointer md:text-xl sm:text-lg text-base text-center"
          aria-label="درباره ما"
        >
          <h1>
            نی‌نگار: هنر خطاطی در دستان شما
          </h1>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs border-black/30 mt-2">
          <GlassBox name="تخصص در خوشنویسی ✍️" />
          <GlassBox name="تخفیف‌های ویژه 💸" />
          <GlassBox name="آموزش تخصصی خوشنویسی 🎓" />
          <GlassBox name="محتوای آموزشی رایگان 📚" />
          <GlassBox name="تنوع گسترده محصولات 🎨" />
          <GlassBox name="پشتیبانی تخصصی 💬" />
          <GlassBox name="ارسال سریع و مطمئن 🚀" />
        </div>

        <div className="flex justify-center gap-4 w-[90%] mx-auto items-center">
          <Link
            href="#section-products"
            className="transition-all text-center cursor-pointer duration-75 bg-black hover:bg-slate-900 active:bg-slate-900 py-2 w-full rounded-lg text-white"
            aria-label="مشاهده محصولات خوشنویسی"
          >
            محصولات
          </Link>
          <Link
            href="#section-courses"
            className="transition-all text-center cursor-pointer duration-75 bg-black hover:bg-slate-900 active:bg-slate-900 py-2 w-full rounded-lg text-white"
            aria-label="آموزش‌های خوشنویسی"
          >
            آموزش‌ها
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeaderSection;