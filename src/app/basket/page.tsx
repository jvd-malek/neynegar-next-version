import Box from '@/lib/Components/ProductBoxes/Box';
import BoxHeader from '@/lib/Components/ProductBoxes/BoxHeader';
import Link from 'next/link';
import TxtInputs from '../../lib/Components/Account/TxtInputs';
import CostBox from '../../lib/Components/BasketBoxes/CostBox';
import ProductBasBox from '../../lib/Components/BasketBoxes/ProductBasBox';
import { cookies } from 'next/headers';
import { Metadata } from "next";
import Receipt from '../../lib/Components/BasketBoxes/Receipt';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

export const metadata: Metadata = {
    title: "سبد خرید | فروشگاه اینترنتی نی‌نگار",
    description: "بررسی و مدیریت محصولات انتخاب‌شده برای خرید از فروشگاه اینترنتی نی‌نگار. تکمیل فرآیند خرید و پرداخت آنلاین با بهترین قیمت.",
    keywords: ["سبد خرید", "خرید آنلاین", "لوازم خوشنویسی", "هنرهای سنتی", "مدیریت خرید", "فروشگاه اینترنتی"],
    robots: "noindex, nofollow", // Recommended for cart pages to prevent indexing.
    openGraph: {
        title: "سبد خرید | فروشگاه اینترنتی نی‌نگار",
        description: "بررسی و مدیریت محصولات انتخاب‌شده برای خرید از فروشگاه اینترنتی نی‌نگار. تکمیل فرآیند خرید و پرداخت آنلاین با بهترین قیمت.",
        url: "https://neynegar1.ir/cart",
        siteName: "نی‌نگار",
        images: [
            {
                url: "https://neynegar1.ir/cart-image.png",
                width: 800,
                height: 600,
                alt: "تصویر سبد خرید نی‌نگار",
            },
        ],
        locale: "fa_IR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "سبد خرید | فروشگاه اینترنتی نی‌نگار",
        description: "بررسی و مدیریت محصولات انتخاب‌شده برای خرید از فروشگاه اینترنتی نی‌نگار. تکمیل فرآیند خرید و پرداخت آنلاین با بهترین قیمت.",
        images: ["https://neynegar1.ir/cart-image.png"],
    },
    alternates: {
        canonical: "https://neynegar1.ir/cart",
    },
};

interface UserBasket {
    count: number
    productId: {
        _id: string
        title: string
        desc: string
        weight: number,
        cover: string
        brand: string
        status: string
        majorCat: string
        minorCat: string
        price: number,
        discount: number
        popularity: number
        showCount: number
        discountRaw: { discount: number, date: number }[]
    },
    currentPrice: number
    currentDiscount: number
    itemTotal: number
    itemDiscount: number
    itemWeight: number
}

async function Basket({ searchParams }: any) {
    const params = await searchParams;
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');
    const bas = cookieStore.get('basket')
    const basketForm = cookieStore.get('basketForm')

    const page = {
        page: parseInt(params.page || '1'),
        sort: params.sort || 'latest',
        cat: params.cat || 'همه',
        count: parseInt(params.count || '5'),
        search: params.search || '',
        activeLink: params.activeLink || "product",
    };


    let localBasket: { count: number, productId: string }[] | [] = bas ? JSON.parse(bas?.value as string).map((item: any) => ({
        productId: item.productId,
        count: item.count
    })) : []

    const offer = await fetch(
        `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                   query GetOffers {
                        offer {
                            products {	
                                _id
                                title
                                desc
                                price{price}
                                discount{discount}
                                popularity
                                cover
                                brand
                                showCount
                                majorCat
                                minorCat
                            }
                        }
                    }
            `
            }),
            next: { revalidate: 3600 }
        })
        .then(res => res.json())

    const data = jwt?.value ? await fetch(
        `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,

        {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                'authorization': jwt?.value as string
            },
            body: JSON.stringify({
                query: `
                    query GetUserFullBasket {
                        userFullBasket {
                            user {
                            _id
                            status
                            name
                            phone
                            address
                            postCode
                            totalBuy
                            discount {
                                code
                                date
                                discount
                                status
                            }
                            favorite {
                                productId {
                                _id
                                }
                            }
                            bascket {
                                productId {
                                _id
                                }
                            }
                            createdAt
                            updatedAt
                            }
                            basket {
                                count
                                productId {
                                    _id
                                    title
                                    desc
                                    price
                                    discount
                                    weight
                                    cover
                                    brand
                                    status
                                    majorCat
                                    minorCat
                                    discountRaw {
                                        code
                                        date
                                        discount
                                    }
                                    showCount
                                }
                                currentPrice
                                currentDiscount
                                itemTotal
                                itemDiscount
                                itemWeight
                            }
                            subtotal
                            totalDiscount
                            total
                            totalWeight
                            shippingCost
                            grandTotal
                            state
                        }
                    }
                `
            }),
        })
        .then(res => res.json())
        .then(res => res.data.userFullBasket)
        .catch(error => {
            console.error("Error fetching user data:", error);
        }) : undefined

    const LocalBasket = localBasket.length > 0 ? await fetch(
        `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
        {
            method: "POST",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `
                    query GetLocalBasket($basket: [BasketInput!]!) {
                        localBasket(basket: $basket) {
                            basket {
                                count
                                productId {
                                    _id
                                    title
                                    desc
                                    weight
                                    cover
                                    brand
                                    status
                                    majorCat
                                    minorCat
                                    popularity
                                    price
                                    discount
                                    discountRaw {
                                        discount
                                        date
                                    }
                                    showCount
                                }
                                currentPrice
                                currentDiscount
                                itemTotal
                                itemDiscount
                                itemWeight
                            }
                            subtotal
                            totalDiscount
                            total
                            totalWeight
                            shippingCost
                            grandTotal
                            state
                        }
                    }
                `,
                variables: {
                    basket: localBasket
                }
            })
        }
    )
        .then(res => res.json())
        .then(res => res.data?.localBasket ? res.data.localBasket : null) : null

    const products: UserBasket[] = data?.state ?
        [...data.basket] :
        (LocalBasket ? [...LocalBasket.basket] : [])

    let basket = data?.basket ? data.basket : (LocalBasket ? LocalBasket.basket : [])
    return (
        <div className='lg:w-[85vw] md:w-[90vw] w-[98vw] mx-auto px-2 md:px-0'>
            {/* Breadcrumb navigation */}
            <nav aria-label="breadcrumb" className="lg:mt-30 mt-26 bg-slate-200 rounded-xl py-3 px-4 flex justify-start items-center gap-4 font-medium">
                <Link href="/" className="relative pl-6 flex items-center" aria-label="خانه">
                    <HomeRoundedIcon />
                    <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                        <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                    </span>
                </Link>
                <p className="line-clamp-1 text-shadow" aria-current="page">سبد خرید شما</p>
            </nav>

            <div className="relative mt-6">

                {/* starts of header button of basket boxes */}
                <div className="flex gap-4 sm:justify-start justify-between">
                    <Link href={`?activeLink=product`} className={`bg-slate-200 text-zinc-600 px-4 py-2.5 rounded-t-xl cursor-pointer transition-all ${page.activeLink == "product" ? " opacity-100 translate-y-0" : "opacity-70 translate-y-1.5 mb-6 rounded-b-xl"}`}>تایید محصولات</Link>
                    <Link href={jwt ? `?activeLink=info` : "/login?bas=true"} className={`bg-slate-200 text-zinc-600 px-4 py-2.5 rounded-t-xl cursor-pointer transition-all ${page.activeLink == "info" ? " opacity-100 translate-y-0" : "opacity-70 translate-y-1.5 mb-6 rounded-b-xl"}`}>اطلاعات تکمیلی</Link>
                    <Link href={jwt ? (basketForm?.value ? `?activeLink=shipment` : "") : "/login?bas=true"} className={`bg-slate-200 text-zinc-600 px-4 py-2.5 rounded-t-xl cursor-pointer transition-all ${page.activeLink == "shipment" ? " opacity-100 translate-y-0 z-10" : "opacity-70 translate-y-1.5 mb-6 rounded-b-xl"}`}>تکمیل خرید</Link>
                </div>
                {/* ends of header button of basket boxes */}

                {/* starts of data box */}
                <div className={`bg-slate-200 transition-all ${page.activeLink == "info" ? "w-full opacity-100" : "h-0 opacity-60 w-0 overflow-hidden z-0"} rounded-xl`}>
                    <div className={`w-[90%] md:pb-16 pt-16 pb-10 mx-auto transition-all duration-700 ${page.activeLink == "info" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
                        {
                            data ?
                                <TxtInputs data={data} /> :
                                <div className="flex justify-center items-center w-full flex-col gap-6">
                                    <p className="">
                                        برای ادامه خرید به حسابتان وارد شوید.
                                    </p>
                                    <Link href="/login?bas=true"
                                        className={`transition-all duration-75 text-center w-[50%] active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2 px-8 rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                                    >
                                        ورود به حساب
                                    </Link>

                                </div>
                        }

                    </div>
                </div>
                {/* ends of data box */}

                {/* starts of shipping boxes */}
                <div className={`bg-slate-200 transition-all ${page.activeLink == "shipment" ? "w-full opacity-100 p-8" : "h-0 p-0 opacity-60 w-0 overflow-hidden z-0"} sm:rounded-xl rounded-b-xl rounded-r-xl relative`}>

                    <h2 className="text-xl font-bold py-2 pl-4 pr-6 rounded-l-lg rounded-r-xl -right-2 top-6 text-white bg-black absolute transition-all">
                        فاکتور شما
                    </h2>
                    {page.activeLink == "shipment" &&
                        <Receipt activeLink={page.activeLink} products={products} data={data} />
                    }

                </div>
                {/* ends of shipping boxes */}

                {/* starts of cost & discount boxes */}
                <div className="grid gap-12 justify-center grid-cols-5">

                    {/* starts of products box */}
                    <ProductBasBox Products={products} basket={basket} page={page} />
                    {/* ends of products box */}

                    {/* starts of favorite products */}
                    <div className={`bg-slate-200 lg:col-start-4 col-end-6 pt-10 pb-4 px-4 p lg:row-start-1 col-start-1 md:row-start-3 row-start-4 transition-all ${page.activeLink == "product" ? "w-full block opacity-100" : "hidden overflow-hidden z-0"} transition-opacity rounded-xl relative h-fit`}>
                        <h3 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                            حراجستون
                        </h3>

                        <div className="w-[90%] lg:w-[60%] md:w-full mx-auto mt-10">
                            <Box books={offer?.data?.offer?.products} />
                        </div>
                    </div>
                    {/* ends of favorite products */}

                    {/* starts of cost & discount box */}
                    <CostBox data={data ? data : LocalBasket} page={page} />
                    {/* ends of cost & discount box */}

                </div>
                {/* ends of cost & discount boxes */}
            </div>

        </div>
    );
}

export default Basket;