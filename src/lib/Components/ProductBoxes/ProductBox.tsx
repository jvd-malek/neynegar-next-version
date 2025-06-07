"use client";
import Skeleton from '@mui/material/Skeleton';
import Image from "next/image";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import Link from 'next/link';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { Bounce, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie } from 'cookies-next';
import DiscountTimer from './DiscountTimer';

type ProductBoxType = {
    box?: boolean;
    discountTimer?: boolean;
    suggest?: boolean;
    title: string;
    desc: string;
    price: { price: number, date: string }[];
    discount: { discount: number, date: number }[];
    _id: string;
    popularity: number;
    cover: string;
    showCount: number;
}

type BasketItem = {
    productId: string;
    count: number;
    showCount: number;
}

function ProductBox({
    box = true,
    discountTimer = false,
    suggest = false,
    title,
    desc,
    price,
    discount,
    _id,
    popularity,
    cover,
    showCount,
}: ProductBoxType) {
    const jwt = getCookie('jwt');
    const router = useRouter();

    const customLoader = ({ src }: { src: string }) => {
        return `https://api.neynegar1.ir/imgs/${src}`;
    };

    const getBasketFromCookies = (): BasketItem[] => {
        const basketCookie = getCookie('basket');
        return basketCookie ? JSON.parse(basketCookie.toString()) : [];
    };

    const updateBasketCookie = (basket: BasketItem[]) => {
        setCookie('basket', JSON.stringify(basket), {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });
    };

    const addToBasket = async () => {
        if (showCount <= 0) {
            notify("این محصول در حال حاضر موجود نیست", false);
            return;
        }

        const basketItem: BasketItem = { productId: _id, count: 1, showCount };

        if (jwt) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/user`, {
                    method: "PUT",
                    headers: {
                        'authorization': jwt as string,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        basket: [basketItem]
                    })
                });

                const data = await response.json();

                if (!data.success) {
                    notify(data.msg, false);
                    if (data.msg.includes("token")) {
                        router.push('/login');
                    }
                } else {
                    notify("این محصول به سبد خرید شما اضافه شد", true);
                    router.refresh()
                }
            } catch (error) {
                console.log(error);

                notify("خطا در ارتباط با سرور", false);
            }
        } else {
            const currentBasket = getBasketFromCookies();
            const existingItemIndex = currentBasket.findIndex(item => item.productId === _id);

            if (existingItemIndex >= 0) {
                if (currentBasket[existingItemIndex].count < showCount) {
                    currentBasket[existingItemIndex].count += 1;
                } else {
                    notify("این محصول در حال حاضر موجود نیست", false);
                }
            } else {
                currentBasket.push(basketItem);
            }

            updateBasketCookie(currentBasket);
            notify("این محصول به سبد خرید شما اضافه شد", true);
            router.refresh();
        }
    };

    const notify = (txt: string, status: boolean) => {
        if (status) {
            toast.success(txt, {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        } else {
            toast.error(txt, {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }
    };

    const finalPrice = (discount[discount.length - 1].discount > 0 &&
        discount[discount.length - 1].date > Date.now())
        ? (price[price.length - 1].price * (100 - discount[discount.length - 1].discount) / 100)
        : price[price.length - 1].price;

    return (
        <div
            className={`flex relative flex-col max-w-60 lg:max-w-50 min-w-40 mx-auto overflow-hidden rounded-2xl text-black bg-white p-1.5 shadow ${box && !suggest && " lg:my-8 my-10"}`}
            itemScope
            itemType="https://schema.org/Product"
        >
            <meta itemProp="name" content={`${title}، ${desc}`} />
            <meta itemProp="price" content={finalPrice.toString()} />
            <meta itemProp="priceCurrency" content="IRR" />

            <div className="relative group" dir='ltr'>
                {discount[discount.length - 1].discount > 0 &&
                    discount[discount.length - 1].date > Date.now() && discountTimer && (
                        <DiscountTimer endDate={discount[discount.length - 1].date} />
                    )}
                <Link href={`/product/${_id}`} className="block">
                    {cover ? (
                        <Image
                            src={cover}
                            alt={`تصویر محصول ${title}`}
                            className="rounded-2xl object-cover transition-transform duration-300 hover:scale-110 active:scale-110"
                            width={500}
                            height={500}
                            loader={customLoader}
                            itemProp="image"
                        />
                    ) : (
                        <Skeleton variant="rectangular" className='rounded-lg' height={150} />
                    )}
                </Link>

                {showCount > 0 && (
                    <button
                        onClick={addToBasket}
                        className="absolute cursor-pointer text-xs bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 hover:bg-white px-2 py-1 rounded-lg shadow-md md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2"
                        aria-label={`افزودن ${title} به سبد خرید`}
                    >
                        <span className="text-sm">
                            <LocalMallIcon fontSize="inherit" />
                        </span>
                        <span className='line-clamp-1 whitespace-nowrap'>سبد خرید</span>
                    </button>
                )}
            </div>

            {discount[discount.length - 1].discount > 0 && showCount > 0 &&
                discount[discount.length - 1].date > Date.now() && (
                    <div className="absolute -top-[6px] right-1 z-20 text-red-600">
                        <BookmarkIcon sx={{ fontSize: 40 }} />
                        <p className="absolute text-xs right-[10px] top-3 text-white">
                            {`%${discount[discount.length - 1].discount.toLocaleString('fa-IR')}`}
                        </p>
                    </div>
                )}

            <div className="px-4 pt-2.5 pb-2 flex-grow border-b border-b-slate-100">
                <h3 className="text-sm h-10 line-clamp-2" itemProp="name">
                    {`${title}، ${desc}`}
                </h3>
            </div>

            <div className="flex items-end justify-between mt-1.5 py-1 px-1 bg-slate-100 rounded-b-lg">
                <span className="flex items-center md:gap-x-1.5 gap-x-0.5">
                    <div className="text-yellow-400 mb-[3px]">
                        <StarRoundedIcon />
                    </div>
                    {popularity.toLocaleString('fa-IR')}
                </span>

                {showCount > 0 ? (
                    <div className="flex justify-center items-center md:gap-2 gap-1">
                        <div className="flex flex-col items-start">
                            {discount[discount.length - 1].discount > 0 && discount[discount.length - 1].date > Date.now() && (
                                <span className="text-xs line-through text-slate-600">
                                    {price[price.length - 1].price.toLocaleString('fa-IR')}
                                </span>
                            )}
                            <span className={`${discount[discount.length - 1].discount > 0 && discount[discount.length - 1].date > Date.now() ? 'text-md leading-3' : 'text-lg space-x-1.5'}`}>
                                {finalPrice.toLocaleString('fa-IR')}
                            </span>
                        </div>
                        <p className="text-xs font-light">تومان</p>
                    </div>
                ) : (
                    <p className="text-red-700 bg-red-200 px-2 py-1 rounded-md text-sm font-semibold">ناموجود</p>
                )}
            </div>
        </div>
    );
}

export default ProductBox;