// next
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';


// mui components
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// components
import Breadcrumb from '@/public/components/breadcrumb/Breadcrumb';
import DescProductBoxes from "@/public/components/home/DescProductBoxes";
import CommentComplex from '@/public/components/comment/CommentComplex';
import ImgBtn from '@/public/components/product/ImgBtn';
import BuyBtn from '@/public/components/product/BuyBtn';
import DiscountTimer from '@/public/components/product-boxes/DiscountTimer';
import Header from '@/public/components/header/Header';
import Footer from '@/public/components/footer/Footer';
import SuggestedProducts from '@/public/components/product/SuggestedProducts';
import ShareURL from '@/public/components/article/ShareURL';
import FAQ from '@/public/components/product/FAQ';

// types and queries
import { GET_PRODUCT_BY_ID } from '@/public/graphql/productQueries';
import { GET_COMMENTS_BY_ID } from '@/public/graphql/commentQueries';
import { paginatedCommentsType } from '@/public/types/comment';
import { userType } from '@/public/types/user';
import { GET_USER_BY_TOKEN } from '@/public/graphql/userQueries';

// utils
import ProductAttributes from '@/public/components/product/ProductAttributes';
import ContentWithLinks from '@/public/utils/link/linkParser';
import { fetcher, noCaching, revalidateOneHour, revalidateOneHourByTags } from '@/public/utils/fetcher';
import { cookies } from 'next/headers';
import { customLoader } from '@/public/utils/product/ProductBoxUtils';
import InfoTable from '@/public/components/product/InfoTable';
import { Product as productType } from '@/public/types/product';

const productDataFetcher = async (id: string) => {
    const productData = await fetcher(GET_PRODUCT_BY_ID, { id }, revalidateOneHourByTags([`product-${id}`]));
    if (!productData) {
        redirect("/404")
    }
    return productData?.product
}

const commentDataFetcher = async (id: string, type: string, page: number, limit: number) => {
    const commentData = await fetcher(GET_COMMENTS_BY_ID, { id, type, page, limit }, noCaching);
    return commentData?.commentsById
}

const userDataFetcher = async (jwt: string) => {
    const userData = await fetcher(GET_USER_BY_TOKEN, {}, revalidateOneHour, jwt);
    return userData?.userByToken
}

export async function generateMetadata({ params }: any) {
    const { id } = await params;

    try {
        const product: productType = await productDataFetcher(id)
        const imageUrl = `https://api.neynegar1.ir/uploads/${product.cover}`;
        const price = product.finalPrice || 0;
        return {
            title: `${product.title} | فروشگاه اینترنتی نی نگار`,
            description: product.desc?.substring(0, 160) || "محصول با کیفیت از فروشگاه اینترنتی نی نگار",
            price,
            imageUrl: imageUrl,
            alternates: {
                canonical: `https://neynegar1.ir/product/${id}`,
                languages: {
                    'fa-IR': `https://neynegar1.ir/product/${id}`,
                },
            },
            openGraph: {
                title: `${product.title} | نی نگار`,
                description: product.desc?.substring(0, 160) || "محصول با کیفیت از فروشگاه اینترنتی نی نگار",
                url: `https://neynegar1.ir/product/${id}`,
                type: 'website',
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 600,
                        alt: product.title,
                    },
                ],
                siteName: 'نی نگار',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${product.title} | نی نگار`,
                description: product.desc?.substring(0, 160) || "محصول با کیفیت از فروشگاه اینترنتی نی نگار",
                images: [imageUrl],
            },
            keywords: [
                product.title,
                product.majorCat,
                product.minorCat,
                ...(product.brand ? [product.brand] : []),
                ...(product.publisher ? [product.publisher] : []),
                "خوشنویسی",
                "نستعلیق",
                "نی نگار",
                "شکسته",
                "خط",
                "خط خودکاری",
                "کتابت",
                "هنر",
                "هنر اصیل ایرانی"
            ].filter(Boolean),
            other: {
                'product_id': product._id,
                'product_name': product.title,
                'product_price': price.toString(),
                'product_status': product.status == "درحد‌نو" || product.status == "دسته‌دوم" ? "در حد نو" : product.status,
                'product_old_price': product.currentPrice?.toString() || price.toString(),
                'availability': product.showCount > 0 ? 'instock' : 'outofstock',
                'product:price:amount': price.toString(),
                'product:price:currency': 'IRR',
                'product:availability': product.showCount > 0 ? 'in stock' : 'out of stock',
                'og:image': imageUrl,
                'twitter:image': imageUrl,
            }

        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'محصول | فروشگاه اینترنتی نی نگار',
            description: 'صفحه محصولات فروشگاه اینترنتی نی نگار',
        };
    }
}

async function Product({ params, searchParams }: any) {
    const { id } = await params;
    const { img, page: searchParamsPage, count } = await searchParams;
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value

    const page = {
        page: parseInt(searchParamsPage || '1'),
        count: parseInt(count || '10')
    };

    const product: productType = await productDataFetcher(id);
    const comments: paginatedCommentsType = await commentDataFetcher(id, "Product", page.page, page.count)
    const user: userType | null = jwt ? await userDataFetcher(jwt) : null

    // استفاده در کامپوننت
    const price = product.finalPrice || 0;

    const lastDiscount = product?.discount?.at(-1)
    const lastPrice = product?.currentPrice || 0
    const isDiscountValid = lastDiscount && lastDiscount.discount > 0 && lastDiscount.date > Date.now()

    
    return (
        <>
            <Header />

            <main className="container mx-auto mt-6 relative px-3">

                {/* Fixed buy button for mobile */}
                <div className="fixed font-semibold bottom-0 left-1/2 -translate-x-1/2 sm:hidden backdrop-blur-sm bg-white/30 shadow border border-mist-200 rounded-t-xl px-4 w-[98vw] mx-auto py-2 text-center z-50">
                    <BuyBtn
                        id={id}
                        showCount={product.showCount}
                        fix
                        cat={`${product.majorCat}/${product.minorCat}`}
                        price={price.toLocaleString('fa-IR')}
                        state={product.state}
                    />
                </div>

                {/* Breadcrumb navigation */}
                <Breadcrumb majorCat={product.majorCat} minorCat={product.minorCat} title={product.title} brand={product.brand ? product.brand : undefined} />

                {/* product attr for torob */}
                <ProductAttributes
                    attributes={[
                        { label: "توضیحات", value: product.desc || "نامشخص" },
                        { label: "دسته‌بندی", value: `${product.majorCat} / ${product.minorCat}` },
                        { label: "برند", value: product.brand || "نامشخص" },
                        { label: "سایز", value: product.size || "نامشخص" },
                        { label: "وزن", value: `${product.weight} گرم` },
                        { label: "وضعیت محصول", value: product.status == "درحد‌نو" || product.status == "دسته‌دوم" ? "در حد نو" : product.status }
                    ]}
                />

                {/* Product section */}
                <section className="lg:grid gap-6 grid-cols-2 flex flex-col mt-6">

                    {/* Product images */}
                    <div className="col-start-1 col-end-2 row-start-1 row-end-4 w-full bg-white rounded-xl pt-10 pb-4 px-4 flex flex-col justify-between">
                        <div className="lg:block md:flex block gap-8">
                            <div className="rounded-xl overflow-hidden flex justify-center items-center py-6 pl-6 pr-12 shadow-cs bg-white relative w-full mx-auto lg:mb-0 md:mb-4">
                                {product?.cover ? (
                                    <Image
                                        src={img || product.cover}
                                        alt={product.title}
                                        className="bg-contain rounded-xl transition-transform duration-300 hover:scale-135 active:scale-135"
                                        width={300}
                                        height={300}
                                        loader={customLoader}
                                        priority
                                    />
                                ) : (
                                    <div className="md:w-70 w-55 md:h-75 h-60 rounded-lg bg-gray-300"></div>
                                )}

                                <ImgBtn id={id} user={user ? user : null} />
                            </div>

                            {isDiscountValid &&
                                <div className="max-h-36 mt-6 flex justify-between items-center flex-wrap gap-6 bg-linear-to-l from-red-100 to-red-300 border border-red-300 rounded-lg shadow p-2">
                                    <div className="md:text-lg font-bold text-red-700 text-center">
                                        {`${lastDiscount.discount} درصد تخفیف ویژه`}
                                    </div>
                                    <DiscountTimer endDate={lastDiscount.date} page />
                                </div>
                            }

                            <div className="flex justify-center items-center">
                                {product?.images.length > 0 &&
                                    <div className="flex justify-start gap-2 overflow-x-auto scrollable-section max-w-[80vw] mt-6 bg-mist-100 shadow p-2 rounded-xl h-fit">
                                        {product && (
                                            <Link href={`?img=${product.cover}`} scroll={false} aria-label="تصویر اصلی محصول">
                                                <Image
                                                    src={product.cover}
                                                    alt={product.title}
                                                    width={80}
                                                    height={80}
                                                    loader={customLoader}
                                                    className="w-20 h-20 min-w-20 bg-contain cursor-pointer rounded-lg transition-opacity duration-300 hover:opacity-70"
                                                    loading='lazy'
                                                />
                                            </Link>
                                        )}
                                        {product?.images?.map((i: string) => (
                                            <Link
                                                href={`?img=${i}`}
                                                scroll={false}
                                                key={i}
                                                aria-label="تصویر محصول"
                                                className={i.length <= 0 ? "hidden" : ""}
                                            >
                                                <Image
                                                    src={i}
                                                    alt={i}
                                                    width={80}
                                                    height={80}
                                                    loader={customLoader}
                                                    className="w-20 h-20 min-w-20 bg-contain cursor-pointer rounded-lg transition-opacity duration-300 hover:opacity-70"
                                                    loading='lazy'
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                }
                            </div>

                        </div>

                        <div className="lg:block hidden">
                            <ShareURL title={product.title} link={`https://neynegar1.ir/product/${id}`} />
                        </div>

                    </div>

                    {/* Product details */}
                    <div className="col-start-2 col-end-3 row-start-1 row-end-3 w-full bg-white rounded-xl pt-10 pb-4 px-4 flex flex-col justify-between">
                        <div>
                            <h1 className="text-xl font-bold">
                                {product?.title || (
                                    <div className="w-38 h-7 rounded bg-mist-200 animate-pulse"></div>
                                )}
                            </h1>
                            <div className="mt-4">
                                <div className="text-lg whitespace-pre-line font-medium">
                                    {product?.desc ?
                                        <>
                                            <ContentWithLinks content={product?.desc || ''} />
                                            <div className="mt-6 bg-linear-to-br from-blue-50 to-blue-50 rounded-xl p-2 border border-blue-100">
                                                <p className="text-sm font-bold text-gray-800 mb-3">
                                                    نیاز به راهنمایی داری؟
                                                </p>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <Link
                                                        href="#faq"
                                                        className="flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-medium text-sm py-2.5 px-3 rounded-lg border border-blue-200 transition-all hover:shadow-md active:scale-95"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        سوالات متداول
                                                    </Link>

                                                    <Link
                                                        href="#info"
                                                        className="flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-blue-600 font-medium text-sm py-2.5 px-3 rounded-lg border border-blue-200 transition-all hover:shadow-md active:scale-95"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        اطلاعات بیشتر
                                                    </Link>
                                                </div>

                                                <p className="text-xs text-gray-500 mt-3 text-center">
                                                    سوال دیگه‌ای داری؟
                                                    <a
                                                        href="https://ble.ir/neynegarsupport"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 font-medium mr-1 transition-colors"
                                                    >
                                                        با ما در ارتباط باش
                                                    </a>
                                                </p>
                                            </div>
                                        </>
                                        :
                                        <div className='flex flex-col gap-1'>
                                            <div className="w-50 h-5 rounded bg-mist-200 animate-pulse"></div>
                                            <div className="w-70 h-5 rounded bg-mist-200 animate-pulse"></div>
                                            <div className="w-65 h-5 rounded bg-mist-200 animate-pulse"></div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="mt-7 bg-mist-100 py-4 px-6 rounded-xl grid gap-6 items-center justify-between">
                                {product ? (
                                    <p className="col-start-2 col-end-3 row-start-1 text-mist-700">
                                        فروش:
                                        <span className="text-lg text-nowrap mr-1 font-bold text-black">
                                            {`${product.totalSell.toLocaleString('fa-IR')} عدد`}
                                        </span>
                                    </p>
                                ) : (
                                    <div className="sm:w-40 w-26 h-8 rounded bg-mist-300 animate-pulse col-start-2 col-end-3 row-start-1"></div>
                                )}
                                {product ? (
                                    <p className="col-start-1 col-end-2 row-start-1 text-mist-700">
                                        موجودی:
                                        <span className={`text-lg text-nowrap font-bold mr-1 ${product.showCount == 0 ? "text-red-700 bg-red-200 p-1 rounded-md text-base" : "text-black"}`}>
                                            {product.showCount > 0 ?
                                                ` ${product.showCount.toLocaleString('fa-IR')} عدد` :
                                                `ناموجود`}
                                        </span>
                                    </p>
                                ) : (
                                    <div className="sm:w-40 w-26 h-8 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-1"></div>
                                )}

                                {product ? (
                                    <p className="col-start-2 col-end-3 row-start-2 place-self-center text-mist-700">
                                        وضعیت: <span className="text-lg text-nowrap mr-1 font-bold text-black">{product.status}</span>
                                    </p>
                                ) : (
                                    <div className="sm:w-40 w-26 h-8 rounded bg-mist-300 animate-pulse col-start-2 col-end-3 row-start-2"></div>
                                )}
                                {product ? (
                                    <div className="col-start-1 col-end-2 row-start-2 font-bold">
                                        {
                                            (product.state === "callForPrice" || product.showCount == 0) ?
                                                (
                                                    <p className="text-xs text-nowrap text-center font-semibold">
                                                        برای اطلاع از قیمت محصول <br />
                                                        تماس بگیرید
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className={`${isDiscountValid ? 'block' : 'hidden'} line-through font-semibold text-gray-500 text-sm leading-3`}>
                                                            {lastPrice.toLocaleString('fa-IR')}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-nowrap">
                                                            <h2 className="text-xl leading-3">
                                                                {price.toLocaleString('fa-IR')}
                                                                <span className="text-base"> تومان</span>
                                                            </h2>
                                                            {isDiscountValid &&
                                                                <p className="text-red-600 text-xs px-1 py-0.5 bg-red-100 rounded-md border border-red-300">
                                                                    %{lastDiscount.discount}
                                                                </p>
                                                            }
                                                        </div>
                                                    </>
                                                )}
                                    </div>
                                ) : (
                                    <div className="sm:w-40 w-26 h-8 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2"></div>
                                )}
                            </div>
                            <BuyBtn id={id} showCount={product.showCount} cat={product.majorCat} state={product.state} />
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <ShareURL title={product.title} link={`https://neynegar1.ir/product/${id}`} />
                    </div>

                    {/* Suggested products */}
                    <div className="col-start-1 col-end-3 row-start-4">
                        <SuggestedProducts
                            id={id}
                            majorCat={product.majorCat}
                            minorCat={product.minorCat}
                            cat="کتاب"
                        />
                    </div>

                    <InfoTable product={product} />

                    <FAQ faqs={product.faqs} />

                    {/* Product specifications */}
                    <div className="col-start-2 col-end-3 row-start-3 row-end-4 w-full bg-white rounded-xl p-6">
                        <h3 className="text-lg font-bold">
                            مقالات مرتبط
                        </h3>

                        <div className="mt-10">

                            <Accordion defaultExpanded>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                >
                                    {product ? (
                                        <p className="line-clamp-2 font-semibold">
                                            {product.productArticleId ? (
                                                product.productArticleId.title
                                            ) : (
                                                <SentimentDissatisfiedTwoToneIcon />
                                            )}
                                        </p>
                                    ) : (
                                        <div className="w-46 h-8 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2"></div>
                                    )}
                                </AccordionSummary>
                                <AccordionDetails>
                                    {product ? (
                                        <p className="line-clamp-2">
                                            {product.productArticleId ? (
                                                product.productArticleId.desc
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    مقاله‌ای در این باب موجود نمی‌باشد.
                                                    <SentimentDissatisfiedTwoToneIcon />
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="w-full h-7 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2"></div>
                                            <div className="sm:w-40 w-26 h-7 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2 mt-2"></div>
                                        </>
                                    )}
                                </AccordionDetails>
                                {product?.productArticleId && (
                                    <AccordionActions>
                                        <Link
                                            href={`/article/${product.productArticleId._id}`}
                                            className="flex items-center gap-x-1.5 cursor-pointer text-sm text-blue-600"
                                        >
                                            مشاهده مقاله
                                            <KeyboardBackspaceRoundedIcon fontSize="small" />
                                        </Link>
                                    </AccordionActions>
                                )}
                            </Accordion>

                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel2-content"
                                    id="panel2-header"
                                >
                                    {product ? (
                                        <p className="line-clamp-2 font-semibold">
                                            {product.authorArticleId ? (
                                                product.authorArticleId.title
                                            ) : (
                                                <SentimentDissatisfiedTwoToneIcon />
                                            )}
                                        </p>
                                    ) : (
                                        <div className="w-46 h-8 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2"></div>
                                    )}
                                </AccordionSummary>
                                <AccordionDetails>
                                    {product ? (
                                        <p className="line-clamp-2">
                                            {product.authorArticleId ? (
                                                product.authorArticleId.desc
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    مقاله‌ای در این باب موجود نمی‌باشد.
                                                    <SentimentDissatisfiedTwoToneIcon />
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="w-full h-7 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2"></div>
                                            <div className="sm:w-40 w-26 h-7 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2 mt-2"></div>
                                        </>
                                    )}
                                </AccordionDetails>
                                {product?.authorArticleId && (
                                    <AccordionActions>
                                        <Link
                                            href={`/article/${product.authorArticleId._id}`}
                                            className="flex items-center gap-x-1.5 text-sm cursor-pointer text-blue-600"
                                        >
                                            مشاهده مقاله
                                            <KeyboardBackspaceRoundedIcon fontSize="small" />
                                        </Link>
                                    </AccordionActions>
                                )}
                            </Accordion>

                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel3-content"
                                    id="panel3-header"
                                >
                                    {product ? (
                                        <p className="line-clamp-2 font-semibold">
                                            {product.publisherArticleId ? (
                                                product.publisherArticleId.title
                                            ) : (
                                                <SentimentDissatisfiedTwoToneIcon />
                                            )}
                                        </p>
                                    ) : (
                                        <div className="w-46 h-8 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2"></div>
                                    )}
                                </AccordionSummary>
                                <AccordionDetails>
                                    {product ? (
                                        <p className="line-clamp-2">
                                            {product.publisherArticleId ? (
                                                product.publisherArticleId.desc
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    مقاله‌ای در این باب موجود نمی‌باشد.
                                                    <SentimentDissatisfiedTwoToneIcon />
                                                </span>
                                            )}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="w-full h-7 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2"></div>
                                            <div className="sm:w-40 w-26 h-7 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-2 mt-2"></div>
                                        </>
                                    )}
                                </AccordionDetails>
                                {product?.publisherArticleId && (
                                    <AccordionActions>
                                        <Link
                                            href={`/article/${product.publisherArticleId._id}`}
                                            className="flex items-center gap-x-1.5 text-sm cursor-pointer text-blue-600"
                                        >
                                            مشاهده مقاله
                                            <KeyboardBackspaceRoundedIcon fontSize="small" />
                                        </Link>
                                    </AccordionActions>
                                )}
                            </Accordion>
                        </div>
                    </div>

                </section>



                <section className="grid gap-6 mt-6 mb-10 grid-cols-2">
                    <CommentComplex
                        ban={user ? user.status?.includes("ban") : false}
                        commentsData={comments || { comments: [], totalPages: 0, currentPage: 1, total: 0 }}
                        id={id}
                        targetType="Product"
                    />
                </section>

                {/* Product description boxes */}
                <div className="flex justify-center items-center flex-wrap sm:gap-8 gap-10 mt-26 text-center">
                    <DescProductBoxes />
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Product;