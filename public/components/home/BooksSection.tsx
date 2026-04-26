// next and components
import HomeHeader from "@/public/components/home/HomeHeader";
import Box from "@/public/components/product-boxes/Box";
import Image from "next/image";

// utils and images
import poem from '@/public/images/poem.webp'
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";

// types and queries
import { GET_HOME_PAGE_PRODUCTS } from "@/public/graphql/productQueries";
import { HomePageBooks } from "@/public/types/product";


const BooksSection = async () => {
  const booksData: HomePageBooks = await fetcher(GET_HOME_PAGE_PRODUCTS, {}, revalidateOneHour)
    .then(data => data.homePageBooks)
    .catch(err => console.error(err))

  return (
    <>

      {booksData?.tools && (
        <section
          className="my-16 container mx-auto px-4"
          aria-label="بخش لوازم خوشنویسی نی‌نگار"
        >
          <HomeHeader
            title="لوازم خوشنویسی"
            link="/category/لوازم خوشنویسی"
            ariaLabel="لوازم خوشنویسی"
          />
          <Box products={booksData?.tools} />
        </section>
      )}

      {booksData?.paintBooks && (
        <section
          className="my-16 container mx-auto px-4"
          aria-label="بخش کتاب‌های طراحی و نقاشی نی‌نگار"
        >
          <HomeHeader
            title="طراحی و نقاشی"
            link="/category/کتاب/طراحی و نقاشی"
            ariaLabel="کتاب‌های طراحی و نقاشی"
          />
          <Box products={booksData?.paintBooks} />
        </section>
      )}

      {booksData?.traditionalBooks && (
        <section
          className="my-16 container mx-auto px-4"
          aria-label="بخش محصولات هنرهای سنتی ایرانی نی‌نگار"
        >
          <HomeHeader
            title="هنر‌های سنتی (تذهیب و ...)"
            link="/category/کتاب/هنرهای سنتی"
            ariaLabel="هنرهای سنتی ایرانی"
          />
          <Box products={booksData?.traditionalBooks} />
        </section>
      )}

      {booksData?.gallery && (
        <section
          className="container mx-auto px-4"
          aria-label="بخش گالری آثار خوشنویسی نی‌نگار"
        >
          <HomeHeader
            title="گالری آثار"
            link="/category/گالری"
            ariaLabel="گالری آثار خوشنویسی"
          />
          <Box products={booksData?.gallery} />
        </section>
      )}

      <div className="my-8 flex justify-center items-center mx-auto w-40">
        <Image
          src={poem}
          alt="تصویر شعر خوشنویسی"
          loading="lazy"
          quality={75}
          sizes="(max-width: 768px) 120px, 160px"
        />
      </div>
    </>
  );
};

export default BooksSection;
