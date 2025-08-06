'use client'
import PaginationBox from '@/lib/Components/Pagination/PaginationBox'
import SearchBox from './SearchBox';
import ProductInput, { DiscountInput } from './ProductInput';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getCookie } from 'cookies-next';
import { Product, ProductInput as ProductInputType } from '@/types/product';
import { validateField } from '@/lib/validation/productValidation';
import { GET_PRODUCTS, UPDATE_PRODUCT } from '@/lib/graphql/productQueries';
import { linksType } from '@/lib/Types/links';
import { Modal } from '@mui/material';
import SearchableAuthorSelect from './SearchableAuthorSelect';
import { fetcher } from '@/lib/fetcher';

interface CMSProductBoxProps {
    type: string;
    page: {
        page: number;
        count: number;
        search: string;
    };
    links: linksType[]
    authors: any
}

const DELETE_PRODUCT = `
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
    }
`;

function CMSProductBox({ type, page, links, authors }: CMSProductBoxProps) {
    const [editingProducts, setEditingProducts] = useState<Record<string, any>>({});
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const variables = {
        page: page.page,
        limit: page.count,
        search: page.search,
    };

    const { data, error, isLoading, mutate } = useSWR(
        [GET_PRODUCTS, variables],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    useEffect(() => {
        if (data?.products?.products) {
            const newInitialValues: Record<string, any> = {};
            data.products.products.forEach((product: Product) => {
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
                    discount: lastDiscount?.date > Date.now() ? lastDiscount?.discount : 0,
                    discountDuration: lastDiscount?.date > Date.now() ? Math.ceil((lastDiscount?.date - Date.now()) / 24 / 60 / 60 / 1000) : 30,
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

    const handleFieldChange = (productId: string, field: string, value: any) => {
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: error || ''
            }
        }));

        setEditingProducts(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    const handleFieldFocus = (productId: string, field: string, value: any) => {
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: error || ''
            }
        }));
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

    const handleSaveChanges = async (productId: string) => {
        try {
            setIsSaving(true);
            const currentProduct = data?.products?.products?.find((p: Product) => p._id === productId);
            const editedProduct = editingProducts[productId];

            if (!currentProduct || !editedProduct) {
                console.log('Product not found');
                return;
            }

            // Get current date for price/cost history
            const currentDate = new Date().toISOString();

            // Get current values from product history
            const lastPrice = currentProduct.price[currentProduct.price.length - 1];
            const lastCost = currentProduct.cost[currentProduct.cost.length - 1];
            const lastDiscount = currentProduct.discount[currentProduct.discount.length - 1];

            // Get authorId safely
            const getAuthorId = () => {
                if (currentProduct.authorId) {
                    // If authorId is an object with _id
                    if (typeof currentProduct.authorId === 'object' && currentProduct.authorId._id) {
                        return currentProduct.authorId._id;
                    }
                    // If authorId is a string (direct ID)
                    if (typeof currentProduct.authorId === 'string') {
                        return currentProduct.authorId;
                    }
                }
                return null;
            };
            // Check if values have changed
            const priceChanged = editedProduct.price !== undefined && editedProduct.price !== lastPrice?.price;
            const costChanged = editedProduct.cost !== undefined && editedProduct.cost !== lastCost?.cost;
            const costCountChanged = editedProduct.costCount !== undefined && editedProduct.costCount !== lastCost?.count;
            const discountChanged = editedProduct.discount !== undefined && editedProduct.discount !== lastDiscount?.discount;

            const input = {
                title: editedProduct.title ?? currentProduct.title,
                desc: editedProduct.desc ?? currentProduct.desc,
                count: Number(editedProduct.count ?? currentProduct.count),
                showCount: Number(editedProduct.showCount ?? currentProduct.showCount),
                popularity: Number(editedProduct.popularity ?? currentProduct.popularity),
                authorId: getAuthorId(),
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
                images: currentProduct.images,
                // Only send price if it changed
                ...(priceChanged && {
                    price: {
                        price: Number(editedProduct.price),
                        date: currentDate
                    }
                }),
                // Only send cost if it changed
                ...(costChanged && {
                    cost: {
                        cost: Number(editedProduct.cost),
                        count: Number(editedProduct.costCount ?? lastCost?.count ?? 1),
                        date: currentDate
                    }
                }),
                // Only send discount if it changed
                ...(discountChanged && {
                    discount: {
                        discount: Number(editedProduct.discount),
                        date: Number(editedProduct.discountDuration ?? 30)
                    }
                })
            };

            await fetcher(UPDATE_PRODUCT, {
                id: productId,
                input
            });

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

    const handleImageClick = (product: Product) => {
        setSelectedProduct(product);
        setImageModalOpen(true);
        // Clear previous preview URLs and files
        setPreviewUrls([]);
        setImageFiles([]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);

            // Create preview URLs for new files
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const handleImageSave = async () => {
        if (!selectedProduct) return;

        try {
            setIsSaving(true);
            const fileFormData = new FormData();

            // Add cover image
            if (imageFiles[0]) {
                fileFormData.append('cover', imageFiles[0]);
            }

            // Add additional images
            if (imageFiles.length > 1) {
                for (let i = 1; i < imageFiles.length; i++) {
                    fileFormData.append('images', imageFiles[i]);
                }
            }

            const jwt = getCookie("jwt") as string;
            if (!jwt) {
                throw new Error('No authentication token found');
            }

            // Upload files first
            const fileResponse = await fetch('https://api.neynegar1.ir/upload', {
                method: 'POST',
                headers: {
                    'authorization': jwt,
                    'Accept': 'application/json'
                },
                body: fileFormData
            });

            if (!fileResponse.ok) {
                throw new Error('Failed to upload files');
            }

            const fileResult = await fileResponse.json();

            // Update product with new images using GraphQL mutation
            const response = await fetch('https://api.neynegar1.ir/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': jwt
                },
                body: JSON.stringify({
                    query: `
                        mutation UpdateProductImages($id: ID!, $input: ProductImageInput!) {
                            updateProductImages(id: $id, input: $input) {
                                _id
                                cover
                                images
                            }
                        }
                    `,
                    variables: {
                        id: selectedProduct._id,
                        input: {
                            cover: fileResult.cover || selectedProduct.cover,
                            images: fileResult.images || []
                        }
                    }
                })
            });

            const result = await response.json();
            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            await mutate();
            setImageModalOpen(false);
            setImageFiles([]);
            setPreviewUrls([]);
            setSelectedProduct(null);

        } catch (error) {
            console.error('Error updating images:', error);
            alert('خطا در بروزرسانی تصاویر: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            setIsSaving(true);
            await fetcher(DELETE_PRODUCT, {
                id: productId
            });

            await mutate();
            setDeleteModalOpen(false);
            console.log('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('خطا در حذف محصول: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
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

    const products = data?.products;

    return (
        <>
            <div className={`bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20`}>
                <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    {type}
                </h3>

                <div className="flex justify-center absolute top-4 left-3 items-center gap-2 pl-2 text-white bg-black w-40 rounded-lg shadow-md overflow-hidden">
                    <SearchBox search={page.search} />
                </div>

                {(products && products.products.length > 0) ? products.products.map((product: Product) => {
                    const isEditing = !!editingProducts[product._id];
                    const productErrors = isEditing ? (errors[product._id] || validateProductOnLoad(product)) : {};
                    const hasErrors = productErrors && Object.values(productErrors).some(error => error);
                    const initialProductValues = initialValues[product._id];

                    return (
                        <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3" key={product._id}>
                            <div className="flex justify-between items-center gap-2">
                                <img
                                    src={`https://api.neynegar1.ir/uploads/${product.cover}`}
                                    alt=""
                                    className='w-20 rounded-lg h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity'
                                    onClick={() => handleImageClick(product)}
                                />
                                <h2 className="md:text-lg text-shadow">{product.title.split(":")[0]}</h2>
                            </div>
                            <div className="overflow-x-auto scrollable-section relative">
                                <div className="flex gap-4 pb-4 w-max">
                                    <ProductInput
                                        label="عنوان"
                                        value={editingProducts[product._id]?.title ?? initialProductValues?.title}
                                        onChange={(value) => handleFieldChange(product._id, 'title', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'title', editingProducts[product._id]?.title ?? initialProductValues?.title)}
                                        error={errors[product._id]?.title}
                                    />

                                    <ProductInput
                                        label="توضیحات"
                                        value={editingProducts[product._id]?.desc ?? initialProductValues?.desc}
                                        type="textarea"
                                        onChange={(value) => handleFieldChange(product._id, 'desc', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'desc', editingProducts[product._id]?.desc ?? initialProductValues?.desc)}
                                        error={errors[product._id]?.desc}
                                    />

                                    <ProductInput
                                        label="قیمت فعلی"
                                        value={editingProducts[product._id]?.price ?? initialProductValues?.price}
                                        type="number"
                                        onChange={(value) => handleFieldChange(product._id, 'price', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'price', editingProducts[product._id]?.price ?? initialProductValues?.price)}
                                        error={errors[product._id]?.price}
                                    />

                                    <ProductInput
                                        label="قیمت خرید"
                                        value={editingProducts[product._id]?.cost ?? initialProductValues?.cost}
                                        type="number"
                                        onChange={(value) => handleFieldChange(product._id, 'cost', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'cost', editingProducts[product._id]?.cost ?? initialProductValues?.cost)}
                                        error={errors[product._id]?.cost}
                                    />

                                    <ProductInput
                                        label="تعداد خرید"
                                        value={editingProducts[product._id]?.costCount ?? initialProductValues?.costCount}
                                        type="number"
                                        onChange={(value) => handleFieldChange(product._id, 'costCount', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'costCount', editingProducts[product._id]?.costCount ?? initialProductValues?.costCount)}
                                        error={errors[product._id]?.costCount}
                                    />

                                    <DiscountInput
                                        discount={editingProducts[product._id]?.discount ?? initialProductValues?.discount}
                                        duration={editingProducts[product._id]?.discountDuration ?? "30"}
                                        onDiscountChange={(value) => handleFieldChange(product._id, 'discount', value)}
                                        onDurationChange={(value) => handleFieldChange(product._id, 'discountDuration', value)}
                                        onFocus={(field, value) => handleFieldFocus(product._id, field, value)}
                                        errors={errors[product._id] || {}}
                                    />

                                    <ProductInput
                                        label="موجودی"
                                        value={editingProducts[product._id]?.count ?? initialProductValues?.count}
                                        type="number"
                                        onChange={(value) => handleFieldChange(product._id, 'count', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'count', editingProducts[product._id]?.count ?? initialProductValues?.count)}
                                        error={errors[product._id]?.count}
                                    />

                                    <ProductInput
                                        label="تعداد نمایشی"
                                        value={editingProducts[product._id]?.showCount ?? initialProductValues?.showCount}
                                        type="number"
                                        onChange={(value) => handleFieldChange(product._id, 'showCount', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'showCount', editingProducts[product._id]?.showCount ?? initialProductValues?.showCount)}
                                        error={errors[product._id]?.showCount}
                                    />

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="text-xs sm:text-sm text-gray-700 text-shadow">میزان فروش</label>
                                        <div className="rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 border-gray-300">
                                            {product.totalSell}
                                        </div>
                                    </div>

                                    <ProductInput
                                        label="محبوبیت"
                                        value={editingProducts[product._id]?.popularity ?? initialProductValues?.popularity}
                                        type="number"
                                        onChange={(value) => handleFieldChange(product._id, 'popularity', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'popularity', editingProducts[product._id]?.popularity ?? initialProductValues?.popularity)}
                                        error={errors[product._id]?.popularity}
                                    />

                                    <SearchableAuthorSelect
                                        value={editingProducts[product._id]?.authorId ?? (product.authorId ? product.authorId._id : '')}
                                        onChange={(value) => handleFieldChange(product._id, 'authorId', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'authorId', editingProducts[product._id]?.authorId ?? product.authorId?._id)}
                                        error={errors[product._id]?.authorId}
                                        authors={authors}
                                    />

                                    <ProductInput
                                        label="ناشر"
                                        value={editingProducts[product._id]?.publisher ?? initialProductValues?.publisher}
                                        onChange={(value) => handleFieldChange(product._id, 'publisher', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'publisher', editingProducts[product._id]?.publisher ?? initialProductValues?.publisher)}
                                        error={errors[product._id]?.publisher}
                                    />

                                    <ProductInput
                                        label="تاریخ انتشار"
                                        value={editingProducts[product._id]?.publishDate ?? initialProductValues?.publishDate}
                                        onChange={(value) => handleFieldChange(product._id, 'publishDate', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'publishDate', editingProducts[product._id]?.publishDate ?? initialProductValues?.publishDate)}
                                        error={errors[product._id]?.publishDate}
                                    />

                                    <ProductInput
                                        label="دسته‌بندی اصلی"
                                        value={editingProducts[product._id]?.majorCat ?? initialProductValues?.majorCat}
                                        onChange={(value) => handleFieldChange(product._id, 'majorCat', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'majorCat', editingProducts[product._id]?.majorCat ?? initialProductValues?.majorCat)}
                                        error={errors[product._id]?.majorCat}
                                        type="select"
                                        options={links.map(l => (
                                            { value: l.txt, label: l.txt }
                                        ))
                                        }
                                    />

                                    <ProductInput
                                        label="دسته‌بندی فرعی"
                                        value={editingProducts[product._id]?.minorCat ?? initialProductValues?.minorCat}
                                        onChange={(value) => handleFieldChange(product._id, 'minorCat', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'minorCat', editingProducts[product._id]?.minorCat ?? initialProductValues?.minorCat)}
                                        error={errors[product._id]?.minorCat}
                                        type="select"
                                        options={
                                            links.find(l => l.txt === (editingProducts[product._id]?.majorCat ?? initialProductValues?.majorCat))?.subLinks?.map((l: any) => ({
                                                value: l.link,
                                                label: l.link
                                            })) || []
                                        }
                                    />

                                    <ProductInput
                                        label="برند"
                                        value={editingProducts[product._id]?.brand ?? initialProductValues?.brand}
                                        onChange={(value) => handleFieldChange(product._id, 'brand', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'brand', editingProducts[product._id]?.brand ?? initialProductValues?.brand)}
                                        error={errors[product._id]?.brand}
                                        type="select"
                                        options={
                                            links.find(l => l.txt === (editingProducts[product._id]?.majorCat ?? initialProductValues?.majorCat))
                                                ?.subLinks.find(sl => sl.link === (editingProducts[product._id]?.minorCat ?? initialProductValues?.minorCat))
                                                ?.brand?.filter(brand => brand !== "همه")
                                                .map((brand: string) => ({
                                                    value: brand,
                                                    label: brand
                                                })) || []
                                        }
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
                                        onChange={(value) => handleFieldChange(product._id, 'status', value)}
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
                                        onChange={(value) => handleFieldChange(product._id, 'state', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'state', editingProducts[product._id]?.state ?? initialProductValues?.state ?? 'active')}
                                        error={errors[product._id]?.state}
                                    />

                                    <ProductInput
                                        label="سایز"
                                        value={editingProducts[product._id]?.size ?? initialProductValues?.size}
                                        onChange={(value) => handleFieldChange(product._id, 'size', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'size', editingProducts[product._id]?.size ?? initialProductValues?.size)}
                                        error={errors[product._id]?.size}
                                    />

                                    <ProductInput
                                        label="وزن"
                                        value={editingProducts[product._id]?.weight ?? initialProductValues?.weight}
                                        type="number"
                                        onChange={(value) => handleFieldChange(product._id, 'weight', value)}
                                        onFocus={() => handleFieldFocus(product._id, 'weight', editingProducts[product._id]?.weight ?? initialProductValues?.weight)}
                                        error={errors[product._id]?.weight}
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
                                    className="bg-red-500 cursor-pointer text-white px-4 py-1.5 rounded hover:bg-red-600"
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setDeleteModalOpen(true);
                                    }}
                                    disabled={isSaving}
                                >
                                    حذف محصول
                                </button>
                            </div>
                        </div>
                    );
                }) :
                    <p className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl text-center">محصولی یافت نشد 😥</p>
                }

                {/* Pagination */}
                {products && products.totalPages > 1 && (
                    <div className="mt-4">
                        <PaginationBox
                            count={products.totalPages}
                            currentPage={products.currentPage}
                        />
                    </div>
                )}

                {/* Image Edit Modal */}
                <Modal
                    open={imageModalOpen}
                    onClose={() => {
                        setImageModalOpen(false);
                        setImageFiles([]);
                        setPreviewUrls([]);
                        setSelectedProduct(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-[Vazir] w-[95vw] h-[80vh] overflow-y-scroll scroll-smooth scrollbar-hidden flex flex-col justify-between" dir="rtl">
                        <div>
                            <h3 className="text-lg font-bold mb-4">ویرایش تصاویر محصول</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    تصاویر محصول
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-black file:text-white
                                        hover:file:bg-gray-800"
                                />
                            </div>
                            {previewUrls.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    {previewUrls.map((image: string, index: number) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={image}
                                                alt={`Product image ${index + 1}`}
                                                className={`w-full h-24 object-cover rounded-lg ${index === 0 ? 'ring-2 ring-blue-500' : ''}`}
                                            />
                                            {index === 0 && (
                                                <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-tl-lg rounded-br-lg">
                                                    کاور
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newFiles = [...imageFiles];
                                                    const newPreviews = [...previewUrls];
                                                    newFiles.splice(index, 1);
                                                    newPreviews.splice(index, 1);
                                                    setImageFiles(newFiles);
                                                    setPreviewUrls(newPreviews);
                                                }}
                                                className="absolute cursor-pointer -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-6 h-6 flex justify-center items-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={handleImageSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                {isSaving ? 'در حال ذخیره...' : 'ذخیره تصاویر'}
                            </button>
                            <button
                                onClick={() => {
                                    setImageModalOpen(false);
                                    setImageFiles([]);
                                    setPreviewUrls([]);
                                    setSelectedProduct(null);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedProduct(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-[Vazir]">
                        <h3 className="text-lg font-bold mb-4">حذف محصول</h3>
                        <p className="mb-6">
                            آیا از حذف محصول "{selectedProduct?.title}" اطمینان دارید؟
                            این عملیات غیرقابل بازگشت است.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => handleDeleteProduct(selectedProduct?._id || '')}
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                {isSaving ? 'در حال حذف...' : 'حذف'}
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setSelectedProduct(null);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
}

export default CMSProductBox;