// next
import Link from "next/link";

// components
import ProductCounter from "@/public/components/basket/ProductCounter";

// types
import { UserBasket } from "@/public/types/user";

interface ProductsCartProps {
    Products: UserBasket[];
    total: number
    isLogin: boolean
}


function ProductsCart({ Products, total = 0, isLogin }: ProductsCartProps) {
    const products = [...Products]

    return (
        <>
            {products?.length > 0 ?
                <div className="mt-6 font-semibold bg-white rounded-lg p-2">
                    <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-4">
                        {products?.map((product, index) => {
                            const price = Number(product.currentPrice);
                            const discount = Number(product.currentDiscount);
                            const count = Number(product.count);
                            const finalPrice = price * (100 - discount) / 100 * count;
                            const isPackage = product.packageId ? true : false
                            const title = isPackage ? product.packageId.title : product.productId.title
                            const ID = isPackage ? product.packageId._id : product.productId._id
                            const cover = isPackage ? product.packageId.cover : product.productId.cover
                            const showCount = isPackage ? product.packageId.showCount : product.productId.showCount
                            return (
                                <div key={index} className="flex items-center gap-4 w-full border-b border-mist-300 pb-2">
                                    <div className="px-3 py-1.5">
                                        <img
                                            src={`https://api.neynegar1.ir/uploads/${cover}`}
                                            alt={title}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <div className="px-3 py-1.5">{title}</div>
                                        <div className="flex justify-between items-center">
                                            <div className="px-3 py-1.5">
                                                <ProductCounter
                                                    count={count}
                                                    isLogin={isLogin}
                                                    _id={ID}
                                                    showCount={showCount}
                                                    isPackage={isPackage}
                                                />
                                            </div>
                                            <div className="px-3 py-1.5">
                                                {discount ?
                                                    <p className={`line-through text-gray-500 text-sm leading-3`}>
                                                        {(price * count).toLocaleString()}
                                                    </p> :
                                                    ""
                                                }
                                                {finalPrice.toLocaleString()}
                                                <span className="font-medium text-xs text-mist-700">
                                                    تومان
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between p-2 items-center">
                        <div className="flex sm:items-center sm:gap-4 gap-2 sm:flex-row flex-col">
                            <p className="font-medium text-mist-700 text-sm">
                                در صورت تایید سبد خرید
                            </p>
                            <Link
                                href="?activeLink=info"
                                className="bg-red-600 rounded text-white font-medium py-1 px-3 text-center">
                                مرحله بعد
                            </Link>
                        </div>
                        <div>
                            <p className="font-medium text-xs text-mist-700 mb-2">مجموع خرید</p>
                            <p className="">
                                {total.toLocaleString()}
                                <span className="font-medium text-xs text-mist-700">
                                    تومان
                                </span>
                            </p>
                        </div>
                    </div>
                </div >
                :
                <div className="text-center bg-white rounded-lg p-6 w-full mt-6 space-y-4">
                    <p className="font-semibold">
                        هنوز محصولی به سبد خرید خود اضافه نکرده‌اید.
                    </p>
                    <p className="text-sm text-mist-700 flex justify-center items-center gap-1">
                        {`از `}
                        <Link href={"/category/کتاب"} className="font-semibold text-blue-700 underline">
                            {`کتاب‌ها`}
                        </Link>
                        {` و همینطور از`}
                        <Link href={"/category/لوازم خوشنویسی"} className="font-semibold text-blue-700 underline">
                            {`لوازم`}
                        </Link>
                        {`خوشنویسی ما دیدن کنید.`}
                    </p>
                </div>
            }
        </>
    );
}

export default ProductsCart;