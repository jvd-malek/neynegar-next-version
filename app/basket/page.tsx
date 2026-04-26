// next
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Metadata } from "next";

// components
import ProfileForm from '@/public/components/account/ProfileForm';
import ProductsCart from '@/public/components/basket/ProductsCart';
import Receipt from '@/public/components/basket/Receipt';
import Header from '@/public/components/header/Header';
import Footer from '@/public/components/footer/Footer';
import Breadcrumb from '@/public/components/breadcrumb/Breadcrumb';
import SuggestedProducts from '@/public/components/product/SuggestedProducts';

// utils
import { fetcher, noCaching, revalidateOneHour } from '@/public/utils/fetcher';

// queries and types
import { GET_LOCAL_BASKET, GET_USER_FULL_BASKET } from '@/public/graphql/basketQueries';
import { UserBasket } from '@/public/types/user';


export const metadata: Metadata = {
    title: "سبد خرید | فروشگاه اینترنتی نی‌نگار",
    description: "بررسی و مدیریت محصولات انتخاب‌شده برای خرید از فروشگاه اینترنتی نی‌نگار. تکمیل فرآیند خرید و پرداخت آنلاین با بهترین قیمت.",
    keywords: ["سبد خرید", "خرید آنلاین", "لوازم خوشنویسی", "هنرهای سنتی", "مدیریت خرید", "فروشگاه اینترنتی"],
    robots: "noindex, nofollow",
    openGraph: {
        title: "سبد خرید | فروشگاه اینترنتی نی‌نگار",
        description: "بررسی و مدیریت محصولات انتخاب‌شده برای خرید از فروشگاه اینترنتی نی‌نگار. تکمیل فرآیند خرید و پرداخت آنلاین با بهترین قیمت.",
        url: "https://neynegar1.ir/basket",
        siteName: "نی‌نگار",
        locale: "fa_IR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "سبد خرید | فروشگاه اینترنتی نی‌نگار",
        description: "بررسی و مدیریت محصولات انتخاب‌شده برای خرید از فروشگاه اینترنتی نی‌نگار. تکمیل فرآیند خرید و پرداخت آنلاین با بهترین قیمت.",
    },
    alternates: {
        canonical: "https://neynegar1.ir/basket",
    },
};


async function Basket({ searchParams }: any) {
    const params = await searchParams;
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');
    const bas = cookieStore.get('basket')

    const page = {
        page: parseInt(params.page || '1'),
        sort: params.sort || 'latest',
        cat: params.cat || 'همه',
        count: parseInt(params.count || '5'),
        search: params.search || '',
        activeLink: params.activeLink || "products",
    };


    let localBasket: { count: number, productId: string | null, packageId: string | null }[] | [] = bas ? JSON.parse(bas?.value as string).map((item: any) => ({
        productId: item.productId,
        packageId: item.packageId,
        count: item.count
    })) : []
    
    const data = jwt?.value ?
        await fetcher(GET_USER_FULL_BASKET, {}, noCaching, jwt?.value)
            .then(data => data.userFullBasket)
        : undefined


    const LocalBasket = localBasket.length > 0 ? await fetcher(GET_LOCAL_BASKET, { basket: localBasket })
        .then(data => data.localBasket) : null

    const provinces = await fetcher(`
                query {
                    provinces {
                        province
                        cities
                    }
                }
            ` , {}, revalidateOneHour)

    const products: UserBasket[] = data ? [...data.basket] : (LocalBasket ? [...LocalBasket.basket] : [])
    const total: number = data ? data?.total : LocalBasket?.total


    let title;
    let majorCat;
    let minorCat;

    switch (page.activeLink) {
        case "info":
            title = "اطلاعات"
            majorCat = "محصولات"
            break;

        case "shipment":
            title = "پرداخت"
            majorCat = "محصولات"
            minorCat = "اطلاعات"
            break;

        default:
            title = "محصولات"
            majorCat = ""
            minorCat = ""
            break;
    }


    return (
        <>
            <Header />
            <main className='container mx-auto px-3'>

                <Breadcrumb cart majorCat={majorCat} minorCat={minorCat} title={title} />

                {page.activeLink == "products" &&
                    <>
                        <ProductsCart Products={products} total={total} isLogin={data?.user ? true : false} />
                        <SuggestedProducts
                            id={"id"}
                            majorCat={"لوازم خوشنویسی"}
                            minorCat={""}
                            cat="کتاب"
                        />
                    </>
                }

                {page.activeLink == "info" &&

                    (data?.user ?
                        <ProfileForm user={data.user} provinces={provinces.provinces} shippingCost={data.shippingCost} />
                        :
                        <div className="text-center bg-white rounded-lg p-6 w-full mt-6 space-y-6">
                            <p className="font-semibold">
                                برای ادامه خرید به حسابتان وارد شوید.
                            </p>
                            <Link href="/login?bas=true"
                                className={`transition-all duration-75 text-center w-[50%] active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2 px-8 rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                            >
                                ورود به حساب
                            </Link>
                        </div>)
                }

                {page.activeLink == "shipment" &&
                    <Receipt products={products} data={data} />
                }

            </main>
            <Footer />
        </>
    );
}

export default Basket;