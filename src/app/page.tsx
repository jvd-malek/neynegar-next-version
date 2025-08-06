import Image from "next/image";
import { Typewriter } from 'nextjs-simple-typewriter'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Link from "next/link";
import dynamic from 'next/dynamic';

// Components
import Box from "@/lib/Components/ProductBoxes/Box";
import HomeHeader from "@/lib/Components/ProductBoxes/HomeHeader";
import DescProductBoxes from "@/lib/Components/ProductBoxes/DescProductBoxes";
import ArticleBox from "@/lib/Components/ArticleBoxes/ArticleBox";

// Images
import LogoReverse from '@/../public/Img/LogoReverse.webp'
import HomeImg from '@/../public/Img/Home.webp'
import poem1 from '@/../public/Img/poem1.webp'
import poem2 from '@/../public/Img/poem2.webp'
import poem4 from '@/../public/Img/poem4.webp'
import poem5 from '@/../public/Img/poem5.webp'
import poem7 from '@/../public/Img/poem7.webp'
import dribbble from "@/../../public/Img/dribbble_1.gif";
import Tutorials from "@/lib/Components/Tutorials/Tutorials";
import GroupDiscountsBanner from "@/lib/Components/ProductBoxes/GroupDiscountsBanner";

const HOME_PAGE_QUERY = `
  query {
    homePageData {
      caliBooks {
        _id 
        title 
        desc 
        price { price } 
        discount { discount date } 
        popularity 
        cover 
        brand 
        showCount 
        majorCat 
        minorCat
      }
      paintBooks {_id title desc price{price} discount { discount date } popularity cover brand showCount majorCat minorCat}
      gallery {_id title desc price{price} discount { discount date } popularity cover brand showCount majorCat minorCat}
      traditionalBooks {_id title desc price{price} discount { discount date } popularity cover brand showCount majorCat minorCat}
      articles {_id title desc cover popularity views majorCat minorCat authorId{_id fullName firstname lastname}}
      discountProducts {_id title desc price{price} discount { discount date } popularity cover brand showCount majorCat minorCat }
      groupDiscounts {
        _id
        title
        majorCat
        minorCat
        brand
        discount
        startDate
        endDate
        isActive
      }
      courses {
        _id
        title
        desc
        category
        articleId { _id title desc }
        relatedProducts {
          _id
          title
          desc
          price {
            price
            date
          }
          discount {
            discount
            date
          }
          popularity
          cover
          brand
          showCount
          majorCat
          minorCat
        }
      }
    }
  }
`;

const GlassBox = ({ name, full = false }: { name: string, full?: boolean }) => (
  <div
    className={`p-1 rounded-lg text-center border border-inherit ${full ? "w-full bg-white/5" : "bg-white"
      }`}
    role="listitem"
  >
    <span className="font-medium animate-pulse">{name}</span>
  </div>
);

const HeaderSection = () => (
  <section
    className="relative bg-[url(../../public/Img/blue-low.webp)] bg-repeat bg-contain pt-10 lg:h-[80vh] sm:h-[100vh] w-full h-[80vh] text-white flex justify-center items-center"
    aria-label="بخش جستجوی محصولات خوشنویسی"
    role="search"
  >
    <div className="absolute inset-x-0 -bottom-1 h-[70%] bg-gradient-to-t from-slate-50 to-transparent" />

    <div className="flex justify-center relative items-center flex-col bg-glassh lg:w-[50%] w-[85%] p-8 rounded-xl">


      <div className="w-10 absolute -right-2 -top-2">
        <Image
          src={LogoReverse}
          alt="لوگو نی نگار"
          width={40}
          height={40}
          loading="lazy"
        />
      </div>

      <h1 className="md:text-xl text-lg mb-6 text-center text-black">
        <Typewriter
          words={[
            "به دنیای خوشنویسی خوش آمدید!",
            "فروشگاه آنلاین لوازم خوشنویسی",
            "قلم‌های مرغوب، کاغذهای باکیفیت",
            "آموزش و الهام‌بخشی برای خوشنویسی",
            "نی‌نگار: هنر خطاطی در دستان شما"
          ]}
          loop={2}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={1000}
        />
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-black border-black/30 mt-2">
        <GlassBox name="تخصص در خوشنویسی ✍️" />
        <GlassBox name="تخفیف‌های ویژه 💸" />
        <GlassBox name="آموزش تخصصی خوشنویسی 🎓" />
        <GlassBox name="محتوای آموزشی رایگان 📚" />
        <GlassBox name="تنوع گسترده محصولات 🎨" />
        <GlassBox name="پشتیبانی تخصصی 💬" />
        <GlassBox name="ارسال سریع و مطمئن 🚀" />
      </div>

    </div>

    <div className="w-40 absolute -bottom-20 left-1/2 -translate-x-1/2">
      <Image
        src={poem1}
        alt="تصویر شعر مولانا با خط خوشنویسی"
        width={160}
        height={160}
        loading="lazy"
        quality={75}
      />
    </div>
  </section>
);

const IntroductionSection = () => (
  <section className="container mx-auto">
    <div className="flex justify-between items-center flex-col md:flex-row px-8 gap-8">
      <div className="flex-1 pt-8">
        <h2 className="text-3xl md:text-4xl leading-tight text-black mb-6 text-shadow">
          هنر خوشنویسی را
          <br />
          دریابید،
          <br />
          بیاموزید،
          <br />
          زنده نگه دارید!
        </h2>

        <p className="text-lg md:text-xl text-justify text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed text-shadow">
          به دنیای خوشنویسی ایرانی خوش آمدید، جایی که اصالت و زیبایی خطوط فارسی را کشف خواهید کرد.
        </p>

        <div className="flex justify-center gap-4 mb-12 w-[90%] mx-auto items-center">
          <Link
            href="#section-products"
            className="transition-all text-center cursor-pointer duration-75 bg-black hover:bg-slate-900 active:bg-slate-900 py-2.5 w-full rounded-lg text-white border-2"
            aria-label="مشاهده محصولات خوشنویسی"
          >
            مشاهده محصولات
          </Link>
          <Link
            href="#section-courses"
            className="transition-all text-center cursor-pointer duration-75 active:bg-black hover:bg-black py-2.5 w-full rounded-lg hover:text-white active:text-white border-2 border-solid active:border-2"
            aria-label="آموزش‌های خوشنویسی"
          >
            آموزش‌ها
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center">
          <KeyboardArrowDownRoundedIcon
            fontSize="large"
            className="text-black w-16 h-16 animate-bounce duration-1000 infinite"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative flex-1 flex justify-center items-center mx-2">
        <Image
          src={HomeImg}
          alt="تصویر صفحه اصلی نی نگار"
          className="object-contain lg:w-[95%] mask-radial-[100%_100%] mask-radial-from-75% mask-radial-at-left"
          width={600}
          height={600}
          priority
          quality={85}
        />

        <div className="rounded-2xl p-2 absolute bottom-4 max-w-sm -right-0 bg-dark-glassh text-white">
          <p className="text-center text-xs mb-2 flex gap-2 justify-center items-center">
            <span className="text-base" aria-hidden="true">
              <SchoolRoundedIcon fontSize="inherit" />
            </span>
            آموزش‌های گام‌به‌گام از مبتدی
          </p>
          <Link
            href="#section-courses"
            className="bg-white text-[#2c1e08] px-2 flex justify-center items-center py-1.5 rounded-lg text-xs font-medium hover:bg-white/80 transition cursor-pointer"
            aria-label="شروع یادگیری خوشنویسی"
          >
            شروع یادگیری
          </Link>
        </div>

        <div className="rounded-2xl p-2 max-w-sm bg-dark-glassh absolute -top-4 -right-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 p-2 w-8 h-8 rounded-full text-base flex justify-center items-center">
              <EditRoundedIcon className="text-white" fontSize="inherit" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-white">ابزار حرفه‌ای</h3>
          </div>
          <ul className="text-white/80 text-xs space-y-2 mb-2">
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

        <div className="rounded-2xl p-2 bg-dark-glassh backdrop:blur-2xl max-w-36 absolute top-4 -left-8">
          <h3 className="text-sm font-semibold text-white text-center mb-2">مزایای ما</h3>
          <div className="flex flex-col items-center gap-2 text-xs text-white border-white/15">
            <GlassBox name="تخصص در خوشنویسی" full />
            <GlassBox name="تنوع بی‌نظیر" full />
            <GlassBox name="پشتیبانی تخصصی" full />
          </div>
          <p className="text-white/70 text-center mt-2 text-xs">
            ارائه بهترین خدمات با بالاترین استانداردها
          </p>
        </div>
      </div>
    </div>

    <div className="flex justify-center items-center flex-wrap sm:gap-8 gap-10 mt-28 text-center">
      <DescProductBoxes />
    </div>
  </section>
);

async function Home() {

  const res = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL}`, {
    next: { revalidate: 3600 },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: HOME_PAGE_QUERY }),
  });

  const dataJson = await res.json();

  // بررسی خطاهای GraphQL
  if (dataJson.errors) {
    console.error('GraphQL Errors:', dataJson.errors);
    // throw new Error('GraphQL query failed');
  }

  // بررسی وجود داده
  if (!dataJson.data?.homePageData) {
    // throw new Error('No data received from GraphQL');
    return (
      <div className="container mx-auto h-[50vh] lg:mt-32 sm:mt-26 mt-20 flex justify-center items-center flex-col">
        <div className="relative z-10 text-center px-4 w-full max-w-4xl">

          <h1
            className="text-2xl font-bold absolute top-50 left-1/2 -translate-x-1/2 z-10 text-neutral-900/75 animate-pulse"
            role="status"
          >
            اینترنت خود را بررسی کنید
          </h1>

          {/* تصویر انیمیشن */}
          <div className="relative w-full max-w-lg mx-auto h-64 bg-slate-50 rounded-2xl">
            <Image
              src={dribbble}
              alt="انیمیشن صفحه یافت نشد"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </div>
        </div>
      </div>)
  }

  const data = dataJson.data.homePageData;
  
  return (
    <>
      <HeaderSection />

      <div className="container mx-auto px-8 mt-32">
        <HomeHeader
          title="فروش ویژه نی‌نگار"
          link='/category/حراجستون'
          ariaLabel="محصولات حراج ویژه"
        />

        <Box books={data?.discountProducts} discount />

        {/* بنر تخفیف‌های گروهی */}
        {data?.groupDiscounts && <GroupDiscountsBanner groupDiscounts={data.groupDiscounts} />}

        <div className="my-8 flex justify-center items-center mx-auto w-40">
          <Image
            src={poem7}
            alt="تصویر شعر خوشنویسی"
            width={160}
            height={160}
            loading="lazy"
          />
        </div>
      </div>

      <IntroductionSection />

      <div className="container mx-auto px-8" id="section-courses">
        <div className="my-8 flex justify-center items-center mx-auto w-40">
          <Image
            src={poem2}
            alt="تصویر شعر خوشنویسی"
            width={200}
            height={200}
            loading="lazy"
          />
        </div>

        {/* نمایش داینامیک دوره‌ها */}
        {data?.courses?.map((course: any) => (
          <div key={course._id} className="mb-12">
            <HomeHeader
              title={course.title}
              ariaLabel={course.title}
              all={false}
            />
            <Tutorials
              title={course.title}
              articleDesc={course.articleId?.desc || ""}
              articleLink={course.articleId?._id || ""}
              courseDesc={course.desc}
              courseLink={course._id}
              products={course.relatedProducts}
              productsLink={course.category}
            />
          </div>
        ))}

        {/* بنر دوره‌های بعدی */}
        <div className="w-full flex justify-center items-center mb-8">
          <div className="bg-gradient-to-r from-blue-200 to-blue-400 text-blue-900 rounded-xl px-8 py-4 text-xl font-bold shadow-lg animate-pulse">
            دوره‌های بعدی تو راهه ...
          </div>
        </div>
      </div>

      {/* بخش محصولات و مقالات */}
      <section className="container mx-auto px-8" id="section-products">

        <div className="flex justify-center items-center mx-auto w-40">
          <Image
            src={poem4}
            alt="تصویر شعر خوشنویسی"
            width={160}
            height={160}
            loading="lazy"
          />
        </div>

        <div className="mb-16 mt-10">
          <HomeHeader
            title="تازه‌ترین کتاب‌های خوشنویسی"
            link="/category/کتاب/خوشنویسی"
            ariaLabel="کتاب‌های جدید خوشنویسی"
          />
          <Box books={data?.caliBooks} />
        </div>

        <div className="my-16">
          <HomeHeader
            title="گالری آثار خوشنویسی"
            link="/category/گالری"
            ariaLabel="گالری آثار خوشنویسی"
          />
          <Box books={data?.gallery} />
        </div>

        <div className="my-16">
          <HomeHeader
            title="طراحی و نقاشی"
            link="/category/کتاب/طراحی و نقاشی"
            ariaLabel="کتاب‌های طراحی و نقاشی"
          />
          <Box books={data?.paintBooks} />
        </div>

        <HomeHeader
          title="هنر‌های سنتی (تذهیب و ...)"
          link="/category/کتاب/هنرهای سنتی"
          ariaLabel="هنرهای سنتی ایرانی"
        />
        <Box books={data?.traditionalBooks} />

        <div className="my-8 flex justify-center items-center mx-auto w-40">
          <Image
            src={poem5}
            alt="تصویر شعر خوشنویسی"
            width={160}
            height={160}
            loading="lazy"
          />
        </div>

        <HomeHeader
          title="آخرین مقالات خوشنویسی"
          link="/category/مقالات"
          ariaLabel="مقالات تخصصی خوشنویسی"
        />
        <article className="mt-16 mx-auto w-[82vw] flex flex-wrap gap-10 justify-center">
          {data?.articles.map((a: any) => (
            <ArticleBox key={a._id} {...a} />
          ))}
        </article>

      </section>
    </>
  )
}

export default Home;