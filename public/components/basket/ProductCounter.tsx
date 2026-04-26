"use client"

// next and react
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

// utils
import { getBasketFromCookies, updateBasketCookie } from "@/public/utils/product/ProductBoxUtils"
import { fetcher } from "@/public/utils/fetcher"
import { notify } from "@/public/utils/notify"
import { mutate } from "swr"

// icons
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded"

// queries
import { PUSH_PACKAGE_TO_BASKET, PUSH_PRODUCT_TO_BASKET, PULL_PACKAGE_FROM_BASKET, PULL_PRODUCT_FROM_BASKET } from "@/public/graphql/basketQueries"

type ProductCounterProps = {
    _id: string
    count: number
    showCount: number
    isLogin: boolean
    isPackage: boolean
}

type BasketItem = {
    productId: string | undefined;
    packageId: string | undefined;
    count: number;
    showCount: number;
}


const ProductCounter = ({ count, showCount, isLogin, _id, isPackage }: ProductCounterProps) => {
    const router = useRouter();
    const [Count, setCount] = useState(count)
    const disabled = showCount == Count

    useEffect(() => {
        setCount(count)
    }, [count])

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
                setCount(Count + 1);
            } else {
                notify("موجودی محصول محدود است", "warn");
            }
        } else {
            currentBasket.push(newItem);
        }

        updateBasketCookie(currentBasket);
        router.refresh();
    }

    const removeLocalBascket = async () => {
        const currentBasket = getBasketFromCookies();
        const existingItemIndex = currentBasket.findIndex(item => {
            if (isPackage) {
                return item.packageId == _id
            }

            return item.productId == _id
        });

        if (existingItemIndex >= 0) {

            currentBasket[existingItemIndex].count -= 1;

            if (currentBasket[existingItemIndex].count == 0) {
                currentBasket.splice(existingItemIndex, 1)
            }

            updateBasketCookie(currentBasket);
            setCount(Count - 1);
        }
    }

    const pushHandler = async () => {
        if (showCount > Count) {
            if (isLogin) {
                const query = isPackage ? PUSH_PACKAGE_TO_BASKET : PUSH_PRODUCT_TO_BASKET
                const variable = isPackage ? { packageId: _id, count: 1 } : { productId: _id, count: 1 }
                try {
                    await fetcher(query, variable);
                    router.refresh()
                    setCount(Count + 1);
                    mutate(["userByToken"])
                } catch (error) {
                    notify("خطا در ارتباط با سرور", "error");
                }
            } else {
                await addLocalBascket();
            }
        } else {
            notify("موجودی محصول محدود است", "warn");
        }
    }

    const pullHandler = async () => {
        if (isLogin) {
            try {
                const query = isPackage ? PULL_PACKAGE_FROM_BASKET : PULL_PRODUCT_FROM_BASKET
                const variable = isPackage ? { packageId: _id, count: 1 } : { productId: _id, count: 1 }
                await fetcher(query, variable);
                router.refresh()
                setCount(Count - 1);
                mutate(["userByToken"])
            } catch (error) {
                notify("موجودی محصول محدود است", "warn");
            }
        } else {
            await removeLocalBascket();
            router.refresh()
        }
    }

    return (
        <div className="flex items-center gap-2 w-fit ">
            <button
                onClick={() => pushHandler()}
                className={`${disabled ? "bg-mist-100 cursor-not-allowed text-mist-700" : "bg-red-100 cursor-pointer text-red-700"} px-2 pt-0.5 rounded-lg font-bold text-xl`}>
                +
            </button>
            <p className="">
                {Count}
            </p>
            <button
                onClick={() => pullHandler()}
                className="bg-red-100 cursor-pointer text-red-700 px-2 pt-0.5 rounded-lg font-bold text-xl">
                {Count == 1 ? <DeleteOutlineRounded fontSize="small" /> : "-"}
            </button>
        </div>
    );
}

export default ProductCounter;