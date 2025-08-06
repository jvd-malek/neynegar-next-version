"use client"
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Product } from '@/types/product';
import ProductInput from './ProductInput';
import { UPDATE_PRODUCT } from '@/lib/graphql/productQueries';

const GET_OUT_OF_STOCK_PRODUCTS = `
  query OutOfStockProducts {
    outOfStockProducts {
      _id
      title
      showCount
      count
      totalSell
      cover
    }
  }
`;

function CMSOutOfStackProducts() {
    const { data, error, isLoading } = useSWR([
        GET_OUT_OF_STOCK_PRODUCTS
    ], ([query]) => fetcher(query), {
        revalidateOnFocus: false,
        dedupingInterval: 2000,
    });

    const [savingId, setSavingId] = useState<string | null>(null);
    const [localShowCounts, setLocalShowCounts] = useState<Record<string, number>>({});

    const handleShowCountChange = (productId: string, value: number) => {
        setLocalShowCounts(prev => ({ ...prev, [productId]: value }));
    };

    const handleShowCountSave = async (product: Product) => {
        const newShowCount = localShowCounts[product._id] ?? product.showCount;
        if (newShowCount === product.showCount) return;
        setSavingId(product._id);
        try {
            await fetcher(UPDATE_PRODUCT, {
                id: product._id,
                input: { showCount: newShowCount }
            });
            mutate([GET_OUT_OF_STOCK_PRODUCTS]);
        } finally {
            setSavingId(null);
        }
    };

    if (isLoading) return <div className="p-4 text-center">در حال بارگذاری...</div>;
    if (error) return <div className="p-4 text-center text-red-500">خطا در دریافت اطلاعات</div>;

    const products: Product[] = data?.outOfStockProducts || [];

    return (
        <div>
            <h2 className="text-lg font-bold mb-4">محصولات کسری (نمایشی ≤ ۰)</h2>
            {products.length === 0 ? (
                <div className="p-4 text-center">محصول کسری یافت نشد.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                        <div className="bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3" key={product._id}>
                            <div className="flex items-center gap-4">
                                <img
                                    src={`https://api.neynegar1.ir/uploads/${product.cover}`}
                                    alt={product.title}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div>
                                    <h3 className="text-base md:text-lg text-shadow line-clamp-2">{product.title.split(":")[0]}</h3>
                                    <div className="text-xs text-gray-500 mt-1">کد: {product._id}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2 items-end">
                                <ProductInput
                                    label="تعداد نمایشی"
                                    value={localShowCounts[product._id] ?? product.showCount}
                                    type="number"
                                    onChange={value => handleShowCountChange(product._id, value as number)}
                                    onFocus={() => {}}
                                />
                                <button
                                    className={`px-3 py-1 rounded bg-blue-500 text-white text-xs ${savingId === product._id ? 'opacity-50' : ''}`}
                                    onClick={() => handleShowCountSave(product)}
                                    disabled={savingId === product._id || (localShowCounts[product._id] ?? product.showCount) === product.showCount}
                                >
                                    ذخیره
                                </button>
                                <div className="">
                                <ProductInput label="موجودی" value={product.count} type="number" onChange={() => {}} disabled />
                                <ProductInput label="میزان فروش" value={product.totalSell} type="number" onChange={() => {}} disabled />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CMSOutOfStackProducts;