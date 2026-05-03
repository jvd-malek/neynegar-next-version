// next
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// icons
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';

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

// types and queries
import { GET_COMMENTS_BY_ID } from '@/public/graphql/commentQueries';
import { paginatedCommentsType } from '@/public/types/comment';
import { userType } from '@/public/types/user';
import { GET_USER_BY_TOKEN } from '@/public/graphql/userQueries';

// utils
import ProductAttributes from '@/public/components/product/ProductAttributes';
import ContentWithLinks from '@/public/utils/link/linkParser';
import { fetcher, noCaching, revalidateOneHour, revalidateOneHourByTags } from '@/public/utils/fetcher';
import { cookies } from 'next/headers';
import { GET_PACKAGE_BY_ID } from '@/public/graphql/packageQueries';
import { packageType } from '@/public/types/package';
import { customLoader } from '@/public/utils/product/ProductBoxUtils';

const packageDataFetcher = async (id: string) => {
    const packageData = await fetcher(GET_PACKAGE_BY_ID, { id }, revalidateOneHourByTags([`package-${id}`]));
    if (!packageData) {
        redirect("/404")
    }

    return packageData?.package
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
        const Package: packageType = await packageDataFetcher(id);
        const imageUrl = `https://api.neynegar1.ir/uploads/${Package.cover}`;
        const price = Package?.finalPrice

        return {
            title: `${Package?.title} | فروشگاه اینترنتی نی نگار`,
            description: Package.desc?.substring(0, 160) || "محصول با کیفیت از فروشگاه اینترنتی نی نگار",
            price,
            imageUrl: imageUrl,
            alternates: {
                canonical: `https://neynegar1.ir/package/${id}`,
                languages: {
                    'fa-IR': `https://neynegar1.ir/package/${id}`,
                },
            },
            openGraph: {
                title: `${Package.title} | نی نگار`,
                description: Package.desc?.substring(0, 160) || "محصول با کیفیت از فروشگاه اینترنتی نی نگار",
                url: `https://neynegar1.ir/package/${id}`,
                type: 'website',
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 600,
                        alt: Package.title,
                    },
                ],
                siteName: 'نی نگار',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${Package.title} | نی نگار`,
                description: Package.desc?.substring(0, 160) || "محصول با کیفیت از فروشگاه اینترنتی نی نگار",
                images: [imageUrl],
            },
            keywords: [
                Package.title,
                Package.category,
                ...(Package.products.map(pack => pack.product.title)),
                "خوشنویسی",
                "نستعلیق",
                "نی نگار",
                "شکسته",
                "خط",
                "خط خودکاری",
                "کتابت",
                "هنر",
                "هنر اصیل ایرانی",
                "بسته خوشنویسی"
            ].filter(Boolean),
            other: {
                'product_id': Package._id,
                'product_name': Package.title,
                'product_price': price.toString(),
                'product_status': Package.status == "درحد‌نو" || Package.status == "دسته‌دوم" ? "در حد نو" : Package.status,
                'product_old_price': Package.totalPrice.toString() || price.toString(),
                'availability': Package.showCount > 0 ? 'instock' : 'outofstock',
                'product:price:amount': price.toString(),
                'product:price:currency': 'IRR',
                'product:availability': Package.showCount > 0 ? 'in stock' : 'out of stock',
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

async function Package({ params, searchParams }: any) {
    const { id } = await params;
    const { img, page: searchParamsPage, count } = await searchParams;
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value

    const page = {
        page: parseInt(searchParamsPage || '1'),
        count: parseInt(count || '10')
    };

    const Package: packageType = await packageDataFetcher(id);
    const comments: paginatedCommentsType = await commentDataFetcher(id, "Package", page.page, page.count)
    const user: userType | null = jwt ? await userDataFetcher(jwt) : null
    console.log(comments);

    const lastDiscount = Package?.discount?.at(-1)
    const isDiscountValid = lastDiscount && lastDiscount.discount > 0 && lastDiscount.date > Date.now()

    const packAttributeValidData = Package.products.map(p => {
        return {
            title: p.product.title,
            count: p.quantity
        }
    })

    return (
        <>
            <Header />

            <main className="container mx-auto mt-6 relative px-3">

                {/* Fixed buy button for mobile */}
                <div className="fixed font-semibold bottom-0 left-1/2 -translate-x-1/2 sm:hidden backdrop-blur-sm bg-white/30 shadow border border-mist-200 rounded-t-xl px-4 w-[98vw] mx-auto py-2 text-center z-50">
                    <BuyBtn
                        id={id}
                        showCount={Package.showCount}
                        fix
                        cat='پکیج'
                        price={Package.finalPrice.toLocaleString('fa-IR')}
                        state={Package.state}
                        isPackage
                    />
                </div>

                {/* Breadcrumb navigation */}
                <Breadcrumb majorCat="پکیج" title={Package.title} />

                {/* product attr fro torob */}
                <ProductAttributes
                    attributes={[
                        { label: "توضیحات", value: Package.desc || "نامشخص" },
                        { label: "محصولات", pack: packAttributeValidData || "نامشخص" },
                        { label: "دسته‌بندی", value: "پکیج خوشنویسی" },
                        { label: "وزن", value: `${Package.totalWeight} گرم` },
                        { label: "وضعیت محصول", value: Package.status == "درحد‌نو" || Package.status == "دسته‌دوم" ? "در حد نو" : Package.status }
                    ]}
                />

                {/* Product section */}
                <section className="lg:grid gap-6 grid-cols-2 flex flex-col mt-6">

                    {/* Product images */}
                    <div className="col-start-1 col-end-2 row-start-1 row-end-4 w-full bg-white rounded-xl pt-10 pb-4 px-4 flex flex-col justify-between">
                        <div className="lg:block md:flex block gap-8">
                            <div className="rounded-xl overflow-hidden flex justify-center items-center py-6 pl-6 pr-12 shadow-cs bg-white relative w-full mx-auto lg:mb-0 md:mb-4">
                                {Package?.cover ? (
                                    <Image
                                        src={img || Package.cover}
                                        alt={Package.title}
                                        className="bg-contain rounded-xl transition-transform duration-300 hover:scale-135 active:scale-135"
                                        width={300}
                                        height={300}
                                        loader={customLoader}
                                        priority
                                    />
                                ) : (
                                    <div className="md:w-70 w-55 md:h-75 h-60 rounded-lg bg-mist-300 animate-pulse"></div>
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
                                {Package?.products.length > 0 &&
                                    <div className="flex justify-center gap-2 overflow-x-auto w-fit mt-6 bg-mist-100 shadow p-2 rounded-xl h-fit">
                                        {Package && (
                                            <Link href={`?img=${Package.cover}`} scroll={false} aria-label="تصویر اصلی محصول">
                                                <img
                                                    src={`https://api.neynegar1.ir/uploads/${Package.cover}`}
                                                    alt={Package.title}
                                                    className="w-20 h-22 bg-contain cursor-pointer rounded-lg transition-transform duration-300 hover:scale-110 active:scale-110"
                                                    loading='lazy'
                                                />
                                            </Link>
                                        )}
                                        {Package?.products?.map((item) => (
                                            <Link
                                                href={`?img=${item.product.cover}`}
                                                scroll={false}
                                                key={item.product._id}
                                                aria-label={`تصویر محصول ${item.product.title}`}
                                            >
                                                <img
                                                    src={`https://api.neynegar1.ir/uploads/${item.product.cover}`}
                                                    alt={item.product.title}
                                                    className="w-20 h-22 bg-contain cursor-pointer rounded-lg transition-transform duration-300 hover:scale-110 active:scale-110"
                                                    loading='lazy'
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                }
                            </div>

                        </div>

                        <div className="lg:block hidden">
                            <ShareURL title={Package.title} link={`https://neynegar1.ir/package/${id}`} />
                        </div>

                    </div>

                    {/* Product details */}
                    <div className="col-start-2 col-end-3 row-start-1 row-end-4 w-full bg-white rounded-xl pt-10 pb-4 px-4 flex flex-col justify-between">
                        <div>
                            <h1 className="text-xl font-bold">
                                {Package?.title || (
                                    <div className="w-38 h-7 rounded bg-mist-200 animate-pulse"></div>
                                )}
                            </h1>
                            <div className="mt-4">
                                <div className="text-lg whitespace-pre-line font-medium">
                                    {Package?.desc ?
                                        <ContentWithLinks content={Package?.desc || ''} />
                                        :
                                        <div className='flex flex-col gap-1'>
                                            <div className="w-50 h-5 rounded bg-mist-200 animate-pulse"></div>
                                            <div className="w-70 h-5 rounded bg-mist-200 animate-pulse"></div>
                                            <div className="w-65 h-5 rounded bg-mist-200 animate-pulse"></div>
                                        </div>
                                    }
                                </div>
                            </div>

                            <div className="p-2 mt-6">
                                <p className="font-bold text-lg text-cyan-700 pb-2 border-b border-mist-300">
                                    اقلام
                                    <span className="pl-1 text-xs text-mist-700 font-">({Package.totalProducts} محصول)</span>
                                </p>
                                <div className="mt-2 space-y-2">
                                    {Package.products.map((packProduct, index) => (
                                        <Link
                                            key={packProduct.product._id}
                                            href={`/product/${packProduct.product._id}`}
                                            className="flex justify-between items-center gap-3 bg-mist-100 rounded p-2"
                                        >
                                            <p className='line-clamp-1'>
                                                <span className="pl-1">{index + 1}.</span>
                                                {packProduct.product.title}
                                            </p>
                                            <div className='text-nowrap'>
                                                <p className='pl-1 inline font-bold text-cyan-700'>
                                                    {packProduct.quantity}
                                                    <span className='pr-0.5 text-xs font-medium text-mist-600'>
                                                        عدد
                                                    </span>
                                                </p>
                                                <KeyboardBackspaceRoundedIcon fontSize='inherit' />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="mt-7 bg-mist-100 p-4 rounded-xl grid gap-4 items-center justify-between">
                                {Package ? (
                                    <p className="col-start-2 col-end-3 row-start-1 text-mist-700">
                                        فروش:
                                        <span className="text-lg text-nowrap mr-1 font-bold text-black">
                                            {`${Package.totalSell.toLocaleString('fa-IR')} عدد`}
                                        </span>
                                    </p>
                                ) : (
                                    <div className="sm:w-40 w-26 h-8 rounded bg-mist-300 animate-pulse col-start-2 col-end-3 row-start-1"></div>
                                )}
                                {Package ? (
                                    <p className="col-start-1 col-end-2 row-start-1 text-mist-700">
                                        موجودی:
                                        <span className={`text-lg text-nowrap font-bold mr-1 ${Package.showCount == 0 ? "text-red-700 bg-red-200 p-1 rounded-md text-base" : "text-black"}`}>
                                            {Package.showCount > 0 ?
                                                ` ${Package.showCount.toLocaleString('fa-IR')} عدد` :
                                                `ناموجود`}
                                        </span>
                                    </p>
                                ) : (

                                    <div className="sm:w-40 w-26 h-8 rounded bg-mist-300 animate-pulse col-start-1 col-end-2 row-start-1"></div>

                                )}

                                {Package ? (
                                    <p className="col-start-2 col-end-3 row-start-2 place-self-center text-mist-700">
                                        وضعیت: <span className="text-lg text-nowrap mr-1 font-bold text-black">{Package.status}</span>
                                    </p>
                                ) : (
                                    <div className="sm:w-40 w-26 h-8 rounded bg-mist-300 animate-pulse col-start-2 col-end-3 row-start-2"></div>
                                )}
                                {Package ? (
                                    <div className="col-start-1 col-end-2 row-start-2 font-bold">
                                        {
                                            (Package.state === "callForPrice" || Package.showCount == 0) ?
                                                (
                                                    <p className="text-xs text-nowrap text-center font-semibold">
                                                        برای اطلاع از قیمت محصول <br />
                                                        تماس بگیرید
                                                    </p>
                                                ) : (
                                                    <>
                                                        <p className={`${isDiscountValid ? 'block' : 'hidden'} line-through text-gray-500 font-semibold text-sm leading-3`}>
                                                            {Package.totalPrice.toLocaleString('fa-IR')}
                                                        </p>
                                                        <div className="flex items-center gap-1 text-nowrap">
                                                            <h2 className="text-xl leading-3">
                                                                {Package.finalPrice.toLocaleString('fa-IR')}
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
                            <BuyBtn id={id} showCount={Package.showCount} cat="پکیج" state={Package.state} isPackage />
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <ShareURL title={Package.title} link={`https://neynegar1.ir/package/${id}`} />
                    </div>

                </section>

                {/* Suggested products */}
                <SuggestedProducts
                    id={id}
                    majorCat={Package.category}
                    isPackage
                />

                <section className="grid gap-6 mt-6 mb-10 grid-cols-2">
                    <CommentComplex
                        ban={user ? user.status?.includes("ban") : false}
                        commentsData={comments || { comments: [], totalPages: 0, currentPage: 1, total: 0 }}
                        id={id}
                        targetType="Package"
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

export default Package;