"use client"
import { Bounce, toast } from 'react-toastify';
import { getCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

type BasketItem = {
    productId: string;
    count: number;
    showCount: number;
};

type UserUpdateBody = {
    status?: string;
    favorite?: Array<{ productId: string }>;
    basket?: BasketItem[];
};

function BuyBtn({ showCount, id, fix = false, cat, price }: { showCount: number; fix?: boolean; id: string, cat: string, price?: string }) {
    const jwt = getCookie('jwt');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const showNotification = (text: string, isSuccess: boolean) => {
        toast[isSuccess ? 'success' : 'error'](text, {
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
    };

    const handleNotificationAndFavorite = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!jwt) {
            showNotification("لطفا ابتدا وارد حساب کاربری خود شوید.", false);
            setIsLoading(false);
            return;
        }

        try {
            await updateUser({
                status: "notifUser",
                favorite: [{ productId: id }]
            });
            showNotification("اعلان محصولات برای شما فعال شد.", true);
        } catch (error) {
            console.error("Error in notification handler:", error);
            showNotification("خطا در فعال سازی اعلان محصول", false);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (body: UserUpdateBody): Promise<void> => {
        if (!jwt) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/user`, {
                method: "PUT",
                headers: {
                    'authorization': jwt as string,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!data.success) {
                console.error("Update error:", data.msg);
                showNotification(data.msg, false);

                if (data.msg.includes("token")) {
                    router.push('/login');
                }
                throw new Error(data.msg);
            }
            
        } catch (error) {
            console.error("Update user error:", error);
            throw error;
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
            await updateUser({
                basket: [basketItem],
            });

            showNotification("این محصول به سبد خرید شما اضافه شد", true);
        } catch (error) {
            console.error("Server basket error:", error);
            const message = error instanceof Error ? error.message : "خطا در اضافه کردن به سبد خرید";
            showNotification(message, false);

            if (message.includes("token")) {
                router.push('/login');
            }
        }
    };

    const updateLocalBasket = (basketItem: BasketItem): void => {
        const currentBasket = getBasketFromCookies();
        const existingItemIndex = currentBasket.findIndex(item => item.productId === id);

        if (existingItemIndex >= 0) {
            if (currentBasket[existingItemIndex].count < showCount) {
                currentBasket[existingItemIndex].count += 1;
            } else {
                showNotification("این محصول در حال حاضر موجود نیست", false);
            }
        } else {
            currentBasket.push(basketItem);
        }

        updateBasketCookie(currentBasket);
        showNotification("این محصول به سبد خرید شما اضافه شد", true);
    };

    const handleAddToBasket = async (): Promise<void> => {
        if (isLoading) return;
        setIsLoading(true);

        if (showCount <= 0) {
            showNotification("این محصول در حال حاضر موجود نیست", false);
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
    py-2.5 w-full rounded-lg text-white font-medium
    ${!fix && "mt-4"}
    ${isLoading ? 'opacity-80 cursor-wait' : ''}
    ${showCount > 0 ? 'active:translate-y-1 border-b-4 border-solid border-slate-700 hover:bg-slate-900 active:border-slate-200 bg-black' : 'opacity-80 bg-red-600'}
  `;

    return (
        <div className="relative group">

            {showCount > 0 && fix && (
                <div className="my-2 flex gap-2">
                    <p
                        className="w-full bg-black hover:bg-slate-900 text-white py-2 rounded-lg text-sm"
                    >
                        {price}
                        <span className="text-base"> تومان</span>
                    </p>
                    <Link
                        href={`/category/${cat}`}
                        className="w-full bg-gray-300 text-slate-800 py-2 rounded-lg text-sm text-center"
                    >
                        محصولات مشابه
                    </Link>
                </div>
            )}

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