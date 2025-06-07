'use client';

import PaginationBox from '@/lib/Components/Pagination/PaginationBox'
import SearchBox from './SearchBox';
import ProductInput from './ProductInput';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getCookie } from 'cookies-next';
import { Product, ProductInput as ProductInputType, ProductsResponse } from '@/types/product';
import { validateField } from '@/lib/validation/productValidation';
import { GET_PRODUCTS, UPDATE_PRODUCT } from '@/lib/graphql/productQueries';
import { linksType } from '@/lib/Types/links';

interface CMSProductBoxProps {
    type: string;
    page: {
        page: number;
        count: number;
        search: string;
    };
    links: linksType[]
}

const fetcher = async (url: string, variables: any) => {
    const jwt = getCookie("jwt") as string;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': jwt
        },
        body: JSON.stringify({
            query: GET_PRODUCTS,
            variables
        })
    });
    return response.json();
};

const updateProduct = async (url: string, variables: any) => {
    const jwt = getCookie("jwt") as string;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': jwt
        },
        body: JSON.stringify({
            query: UPDATE_PRODUCT,
            variables
        })
    });
    return response.json();
};

function CMSProductBox({ type, page, links }: CMSProductBoxProps) {
    const [editingProducts, setEditingProducts] = useState<Record<string, any>>({});
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

    const variables = {
        page: page.page,
        limit: page.count,
        search: page.search,
    };

    const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
        ['http://localhost:4000/graphql', variables],
        ([url, variables]) => fetcher(url, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    useEffect(() => {
        if (data?.data?.products?.products) {
            const newInitialValues: Record<string, any> = {};
            data.data.products.products.forEach((product: Product) => {
                const lastPrice = product.price[product.price.length - 1];
                const lastCost = product.cost[product.cost.length - 1];
                const lastDiscount = product.discount[product.discount.length - 1];

                newInitialValues[product._id] = {
                    title: product.title,
                    desc: product.desc,
                    price: lastPrice?.price ?? 0,
                    cost: lastCost?.cost ?? 0,
                    costCount: lastCost?.count ?? 1,
                    count: product.count,
                    discount: lastDiscount?.discount ?? 0,
                    showCount: product.showCount,
                    popularity: product.popularity,
                    authorId: product.authorId ? product.authorId.fullName : "",
                    publisher: product.publisher,
                    publishDate: product.publishDate,
                    brand: product.brand,
                    status: product.status,
                    state: product.state ?? 'active',
                    size: product.size,
                    weight: product.weight,
                    majorCat: product.majorCat,
                    minorCat: product.minorCat
                };
            });
            setInitialValues(newInitialValues);
        }
    }, [data]);

    const handleProductChange = (productId: string, field: string, value: any) => {
        const currentProduct = data?.data?.products?.products?.find((p: Product) => p._id === productId);
        if (!currentProduct) return;

        if (editingProducts[productId]) {
            const error = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [productId]: {
                    ...prev[productId],
                    [field]: error || ''
                }
            }));
        }

        setEditingProducts(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    const handleFieldFocus = (productId: string, field: string, value: any) => {
        if (editingProducts[productId]) {
            const error = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [productId]: {
                    ...prev[productId],
                    [field]: error || ''
                }
            }));
        }
    };

    const validateProductOnLoad = (product: Product) => {
        if (!editingProducts[product._id]) {
            return {};
        }

        const newErrors: Record<string, string> = {};
        const initialProductValues = initialValues[product._id];

        if (!initialProductValues) return newErrors;

        Object.keys(initialProductValues).forEach(field => {
            const value = initialProductValues[field];
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
            }
        });

        return newErrors;
    };

    const validateProduct = (productId: string): boolean => {
        const product = editingProducts[productId];
        const initialProductValues = initialValues[productId];
        if (!product || !initialProductValues) return false;

        const newErrors: Record<string, string> = {};
        let isValid = true;

        Object.keys(initialProductValues).forEach(field => {
            const value = product[field] ?? initialProductValues[field];
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(prev => ({
            ...prev,
            [productId]: newErrors
        }));

        return isValid;
    };

    const handleSaveChanges = async (productId: string) => {
        try {
            if (!validateProduct(productId)) {
                const productErrors = errors[productId];
                if (productErrors) {
                    const errorMessages = Object.entries(productErrors)
                        .filter(([_, message]) => message)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join('\n');

                    alert('لطفاً خطاهای زیر را برطرف کنید:\n' + errorMessages);
                }
                return;
            }

            setIsSaving(true);
            const currentProduct = data?.data?.products?.products?.find((p: Product) => p._id === productId);
            const editedProduct = editingProducts[productId];

            if (!currentProduct || !editedProduct) {
                console.log('Product not found');
                return;
            }

            const lastPrice = currentProduct.price[currentProduct.price.length - 1];
            const lastCost = currentProduct.cost[currentProduct.cost.length - 1];
            const lastDiscount = currentProduct.discount[currentProduct.discount.length - 1];

            const input: ProductInputType = {
                title: editedProduct.title ?? currentProduct.title,
                desc: editedProduct.desc ?? currentProduct.desc,
                price: {
                    price: Number(editedProduct.price ?? lastPrice?.price ?? 0),
                    date: new Date().toISOString()
                },
                cost: {
                    cost: Number(editedProduct.cost ?? lastCost?.cost ?? 0),
                    date: new Date().toISOString(),
                    count: Number(editedProduct.costCount ?? lastCost?.count ?? 1)
                },
                count: Number(editedProduct.count ?? currentProduct.count),
                discount: {
                    discount: Number(editedProduct.discount ?? lastDiscount?.discount ?? 0),
                    date: 30
                },
                showCount: Number(editedProduct.showCount ?? currentProduct.showCount),
                popularity: Number(editedProduct.popularity ?? currentProduct.popularity),
                authorId: currentProduct.authorId._id,
                publisher: editedProduct.publisher ?? currentProduct.publisher,
                publishDate: editedProduct.publishDate ?? currentProduct.publishDate,
                brand: editedProduct.brand ?? currentProduct.brand,
                status: editedProduct.status ?? currentProduct.status,
                state: editedProduct.state ?? currentProduct.state ?? 'active',
                size: editedProduct.size ?? currentProduct.size,
                weight: Number(editedProduct.weight ?? currentProduct.weight),
                majorCat: editedProduct.majorCat ?? currentProduct.majorCat,
                minorCat: editedProduct.minorCat ?? currentProduct.minorCat,
                cover: currentProduct.cover,
                images: currentProduct.images
            };

            console.log('Sending update request with input:', input);

            const response = await updateProduct('http://localhost:4000/graphql', {
                id: productId,
                input
            });

            if (response.errors) {
                console.error('Server error:', response.errors);
                throw new Error(response.errors[0].message);
            }

            setEditingProducts(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });

            setErrors(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });

            await mutate();

            console.log('Product updated successfully');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('خطا در ذخیره اطلاعات: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    if (error) {
        return (
            <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
                <div className="flex justify-center items-center h-40">
                    <p className="text-red-500">خطا در دریافت اطلاعات</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    const products = data?.data?.products;

    return (
        <>
            <div className={`bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20`}>
                <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    {type}
                </h3>

                <SearchBox search={page.search} />

                {products && products.products.map((product: Product) => {
                    const isEditing = !!editingProducts[product._id];
                    const productErrors = isEditing ? (errors[product._id] || validateProductOnLoad(product)) : {};
                    const hasErrors = productErrors && Object.values(productErrors).some(error => error);
                    const initialProductValues = initialValues[product._id];

                    return (
                        <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3" key={product._id}>
                            <div className="flex justify-between items-center gap-2">
                                <img src={`https://api.neynegar1.ir/imgs/${product.cover}`} alt="" className='w-20 rounded-lg h-20 object-cover' />
                                <h2 className="md:text-lg text-shadow">{product.title.split(":")[0]}</h2>
                            </div>
                            <div className="overflow-x-auto scrollable-section">
                                <div className="flex gap-4 pb-4 w-max">
                                    <ProductInput
                                        label="عنوان"
                                        value={editingProducts[product._id]?.title ?? initialProductValues?.title}
                                        onChange={(value) => handleProductChange(product._id, 'title', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'title', editingProducts[product._id]?.title ?? initialProductValues?.title)}
                                        error={errors[product._id]?.title}
                                    />

                                    <ProductInput
                                        label="توضیحات"
                                        value={editingProducts[product._id]?.desc ?? initialProductValues?.desc}
                                        type="textarea"
                                        onChange={(value) => handleProductChange(product._id, 'desc', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'desc', editingProducts[product._id]?.desc ?? initialProductValues?.desc)}
                                        error={errors[product._id]?.desc}
                                    />

                                    <ProductInput
                                        label="قیمت فعلی"
                                        value={editingProducts[product._id]?.price ?? initialProductValues?.price}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'price', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'price', editingProducts[product._id]?.price ?? initialProductValues?.price)}
                                        error={errors[product._id]?.price}
                                    />

                                    <ProductInput
                                        label="قیمت خرید"
                                        value={editingProducts[product._id]?.cost ?? initialProductValues?.cost}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'cost', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'cost', editingProducts[product._id]?.cost ?? initialProductValues?.cost)}
                                        error={errors[product._id]?.cost}
                                    />

                                    <ProductInput
                                        label="تعداد خرید"
                                        value={editingProducts[product._id]?.costCount ?? initialProductValues?.costCount}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'costCount', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'costCount', editingProducts[product._id]?.costCount ?? initialProductValues?.costCount)}
                                        error={errors[product._id]?.costCount}
                                    />

                                    <ProductInput
                                        label="تخفیف فعلی"
                                        value={editingProducts[product._id]?.discount ?? initialProductValues?.discount}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'discount', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'discount', editingProducts[product._id]?.discount ?? initialProductValues?.discount)}
                                        error={errors[product._id]?.discount}
                                    />

                                    <ProductInput
                                        label="موجودی"
                                        value={editingProducts[product._id]?.count ?? initialProductValues?.count}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'count', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'count', editingProducts[product._id]?.count ?? initialProductValues?.count)}
                                        error={errors[product._id]?.count}
                                    />

                                    <ProductInput
                                        label="تعداد نمایشی"
                                        value={editingProducts[product._id]?.showCount ?? initialProductValues?.showCount}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'showCount', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'showCount', editingProducts[product._id]?.showCount ?? initialProductValues?.showCount)}
                                        error={errors[product._id]?.showCount}
                                    />

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="sm:text-sm text-xs text-gray-600">میزان فروش</label>
                                        <div className="p-2 border border-gray-300 rounded-lg bg-gray-50 sm:text-sm text-xs">
                                            {product.totalSell}
                                        </div>
                                    </div>

                                    <ProductInput
                                        label="محبوبیت"
                                        value={editingProducts[product._id]?.popularity ?? initialProductValues?.popularity}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'popularity', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'popularity', editingProducts[product._id]?.popularity ?? initialProductValues?.popularity)}
                                        error={errors[product._id]?.popularity}
                                    />

                                    <ProductInput
                                        label="نویسنده"
                                        value={editingProducts[product._id]?.authorId ?? (product.authorId ? product.authorId.fullName : "")}
                                        onChange={(value) => handleProductChange(product._id, 'authorId', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'authorId', editingProducts[product._id]?.authorId ?? product.authorId.fullName)}
                                        error={errors[product._id]?.authorId}
                                    />

                                    <ProductInput
                                        label="ناشر"
                                        value={editingProducts[product._id]?.publisher ?? initialProductValues?.publisher}
                                        onChange={(value) => handleProductChange(product._id, 'publisher', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'publisher', editingProducts[product._id]?.publisher ?? initialProductValues?.publisher)}
                                        error={errors[product._id]?.publisher}
                                    />

                                    <ProductInput
                                        label="تاریخ انتشار"
                                        value={editingProducts[product._id]?.publishDate ?? initialProductValues?.publishDate}
                                        onChange={(value) => handleProductChange(product._id, 'publishDate', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'publishDate', editingProducts[product._id]?.publishDate ?? initialProductValues?.publishDate)}
                                        error={errors[product._id]?.publishDate}
                                    />

                                    <ProductInput
                                        label="برند"
                                        value={editingProducts[product._id]?.brand ?? initialProductValues?.brand}
                                        onChange={(value) => handleProductChange(product._id, 'brand', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'brand', editingProducts[product._id]?.brand ?? initialProductValues?.brand)}
                                        error={errors[product._id]?.brand}
                                    />

                                    <ProductInput
                                        label="وضعیت"
                                        value={editingProducts[product._id]?.status ?? initialProductValues?.status}
                                        type="select"
                                        options={[
                                            { value: 'نو', label: 'نو' },
                                            { value: 'درحد‌نو', label: 'درحد‌نو' },
                                            { value: 'دسته‌دوم', label: 'دسته‌دوم' }
                                        ]}
                                        onChange={(value) => handleProductChange(product._id, 'status', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'status', editingProducts[product._id]?.status ?? initialProductValues?.status)}
                                        error={errors[product._id]?.status}
                                    />

                                    <ProductInput
                                        label="وضعیت نمایش"
                                        value={editingProducts[product._id]?.state ?? initialProductValues?.state ?? 'active'}
                                        type="select"
                                        options={[
                                            { value: 'active', label: 'فعال' },
                                            { value: 'inactive', label: 'غیرفعال' },
                                            { value: 'outOfStock', label: 'ناموجود' },
                                            { value: 'comingSoon', label: 'به زودی' }
                                        ]}
                                        onChange={(value) => handleProductChange(product._id, 'state', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'state', editingProducts[product._id]?.state ?? initialProductValues?.state ?? 'active')}
                                        error={errors[product._id]?.state}
                                    />

                                    <ProductInput
                                        label="سایز"
                                        value={editingProducts[product._id]?.size ?? initialProductValues?.size}
                                        onChange={(value) => handleProductChange(product._id, 'size', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'size', editingProducts[product._id]?.size ?? initialProductValues?.size)}
                                        error={errors[product._id]?.size}
                                    />

                                    <ProductInput
                                        label="وزن"
                                        value={editingProducts[product._id]?.weight ?? initialProductValues?.weight}
                                        type="number"
                                        onChange={(value) => handleProductChange(product._id, 'weight', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'weight', editingProducts[product._id]?.weight ?? initialProductValues?.weight)}
                                        error={errors[product._id]?.weight}
                                    />

                                    <ProductInput
                                        label="دسته‌بندی اصلی"
                                        value={editingProducts[product._id]?.majorCat ?? initialProductValues?.majorCat}
                                        onChange={(value) => handleProductChange(product._id, 'majorCat', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'majorCat', editingProducts[product._id]?.majorCat ?? initialProductValues?.majorCat)}
                                        error={errors[product._id]?.majorCat}
                                    />

                                    <ProductInput
                                        label="دسته‌بندی فرعی"
                                        value={editingProducts[product._id]?.minorCat ?? initialProductValues?.minorCat}
                                        onChange={(value) => handleProductChange(product._id, 'minorCat', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'minorCat', editingProducts[product._id]?.minorCat ?? initialProductValues?.minorCat)}
                                        error={errors[product._id]?.minorCat}
                                    />
                                </div>
                            </div>

                            {hasErrors && (
                                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <h4 className="text-red-600 font-medium mb-2">خطاهای موجود:</h4>
                                    <ul className="list-disc list-inside text-red-500 text-sm">
                                        {Object.entries(productErrors)
                                            .filter(([_, message]) => message)
                                            .map(([field, message]) => (
                                                <li key={field}>{message}</li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex md:justify-end justify-center gap-2 mt-4">
                                {isEditing && (
                                    <button
                                        className={`px-4 py-2 rounded text-white ${hasErrors
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                        onClick={() => handleSaveChanges(product._id)}
                                        disabled={isSaving || hasErrors}
                                    >
                                        {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                                    </button>
                                )}
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={() => {/* TODO: Implement delete functionality */ }}
                                >
                                    حذف محصول
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Pagination */}
                {products && products.totalPages > 1 && (
                    <div className="mt-4">
                        <PaginationBox
                            count={products.totalPages}
                            currentPage={products.currentPage}
                        />
                    </div>
                )}
            </div>
        </>
    );
}

export default CMSProductBox;

