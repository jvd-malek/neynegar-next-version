"use client"
import { getCookie, setCookie } from 'cookies-next';
import { useState } from 'react';
import Link from 'next/link';
import { notify } from '@/lib/utils/notify';
import { fetcher } from '@/lib/fetcher';
import { mutate } from 'swr';
import ContactModal from './ContactModal';

type BasketItem = {
    productId: string;
    count: number;
    showCount: number;
};

function BuyBtn({ showCount, id, fix = false, cat, price, state }: { showCount: number; fix?: boolean; id: string, cat: string, price?: string, state: string }) {
    const jwt = getCookie('jwt');
    const [isLoading, setIsLoading] = useState(false);

    const handleNotificationAndFavorite = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!jwt) {
            notify("لطفا ابتدا وارد حساب کاربری خود شوید.", 'error');
            setIsLoading(false);
            return;
        }

        try {
            // 1. تغییر وضعیت کاربر به notifUser
            await fetcher(`
                mutation UpdateUserStatus($status: String!) {
                    updateUserStatus(status: $status) {
                        _id
                        status
                    }
                }
            `, { status: "notifUser" });

            // 2. افزودن محصول به علاقه‌مندی‌ها
            await fetcher(`
                mutation AddToFavorite($productId: ID!) {
                    addToFavorite(productId: $productId) {
                        _id
                        favorite { productId { _id title } }
                    }
                }
            `, { productId: id });

            notify("اعلان محصولات برای شما فعال شد.", 'success');
        } catch (error) {
            console.error("Error in notification handler:", error);
            notify("خطا در فعال سازی اعلان محصول", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getBasketFromCookies = (): BasketItem[] => {
        try {
            const basketCookie = getCookie('basket');
            return basketCookie ? JSON.parse(basketCookie.toString()) : [];
        } catch (error) {
            console.error("Error parsing basket cookie:", error);
            return [];
        }
    };

    const updateBasketCookie = (basket: BasketItem[]): void => {
        setCookie('basket', JSON.stringify(basket), {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });
    };

    const updateServerBasket = async (basketItem: BasketItem): Promise<void> => {
        try {
            const res = await fetcher(`
                mutation AddToBasket($productId: ID!, $count: Int!) {
                    addToBasket(productId: $productId, count: $count) {
                        _id
                        bascket {
                            productId { _id title showCount }
                            count
                        }
                    }
                }
            `, { productId: basketItem.productId, count: basketItem.count });

            if (!res || !res.addToBasket) {
                notify("خطا در افزودن به سبد خرید", 'error');
            } else {
                notify("این محصول به سبد خرید شما اضافه شد", 'success');
                mutate(["userByToken"])
            }
        } catch (error) {
            console.error("Server basket error:", error);
            const message = error instanceof Error ? error.message : "خطا در اضافه کردن به سبد خرید";
            notify(message, 'error');
        }
    };

    const updateLocalBasket = (basketItem: BasketItem): void => {
        const currentBasket = getBasketFromCookies();
        const existingItemIndex = currentBasket.findIndex(item => item.productId === id);

        if (existingItemIndex >= 0) {
            if (currentBasket[existingItemIndex].count < showCount) {
                currentBasket[existingItemIndex].count += 1;
            } else {
                notify("این محصول در حال حاضر موجود نیست", 'error');
            }
        } else {
            currentBasket.push(basketItem);
        }

        updateBasketCookie(currentBasket);
        notify("این محصول به سبد خرید شما اضافه شد", 'success');
    };

    const handleAddToBasket = async (): Promise<void> => {
        if (isLoading) return;
        setIsLoading(true);

        if (showCount <= 0) {
            notify("این محصول در حال حاضر موجود نیست", 'error');
            setIsLoading(false);
            return;
        }

        const basketItem: BasketItem = { productId: id, count: 1, showCount };

        try {
            if (jwt) {
                await updateServerBasket(basketItem);
            } else {
                updateLocalBasket(basketItem);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const buttonText = showCount > 0 ? "افزودن به سبد خرید" : "ناموجود";
    const buttonClass = `
    transition-all duration-200 
    py-2 w-full rounded-lg text-white font-medium
    ${!fix && "mt-4"}
    ${isLoading ? 'opacity-80 cursor-wait' : ''}
    ${showCount > 0 ? 'active:translate-y-1 border-b-4 border-solid border-slate-700 hover:bg-slate-900 active:border-slate-200 bg-black' : 'opacity-80 bg-red-600'}
  `;

    return (
        <div className={`relative group`}>

            {showCount > 0 && fix && (
                <div className="my-1.5 flex gap-2">
                    <p
                        className="w-full bg-black hover:bg-slate-900 text-white py-1 rounded-lg text-sm"
                    >
                        {state === "callForPrice" ? "تماس بگیرید" : price}
                        {state === "callForPrice" ? "" : <span className="text-base"> تومان</span>} 
                    </p>
                    <Link
                        href={`/category/${cat}`}
                        className="w-full bg-gray-300 text-slate-800 py-1 rounded-lg text-sm text-center"
                    >
                        محصولات مشابه
                    </Link>
                </div>
            )}

            {state === "callForPrice" ? 
            !fix && (
                <ContactModal/>
            )
            :
            (
            <button
                className={buttonClass}
                onClick={() => showCount > 0 && handleAddToBasket()}
                aria-label={buttonText}
                aria-busy={isLoading}
                aria-live="polite"
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-4 whitespace-nowrap text-white w-full">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        در حال پردازش...
                    </span>
                ) : (
                    buttonText
                )}
            </button>
            )}
            <span className="
        absolute -top-8 left-1/2 -translate-x-1/2
        bg-gray-800 text-white text-xs py-1 px-2 rounded
        opacity-0 group-hover:opacity-100 transition-opacity
        pointer-events-none whitespace-nowrap
      ">
                {showCount > 0 ? `${showCount} عدد در انبار` : 'ناموجود'}
            </span>

            {showCount <= 0 && (
                <div className="mt-2 flex gap-2">
                    <button
                        onClick={handleNotificationAndFavorite}
                        className="w-full bg-black hover:bg-slate-900 text-white py-2 rounded-lg text-sm"
                        disabled={isLoading}
                    >
                        خبرم کن
                    </button>
                    <Link
                        href={`/category/${cat}`}
                        className="w-full sm:bg-gray-200 bg-gray-300 sm:hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm text-center"
                    >
                        محصولات مشابه
                    </Link>
                </div>
            )}
        </div>
    );
}

export default BuyBtn;