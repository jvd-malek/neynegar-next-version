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
    const [localShowCounts, setLocalShowCounts] = useState<Record<string, string | number>>({});

    const handleShowCountSave = async (product: Product) => {
        const currentValue = localShowCounts[product._id];
        let newShowCount: number;
        
        if (currentValue === '' || currentValue === undefined) {
            newShowCount = 0;
        } else {
            newShowCount = Number(currentValue);
        }
        
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
                                <div className="flex flex-col gap-2 w-20 sm:w-48">
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 text-shadow">تعداد نمایشی</label>
                                    <input
                                        type="number"
                                        value={localShowCounts[product._id] ?? product.showCount}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow empty string for proper editing
                                            setLocalShowCounts(prev => ({ 
                                                ...prev, 
                                                [product._id]: value === '' ? '' : Number(value) 
                                            }));
                                        }}
                                        onBlur={(e) => {
                                            // Convert empty string to 0 when losing focus
                                            if (e.target.value === '') {
                                                setLocalShowCounts(prev => ({ 
                                                    ...prev, 
                                                    [product._id]: 0 
                                                }));
                                            }
                                        }}
                                        className="rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 border-gray-300"
                                    />
                                </div>
                                <button
                                    className={`px-3 py-1 rounded bg-blue-500 text-white text-xs ${savingId === product._id ? 'opacity-50' : ''}`}
                                    onClick={() => handleShowCountSave(product)}
                                    disabled={savingId === product._id || (() => {
                                        const currentValue = localShowCounts[product._id];
                                        if (currentValue === '' || currentValue === undefined) {
                                            return product.showCount === 0;
                                        }
                                        return Number(currentValue) === product.showCount;
                                    })()}
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