// next and react
import Image from "next/image";
import Link from 'next/link';

// components
import { calculateFinalPrice } from '@/public/utils/product/ProductUtils';
import { customLoader } from "@/public/utils/product/ProductBoxUtils";

// icons
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AddToBasketButton from "@/public/components/product-boxes/addToBasketButton";

type ProductBoxType = {
    discountTimer?: boolean;
    title: string;
    desc: string;
    _id: string;
    popularity: number;
    totalPrice?: number;
    totalProducts?: number;
    cover: string;
    showCount: number;
    state?: string;
    isPackage?: boolean;
    price: { price: number, date: string }[];
    discount: { discount: number, date: number }[];
    finalPrice?: number;
}

function ProductBox({
    isPackage = false,
    title,
    desc,
    price,
    discount,
    _id,
    popularity,
    cover,
    totalPrice,
    totalProducts,
    finalPrice,
    showCount,
    state = "active"
}: ProductBoxType) {

    const finalValidPrice = calculateFinalPrice({ isPackage, finalPrice, price, discount });
    const lastDiscount = discount?.at(-1)
    const lastPrice = price?.at(-1)?.price || 0
    const isDiscountValid = lastDiscount && lastDiscount.discount > 0 && lastDiscount.date > Date.now()

    return (
        <div
            className={`flex relative flex-col max-w-60 lg:max-w-50 min-w-40 mx-auto overflow-hidden rounded-lg bg-white shadow-md`}
            itemScope
            itemType="https://schema.org/Product"
        >
            <meta itemProp="name" content={`${title}، ${desc}`} />
            <meta itemProp="price" content={finalValidPrice.toString()} />
            <meta itemProp="priceCurrency" content="IRR" />

            <div className="relative group" dir='ltr'>
                <Link href={isPackage ? `/package/${_id}` : `/product/${_id}`} className="block">
                    {cover ? (
                        <Image
                            src={cover}
                            alt={`تصویر محصول ${title}`}
                            className="rounded-t-lg object-cover transition-transform duration-300 hover:scale-110 active:scale-110"
                            width={500}
                            height={500}
                            quality={75}
                            loading="lazy"
                            loader={customLoader}
                            itemProp="image"
                        />
                    ) : (
                        <div className="animate-pulse bg-gray-300 rounded w-full h-full max-h-72 min-h-38"></div>
                    )}
                </Link>

                {showCount > 0 && state !== "callForPrice" && (
                    <AddToBasketButton title={title} _id={_id} showCount={showCount} isPackage={isPackage} />
                )}
            </div>

            {isDiscountValid && (
                <div className="absolute -top-1.5 right-1 z-20 text-red-600">
                    <BookmarkIcon sx={{ fontSize: 40 }} />
                    <p className="absolute text-xs right-2.5 top-3 text-white">
                        {`%${lastDiscount && lastDiscount.discount.toLocaleString('fa-IR')}`}
                    </p>
                </div>
            )}

            <div className="p-2 pt-3 grow gap-2 border-b border-b-mist-300/90 h-16">
                <h3 className="text-base font-semibold line-clamp-2" itemProp="name">
                    {title}
                </h3>
            </div>

            <div className="flex items-end justify-between p-1.5 h-12">
                {isPackage ?
                    <span className="flex items-center md:gap-x-1.5 gap-x-0.5">
                        <div>
                            📚
                        </div>
                        {totalProducts?.toLocaleString('fa-IR')}
                    </span>
                    :
                    <span className="flex items-center md:gap-x-1.5 gap-x-0.5">
                        <div className="text-yellow-400 mb-0.75">
                            <StarRoundedIcon />
                        </div>
                        {popularity.toLocaleString('fa-IR')}
                    </span>
                }

                {showCount > 0 && state != "callForPrice" ? (
                    <div className="flex justify-center items-center md:gap-2 gap-1">
                        <div className="flex flex-col items-start">
                            {isDiscountValid && (
                                <span className="text-xs line-through text-mist-600">
                                    {isPackage ? ((totalPrice || 0)).toLocaleString('fa-IR') : lastPrice.toLocaleString('fa-IR')}
                                </span>
                            )}
                            <span className={`${isDiscountValid ? 'text-md leading-3' : 'text-lg space-x-1.5'} flex items-center gap-1 font-bold`}>
                                {finalValidPrice.toLocaleString('fa-IR')}
                                <p className="text-xs font-light">تومان</p>
                            </span>
                        </div>
                    </div>
                ) : (
                    <Link
                        href="tel:09934242315"
                        className="text-red-700 bg-red-200 px-2 py-1 rounded-md text-sm font-bold">{state === "callForPrice" ? "تماس بگیرید" : "ناموجود"}</Link>
                )}
            </div>
        </div>
    );
}

export default ProductBox;