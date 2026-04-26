"use client";

// next and react
import { useRouter } from 'next/navigation';

// utils
import { notify } from '@/public/utils/notify';
import { fetcher } from '@/public/utils/fetcher';
import { getCookie } from 'cookies-next';
import { mutate } from 'swr';

// components
import {
    updateBasketCookie,
    getBasketFromCookies
} from '@/public/utils/product/ProductBoxUtils';

// icons and queries
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { PUSH_PACKAGE_TO_BASKET, PUSH_PRODUCT_TO_BASKET } from '@/public/graphql/basketQueries';

type BasketItem = {
    productId?: string;
    packageId?: string;
    count: number;
    showCount: number;
}

type AddToBasketButtonProps = {
    _id: string,
    title: string,
    showCount: number
    isPackage: boolean
}

const AddToBasketButton = ({ title, showCount, _id, isPackage }: AddToBasketButtonProps) => {
    const jwt = getCookie('jwt');
    const router = useRouter();

    const addLocalBascket = async () => {
        const currentBasket = getBasketFromCookies();
        const existingItemIndex = currentBasket.findIndex(item => {
            if (isPackage) {
                return item.packageId == _id
            }

            return item.productId == _id
        });

        const productId = isPackage ? undefined : _id
        const packageId = isPackage ? _id : undefined
        const newItem: BasketItem = { productId, packageId, count: 1, showCount }

        if (existingItemIndex >= 0) {
            if (currentBasket[existingItemIndex].count < showCount) {
                currentBasket[existingItemIndex].count += 1;
            } else {
                notify("این محصول در حال حاضر موجود نیست", "warn");
            }
        } else {
            currentBasket.push(newItem);
        }

        updateBasketCookie(currentBasket);
        notify("این محصول به سبد خرید شما اضافه شد", "success");
        router.refresh();
    }

    const addToBasket = async () => {
        if (showCount <= 0) {
            notify("این محصول در حال حاضر موجود نیست", "error");
            return;
        }

        if (jwt) {
            const query = isPackage ? PUSH_PACKAGE_TO_BASKET : PUSH_PRODUCT_TO_BASKET
            const variable = isPackage ? { packageId: _id, count: 1 } : { productId: _id, count: 1 }
            try {
                await fetcher(query, variable);
                notify("این محصول به سبد خرید شما اضافه شد", "success");
                router.refresh()
                mutate(["userByToken"])
            } catch (error) {
                console.log(error);
                notify("خطا در ارتباط با سرور", "error");
            }
        } else {
            await addLocalBascket()
        }
    };

    return (
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
    );
}

export default AddToBasketButton;