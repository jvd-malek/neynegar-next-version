// گروه‌بندی imports بر اساس منبع
import Image from 'next/image';
import Link from 'next/link';
import { Bounce, ToastContainer } from 'react-toastify';

// Material-UI Icons
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

// Material-UI Components
import Rating from '@mui/material/Rating';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Skeleton from '@mui/material/Skeleton';

// کامپوننت‌های داخلی
import Box from '@/lib/Components/ProductBoxes/Box';
import DescProductBoxes from "@/lib/Components/ProductBoxes/DescProductBoxes";
import CommentComplex from '@/lib/Components/Comment/CommentComplex';
import ImgBtn from '@/lib/Components/ProductBoxes/ImgBtn';
import BuyBtn from '@/lib/Components/ProductBoxes/BuyBtn';
import ContactModal from '@/lib/Components/ProductBoxes/ContactModal';
import DiscountTimer from '@/lib/Components/ProductBoxes/DiscountTimer';

// تایپ‌ها
import { productCoverType, productSingleType, productType } from '@/lib/Types/product';
import { cookies } from 'next/headers';

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    try {
        console.log("options ==> ", options);
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            // اضافه کردن exponential backoff
            const delay = Math.pow(2, 3 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

// جداسازی منطق محاسبه قیمت به یک تابع
const calculatePrice = (product: productSingleType) => {
    const lastPrice = product.price[product.price.length - 1].price;
    const lastDiscount = product.discount[product.discount.length - 1];
    const now = Date.now();

    if (lastDiscount.discount > 0 && lastDiscount.date > now) {
        return lastPrice * ((100 - lastDiscount.discount) / 100);
    }
    return lastPrice;
};

export async function generateMetadata({ params }: any) {
    const { id } = await params;

    try {
        const productGraphData = await fetchWithRetry(
            `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `
                  query GetProduct($id: ID!) {
                    product(id: $id) {
                     _id
                      title
                      desc
                      price {
                        price
                        date
                      }
                      cost {
                        cost
                        date
                      }
                      discount {
                        discount
                        date
                      }
                      count
                      showCount
                      totalSell
                      popularity
                      authorId {
                        _id
                        firstname
                        lastname
                      }
                      authorArticleId {
                        _id
                        title
                        desc
                      }
                      publisherArticleId {
                        _id
                        title
                        desc
                      }
                      productArticleId {
                        _id
                        title
                        desc
                      }
                      publisher
                      publishDate
                      brand
                      status
                      size
                      weight
                      majorCat
                      minorCat
                      cover
                      images
                      createdAt
                      updatedAt
                    }
                  }
                `,
                    variables: { id }
                }),
                next: {
                    revalidate: 3600,
                    tags: [`product-${id}`] // بهبود ۲: اضافه کردن cache tag برای مدیریت بهتر
                }
            }
        );
        const stateGraph = await productGraphData.json()

        const state: productType = stateGraph.data

        // بهبود ۳: ساخت URL کامل برای تصاویر
        const imageUrl = `https://api.neynegar1.ir/imgs/${state.product.cover}`;

        const price = calculatePrice(state.product);
        // بهبود ۴: اضافه کردن metadataهای بیشتر
        return {
            title: `${state.product.title} | فروشگاه اینترنتی نی نگار`,
            description: state.product.desc?.substring(0, 160) || "محصول با کیفیت از فروشگاه اینترنتی نی نگار",
            price,
            alternates: {
                canonical: `https://neynegar1.ir/product/${id}`,
                languages: {
                    'fa-IR': `https://neynegar1.ir/product/${id}`,
                },
            },
            openGraph: {
                title: `${state.product.title} | نی نگار`,
                description: state.product.desc?.substring(0, 160) || "توضیحات محصول",
                url: `https://neynegar1.ir/product/${id}`,
                type: 'website',
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 600,
                        alt: state.product.title,
                    },
                ],
                siteName: 'نی نگار',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${state.product.title} | نی نگار`,
                description: state.product.desc?.substring(0, 160) || "توضیحات محصول",
                images: [imageUrl],
            },
            // بهبود ۵: اضافه کردن metadataهای اضافی
            keywords: [
                state.product.title,
                state.product.majorCat,
                state.product.minorCat,
                ...(state.product.brand ? [state.product.brand] : []),
                ...(state.product.publisher ? [state.product.publisher] : []),
            ].filter(Boolean),
            other: {
                'product:price:amount': price.toString(),
                'product:price:currency': 'IRR',
                'product:availability': state.product.showCount > 0 ? 'in stock' : 'out of stock',
            },
        };
    } catch (error) {
        // بهبود ۶: fallback metadata در صورت خطا
        console.error('Error generating metadata:', error);
        return {
            title: 'محصول | فروشگاه اینترنتی نی نگار',
            description: 'صفحه محصولات فروشگاه اینترنتی نی نگار',
        };
    }
}

async function Product({ params, searchParams }: any) {
    const { id } = await params;
    const { img } = await searchParams;
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    const getRatingText = (val: number) => {
        if (val <= 0.5) return 'ضعیف';
        if (val <= 1) return '+ ضعیف';
        if (val <= 1.5) return 'متوسط';
        if (val <= 2) return '+ متوسط';
        if (val <= 2.5) return 'خوب';
        if (val <= 3) return '+ خوب';
        if (val <= 3.5) return 'خیلی‌خوب';
        if (val <= 4) return '+ خیلی‌خوب';
        if (val <= 4.5) return 'عالی';
        return '+ عالی';
    };


    const productGraphData = await fetchWithRetry(
        `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
              query GetProduct($id: ID!) {
                product(id: $id) {
                 _id
                  title
                  desc
                  price {
                    price
                    date
                  }
                  cost {
                    cost
                    date
                  }
                  discount {
                    discount
                    date
                  }
                  count
                  showCount
                  totalSell
                  popularity
                  authorId {
                    _id
                    firstname
                    lastname
                  }
                  authorArticleId {
                    _id
                    title
                    desc
                  }
                  publisherArticleId {
                    _id
                    title
                    desc
                  }
                  productArticleId {
                    _id
                    title
                    desc
                  }
                  publisher
                  publishDate
                  brand
                  status
                  size
                  weight
                  majorCat
                  minorCat
                  cover
                  images
                  createdAt
                  updatedAt
                }
              }
            `,
                variables: { id }
            }),
            next: { revalidate: 3600 }
        }
    );

    const commentsGraphData = await fetchWithRetry(
        `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    query CommentsByProduct($id: ID!) {
                        commentsByProduct(productId: $id) {
                            _id
                            txt
                            star
                            status
                            like
                            productId { _id }
                            articleId { _id }
                            userId {
                                _id
                                name
                                email
                                phone
                            }
                            createdAt
                            updatedAt
                            replies {
                                txt
                                userId {
                                    _id
                                    name
                                    email
                                    phone
                                }
                                like
                            }
                        }
                    }

                `,
                variables: { id }
            }),
            cache: "no-store"
        }
    );

    const stateGraph = await productGraphData.json()
    const commentsGraph = await commentsGraphData.json()
    const state: productType = { product: stateGraph.data.product, comments: commentsGraph.data.commentsByProduct }

    // Fetch user verification status
    const userData = jwt?.value ? await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
        method: "POST",
        headers: {
            'authorization': jwt?.value as string,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                query {
                    userByToken {
                        name
                        status
                    }
                }
            `
        }),
        next: { revalidate: 3600 }
    }).then(data => data.json()) : undefined

    const ban: boolean = jwt ? userData.data.userByToken.status == "banUser" : false

    // Fetch suggested products
    const sugData = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                  query GetSuggestedProducts($majorCat: String!, $minorCat: String) {
                    suggestedProducts(majorCat: $majorCat, minorCat: $minorCat) {
                      _id
                      title
                      desc
                      price {
                        price
                      }
                      discount {
                        discount
                        date
                      }
                      popularity
                      cover
                      majorCat
                      minorCat
                      showCount
                    }
                  }
                `,
            variables: {
                majorCat: state.product.majorCat,
                minorCat: state.product.minorCat
            }
        }),
        next: { revalidate: 3600 }
    }).then(data => data.json())

    const sugProduct: productCoverType = sugData.data.suggestedProducts
    const filSugProduct = sugProduct.filter(s => (
        s._id !== id
    ))

    // استفاده در کامپوننت
    const price = calculatePrice(state.product);

    return (
        <>
            <div className="sm:w-[85vw] w-[98vw] mx-auto mt-32 relative px-2">
                {/* Fixed buy button for mobile */}
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 shadow-css sm:hidden w-full bg-slate-200 rounded-t-2xl p-4 text-center z-50">
                    <BuyBtn
                        id={id}
                        showCount={state.product.showCount}
                        fix
                        cat={`${state.product.majorCat}/${state.product.minorCat}`}
                        price={price.toLocaleString('fa-IR')}
                    />
                </div>

                {/* Breadcrumb navigation */}
                <nav aria-label="breadcrumb" className="col-start-1 col-end-3 row-start-1 row-end-2 bg-slate-200 rounded-xl py-3 px-4 flex justify-start items-center gap-4 font-medium">
                    {state?.product && (
                        <>
                            <Link href="/" className="relative pl-6 flex items-center" aria-label="خانه">
                                <HomeRoundedIcon />
                                <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                                    <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                                </span>
                            </Link>
                            <Link href={`/category/${state.product.majorCat}`} className="relative pl-6">
                                <p className="line-clamp-1">
                                    {state.product.majorCat}
                                </p>
                                <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                                    <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                                </span>
                            </Link>
                            <Link href={`/category/${state.product.majorCat}/${state.product.minorCat}`} className="relative pl-6">
                                <p className="line-clamp-1">
                                    {state.product.minorCat}
                                </p>
                                <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                                    <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                                </span>
                            </Link>
                            <p className="line-clamp-1" aria-current="page">{state.product.title}</p>
                        </>
                    )}
                </nav>

                {/* Product section */}
                <section className="grid gap-10 mb-10 grid-cols-2">
                    {/* Product images */}
                    <div className="col-start-1 lg:col-end-2 col-end-3 row-start-2 lg:row-end-4 row-end-3 w-full bg-slate-200 rounded-xl pt-10 pb-4 px-4 flex flex-col justify-between">
                        <div className="lg:block md:flex block gap-8">
                            <div className="rounded-xl overflow-hidden py-6 pl-6 pr-12 shadow-cs bg-white relative w-fit mx-auto lg:mb-0 md:mb-4">
                                {state.product.discount[state.product.discount.length - 1].discount > 0 &&
                                    state.product.discount[state.product.discount.length - 1].date > Date.now() && (
                                        <DiscountTimer endDate={state.product.discount[state.product.discount.length - 1].date} page/>
                                    )}
                                {state?.product?.cover ? (
                                    <Image
                                        src={`https://api.neynegar1.ir/imgs/${img || state.product.cover}`}
                                        alt={state.product.title}
                                        className="bg-contain rounded-xl transition-transform duration-300 hover:scale-135 active:scale-135"
                                        width={300}
                                        height={300}
                                        priority
                                    />
                                ) : (
                                    <div className="md:w-[288px] w-[200px] md:h-[384px] h-[300px] rounded-lg overflow-hidden">
                                        <Skeleton variant="rectangular" className='rounded-lg' width={288} height={384} />
                                    </div>
                                )}

                                <ImgBtn id={id} />
                            </div>
                            <div className="w-fit mx-auto flex flex-col justify-between">
                                <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hidden mt-8 bg-white shadow-cs p-2 rounded-xl h-fit">
                                    {state?.product && (
                                        <Link href={`?img=${state.product.cover}`} scroll={false} aria-label="تصویر اصلی محصول">
                                            <Image
                                                src={`https://api.neynegar1.ir/imgs/${state.product.cover}`}
                                                alt={state.product.title}
                                                className="w-20 h-22 bg-contain cursor-pointer rounded-lg transition-transform duration-300 hover:scale-110 active:scale-110"
                                                loading='lazy'
                                                width={80}
                                                height={88}
                                            />
                                        </Link>
                                    )}
                                    {state?.product?.imgs?.split(",").map((i: string) => (
                                        <Link
                                            href={`?img=${i}`}
                                            scroll={false}
                                            key={i}
                                            aria-label="تصویر محصول"
                                            className={i.length <= 0 ? "hidden" : ""}
                                        >
                                            <Image
                                                src={`https://api.neynegar1.ir/imgs/${i}`}
                                                alt={state.product?.title || "تصویر محصول"}
                                                className="w-20 h-22 bg-contain cursor-pointer rounded-lg transition-transform duration-300 hover:scale-110 active:scale-110"
                                                loading='lazy'
                                                width={80}
                                                height={88}
                                            />
                                        </Link>
                                    ))}
                                </div>
                                <div className="w-[90%] text-center mx-auto mt-12 mb-8 lg:hidden md:block hidden">
                                    <p>
                                        در صورت هرگونه سوال در مورد این محصول <br />با ما تماس بگیرید 🙌
                                    </p>
                                    <ContactModal />
                                </div>
                            </div>
                        </div>

                        <div className="w-[90%] text-center mx-auto mt-12 mb-4 lg:block md:hidden">
                            <p>
                                در صورت هرگونه سوال در مورد این محصول <br />با ما تماس بگیرید 🙌
                            </p>
                            <ContactModal />
                        </div>
                    </div>

                    {/* Product details */}
                    <div className="lg:col-start-2 col-start-1 col-end-3 lg:row-start-2 lg:row-end-3 row-start-3 row-end-4 w-full bg-slate-200 rounded-xl pt-10 pb-4 px-4 flex flex-col justify-between">
                        <div>
                            <h1 className="text-xl text-slate-800">
                                {state?.product?.title || (
                                    <Skeleton variant="text" width={150} height={45} />
                                )}
                            </h1>
                            <div className="mt-4">
                                <p className="text-lg whitespace-pre-line">
                                    {state?.product?.desc || (
                                        <Skeleton variant="text" width={350} height={35} />
                                    )}
                                </p>
                                <p className="leading-8 mt-2">
                                    {state?.product ? (
                                        state.product.majorCat === "کتاب" ?
                                            `انتشارات: ${state.product.publisher}` :
                                            `مدل: ${state.product.brand}`
                                    ) : (
                                        <Skeleton variant="text" width={250} />
                                    )}
                                </p>
                                <p className="leading-8">
                                    {state?.product ? (
                                        state.product.majorCat === "کتاب" ?
                                            `نوبت چاپ: ${state.product.publishDate}` :
                                            state.product.color && `رنگ: ${state.product.color}`
                                    ) : (
                                        <Skeleton variant="text" width={250} />
                                    )}
                                </p>
                                <p className="leading-8">
                                    {state?.product ?
                                        `${state.product.majorCat === "کتاب" ? "قطع:" : "سایز:"} ${state.product.size}` :
                                        <Skeleton variant="text" width={250} />
                                    }
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="border-slate-200 mt-7 bg-white outline-white py-4 px-6 outline-[4px] border-2 border-solid rounded-xl grid gap-6 items-center justify-between">
                                {state?.product ? (
                                    <div className="flex gap-4 col-start-2 col-end-3 row-start-1" dir="ltr">
                                        <Rating
                                            name="product-rating"
                                            value={state.product.popularity}
                                            precision={0.5}
                                            emptyIcon={<StarBorderRoundedIcon fontSize="inherit" />}
                                            icon={<StarRoundedIcon fontSize="inherit" />}
                                            readOnly
                                        />
                                        <p className="sm:block hidden">{getRatingText(state.product.popularity)}</p>
                                    </div>
                                ) : (
                                    <Skeleton variant="rectangular" className="rounded-md col-start-2 col-end-3 row-start-1" width={150} height={30} />
                                )}
                                {state?.product ? (
                                    <p className="col-start-1 col-end-2 row-start-1">
                                        موجودی:
                                        <span className={`text-lg text-nowrap ${state.product.showCount == 0 && "text-red-700 bg-red-200 p-1 rounded-md text-base mr-1"}`}>
                                            {state.product.showCount > 0 ?
                                                ` ${state.product.showCount.toLocaleString('fa-IR')} عدد` :
                                                `ناموجود`}
                                        </span>
                                    </p>
                                ) : (
                                    <Skeleton variant="rectangular" className="rounded-md col-start-1 col-end-2 row-start-1" width={150} height={30} />
                                )}

                                {state?.product ? (
                                    <p className="col-start-2 col-end-3 row-start-2 place-self-center">
                                        وضعیت: <span className="text-lg text-nowrap">{state.product.status}</span>
                                    </p>
                                ) : (
                                    <Skeleton variant="rectangular" className="rounded-md col-start-2 col-end-3 row-start-2" width={150} height={30} />
                                )}
                                {state?.product ? (
                                    <div className="col-start-1 col-end-2 row-start-2">
                                        <p className={`${state.product.discount[state.product.discount.length - 1].discount > 0 && state.product.discount[state.product.discount.length - 1].date > Date.now() ? 'block' : 'hidden'} line-through text-gray-500 text-sm leading-3`}>
                                            {state.product.price[state.product.price.length - 1].price.toLocaleString('fa-IR')}
                                        </p>
                                        <h2 className="text-xl leading-3">
                                            {price.toLocaleString('fa-IR')}
                                            <span className="text-base"> تومان</span>
                                        </h2>
                                    </div>
                                ) : (
                                    <Skeleton variant="rectangular" className="rounded-md col-start-1 col-end-2 row-start-2" width={150} height={30} />
                                )}
                            </div>
                            <BuyBtn id={id} showCount={state.product.showCount} cat={state.product.majorCat} />
                        </div>
                    </div>

                    {/* Product specifications */}
                    <div className="lg:col-start-2 col-start-1 col-end-3 lg:row-start-3 lg:row-end-4 row-start-4 row-end-5 w-full relative bg-slate-200 rounded-xl pt-9 pb-4 px-6">
                        <h2 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                            مشخصات
                        </h2>

                        <div className="mt-10">
                            <Accordion defaultExpanded>
                                <div className="bg-white text-slate-800">
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id="panel1-header"
                                    >
                                        در باب محصول
                                    </AccordionSummary>
                                </div>
                                <div className="bg-white">
                                    <AccordionDetails>
                                        {state?.product ? (
                                            <p className="line-clamp-2">
                                                {state.product.productArticleId ? (
                                                    state.product.productArticleId.desc
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        مقاله‌ای در این باب موجود نمی‌باشد.
                                                        <SentimentDissatisfiedTwoToneIcon />
                                                    </span>
                                                )}
                                            </p>
                                        ) : (
                                            <>
                                                <Skeleton variant="text" className="rounded-md" />
                                                <Skeleton variant="text" className="rounded-md" width={250} />
                                            </>
                                        )}
                                    </AccordionDetails>
                                </div>
                                {state?.product?.productArticleId && (
                                    <div className="dark:bg-slate-400">
                                        <AccordionActions>
                                            <Link
                                                href={`/article/${state.product.productArticleId._id}`}
                                                className="flex items-center gap-x-1.5 cursor-pointer text-sm text-sky-600 dark:text-white"
                                            >
                                                مشاهده مقاله
                                                <div className="dark:text-slate-600">
                                                    <KeyboardBackspaceRoundedIcon fontSize="small" />
                                                </div>
                                            </Link>
                                        </AccordionActions>
                                    </div>
                                )}
                            </Accordion>
                            <Accordion>
                                <div className="bg-white text-slate-800">
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel2-content"
                                        id="panel2-header"
                                    >
                                        در باب نویسنده
                                    </AccordionSummary>
                                </div>
                                <div className="bg-white">
                                    <AccordionDetails>
                                        {state?.product ? (
                                            <p className="line-clamp-2">
                                                {state.product.authorArticleId ? (
                                                    state.product.authorArticleId.desc
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        مقاله‌ای در این باب موجود نمی‌باشد.
                                                        <SentimentDissatisfiedTwoToneIcon />
                                                    </span>
                                                )}
                                            </p>
                                        ) : (
                                            <>
                                                <Skeleton variant="text" className="rounded-md" />
                                                <Skeleton variant="text" className="rounded-md" width={250} />
                                            </>
                                        )}
                                    </AccordionDetails>
                                </div>
                                {state?.product?.authorArticleId && (
                                    <div className="dark:bg-slate-400">
                                        <AccordionActions>
                                            <Link
                                                href={`/article/${state.product.authorArticleId._id}`}
                                                className="flex items-center gap-x-1.5 text-sm cursor-pointer text-sky-600 dark:text-white"
                                            >
                                                مشاهده مقاله
                                                <div className="dark:text-slate-600">
                                                    <KeyboardBackspaceRoundedIcon fontSize="small" />
                                                </div>
                                            </Link>
                                        </AccordionActions>
                                    </div>
                                )}
                            </Accordion>
                            <Accordion>
                                <div className="bg-white text-slate-800">
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel3-content"
                                        id="panel3-header"
                                    >
                                        در باب انتشارات
                                    </AccordionSummary>
                                </div>
                                <div className="bg-white">
                                    <AccordionDetails>
                                        {state?.product ? (
                                            <p className="line-clamp-2">
                                                {state.product.publisherArticleId ? (
                                                    state.product.publisherArticleId.desc
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        مقاله‌ای در این باب موجود نمی‌باشد.
                                                        <SentimentDissatisfiedTwoToneIcon />
                                                    </span>
                                                )}
                                            </p>
                                        ) : (
                                            <>
                                                <Skeleton variant="text" className="rounded-md" />
                                                <Skeleton variant="text" className="rounded-md" width={250} />
                                            </>
                                        )}
                                    </AccordionDetails>
                                </div>
                                {state?.product?.publisherArticleId && (
                                    <div className="dark:bg-slate-400">
                                        <AccordionActions>
                                            <Link
                                                href={`/article/${state.product.publisherArticleId._id}`}
                                                className="flex items-center gap-x-1.5 text-sm cursor-pointer text-sky-600 dark:text-white"
                                            >
                                                مشاهده مقاله
                                                <div className="dark:text-slate-600">
                                                    <KeyboardBackspaceRoundedIcon fontSize="small" />
                                                </div>
                                            </Link>
                                        </AccordionActions>
                                    </div>
                                )}
                            </Accordion>
                        </div>
                    </div>
                </section>

                {/* Additional sections */}
                <section className="grid gap-10 mb-10 grid-cols-2">
                    {/* Suggested products */}
                    <div className="relative bg-slate-200 rounded-xl pt-10 pb-4 px-4 col-start-1 lg:col-end-2 col-end-3 row-start-1 row-end-2">
                        <h2 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white h-fit">
                            محصولات مشابه
                        </h2>
                        {state?.product && filSugProduct && filSugProduct.length > 0 ? (
                            <div className="w-[90%] lg:w-[60%] md:w-full mx-auto mt-4">
                                <Box books={filSugProduct.slice(0, 10)} />
                            </div>
                        ) : (
                            <p className="text-center flex items-center gap-2 mt-4 mb-4 justify-center w-full h-full">
                                محصول مشابه محصول مورد نظر یافت نشد.
                                <SentimentDissatisfiedTwoToneIcon />
                            </p>
                        )}
                    </div>

                    <CommentComplex
                        ban={Boolean(userData?.data?.userByToken?.name && ban)}
                        comments={state?.comments?.reverse() || []}
                        id={id}
                    />
                </section>

                {/* Product description boxes */}
                <div className="flex justify-center items-center flex-wrap sm:gap-8 gap-10 mt-20 text-center">
                    <DescProductBoxes />
                </div>

                {/* Toast notifications */}
                <ToastContainer
                    position="bottom-left"
                    autoClose={5000}
                    limit={2}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick={false}
                    rtl={true}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    transition={Bounce}
                />
            </div>
        </>
    );
}

export default Product;