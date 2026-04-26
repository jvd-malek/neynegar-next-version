// components
import GroupDiscountsBanner from "@/public/components/home/GroupDiscountsBanner";
import DescProductBoxes from "@/public/components/home/DescProductBoxes";
import HomeHeader from "@/public/components/home/HomeHeader";
import HeaderSection from "@/public/components/home/HeaderSection";
import Box from "@/public/components/product-boxes/Box";

// utils
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";

// types and graphql
import { GET_HERO_DATA } from "@/public/graphql/productQueries";
import { HomePageHero } from "@/public/types/product";


const HeroSection = async () => {
    const heroData: HomePageHero = await fetcher(GET_HERO_DATA, {}, revalidateOneHour)
        .then(data => data.homePageHero)
        .catch(err => console.error(err))

    return (
        <>
            <section
                className="container mx-auto px-3 mt-6 mb-12"
                aria-label="بخش حراجستون نی‌نگار"
            >
                <GroupDiscountsBanner groupDiscounts={heroData?.groupDiscounts} />

                <HomeHeader
                    title="فروش ویژه "
                    postfix="نی‌نگار"
                    link='/category/حراجستون'
                    ariaLabel="محصولات حراج ویژه"
                />

                <Box products={heroData?.discountProducts} discount />

            </section>

            <HeaderSection />

            <section
                className="flex justify-center container mx-auto items-center flex-wrap sm:gap-8 gap-10 mt-20 mb-12 text-center"
                aria-label="بخش دسته‌بندی محصولات نی‌نگار"
            >
                <DescProductBoxes />
            </section>

            <section
                className="mb-16 container mx-auto px-4" id="section-products"
                aria-label="بخش تازه‌ترین کتاب‌های خوشنویسی"
            >
                <HomeHeader
                    title="آخرین کتاب‌های خوشنویسی "
                    link="/category/کتاب/خوشنویسی"
                    ariaLabel="کتاب‌های جدید خوشنویسی"
                />
                <Box products={heroData?.caliBooks} />
            </section>
        </>
    )
}

export default HeroSection