'use client';

import PaginationBox from '@/lib/Components/Pagination/PaginationBox'
import SearchBox from './SearchBox';
import ProductInput from './ProductInput';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getCookie } from 'cookies-next';

interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
}

interface ProductInput {
    title: string;
    desc: string;
    price: {
        price: number;
        date: string;
    };
    cost: {
        cost: number;
        date: string;
        count?: number;
    };
    count: number;
    discount: {
        discount: number;
        date: number;
    };
    showCount: number;
    popularity: number;
    authorId: string;
    publisher: string;
    publishDate: string;
    brand: string;
    status: string;
    state?: string;
    size: string;
    weight: number;
    majorCat: string;
    minorCat: string;
    cover: string;
    images: string[];
}

const validationRules: Record<string, ValidationRule> = {
    title: {
        required: true,
        minLength: 3,
        maxLength: 60,
        message: 'عنوان باید بین 3 تا 60 کاراکتر باشد'
    },
    desc: {
        required: true,
        minLength: 3,
        maxLength: 600,
        message: 'توضیحات باید بین 3 تا 600 کاراکتر باشد'
    },
    price: {
        required: true,
        min: 0,
        message: 'قیمت باید بزرگتر از صفر باشد'
    },
    cost: {
        required: true,
        min: 0,
        message: 'قیمت خرید باید بزرگتر از صفر باشد'
    },
    costCount: {
        required: true,
        min: 0,
        message: 'تعداد خرید نمی‌تواند منفی باشد'
    },
    count: {
        required: true,
        min: 0,
        message: 'موجودی نمی‌تواند منفی باشد'
    },
    showCount: {
        required: true,
        min: 0,
        message: 'تعداد نمایشی نمی‌تواند منفی باشد'
    },
    popularity: {
        required: true,
        min: 0,
        max: 5,
        message: 'محبوبیت باید بین 0 تا 5 باشد'
    },
    authorId: {
        required: false,
        message: 'نویسنده الزامی است'
    },
    publisher: {
        required: false,
        maxLength: 60,
        message: 'نام ناشر نمی‌تواند بیشتر از 60 کاراکتر باشد'
    },
    publishDate: {
        required: false,
        maxLength: 60,
        message: 'تاریخ انتشار نمی‌تواند بیشتر از 60 کاراکتر باشد'
    },
    brand: {
        required: false,
        maxLength: 60,
        message: 'نام برند نمی‌تواند بیشتر از 60 کاراکتر باشد'
    },
    status: {
        required: true,
        message: 'وضعیت کیفیت محصول الزامی است'
    },
    state: {
        required: true,
        message: 'وضعیت محصول الزامی است'
    },
    size: {
        required: false,
        maxLength: 60,
        message: 'سایز نمی‌تواند بیشتر از 60 کاراکتر باشد'
    },
    weight: {
        required: true,
        min: 50,
        message: 'وزن محصول باید حداقل 50 گرم باشد'
    },
    majorCat: {
        required: true,
        minLength: 3,
        maxLength: 60,
        message: 'دسته‌بندی اصلی باید بین 3 تا 60 کاراکتر باشد'
    },
    minorCat: {
        required: true,
        minLength: 3,
        maxLength: 60,
        message: 'دسته‌بندی فرعی باید بین 3 تا 60 کاراکتر باشد'
    }
};

const query = `
  query GetProducts($page: Int, $limit: Int, $search: String) {
    products(page: $page, limit: $limit, search: $search) {
      products {
        _id
        title
        desc
        price {
          price
          date
        }
        cost {
          cost
          date
        }
        discount {
          discount
          date
        }
        count
        showCount
        totalSell
        popularity
        authorId {
          _id
          firstname
          lastname
          fullName
        }
        authorArticleId {
          _id
        }
        publisherArticleId {
          _id
        }
        productArticleId {
          _id
        }
        publisher
        publishDate
        brand
        status
        size
        weight
        majorCat
        minorCat
        cover
        images
        comments {
          _id
        }
        createdAt
        updatedAt
      }
      totalPages
      currentPage
      total
    }
  }
`;

const updateProductMutation = `
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      _id
      title
      desc
      price {
        price
        date
      }
      cost {
        cost
        date
      }
      discount {
        discount
        date
      }
      count
      showCount
      totalSell
      popularity
      publisher
      publishDate
      brand
      status
      size
      weight
      majorCat
      minorCat
    }
  }
`;

const fetcher = async (url: string, variables: any) => {
    const jwt = getCookie("jwt") as string;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': jwt
        },
        body: JSON.stringify({
            query,
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
            query: updateProductMutation,
            variables
        })
    });
    return response.json();
};

function CMSProductBox({ type, page }: {
    type: string, page: {
        page: number
        count: number
        search: string
    }
}) {
    const [editingProducts, setEditingProducts] = useState<Record<string, any>>({});
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
    
    const variables = {
        page: page.page,
        limit: page.count,
        search: page.search,
    };

    const { data, error, isLoading, mutate } = useSWR(
        ['http://localhost:4000/graphql', variables],
        ([url, variables]) => fetcher(url, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    // Set initial values when data is loaded
    useEffect(() => {
        if (data?.data?.products?.products) {
            const newInitialValues: Record<string, any> = {};
            data.data.products.products.forEach((product: any) => {
                newInitialValues[product._id] = {
                    title: product.title,
                    desc: product.desc,
                    price: product.price[product.price.length - 1]?.price,
                    cost: product.cost[product.cost.length - 1]?.cost,
                    costCount: product.cost[product.cost.length - 1]?.count ?? 1,
                    count: product.count,
                    discount: product.discount[product.discount.length - 1]?.discount,
                    showCount: product.showCount,
                    popularity: product.popularity,
                    authorId: product.authorId,
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

    const validateField = (field: string, value: any): string | null => {
        const rules = validationRules[field];
        if (!rules) return null;

        if (rules.required && (!value || value === '')) {
            return rules.message || 'این فیلد الزامی است';
        }

        if (typeof value === 'string') {
            if (rules.minLength && value.length < rules.minLength) {
                return rules.message || `حداقل ${rules.minLength} کاراکتر`;
            }
            if (rules.maxLength && value.length > rules.maxLength) {
                return rules.message || `حداکثر ${rules.maxLength} کاراکتر`;
            }
        }

        if (typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                return rules.message || `حداقل مقدار ${rules.min}`;
            }
            if (rules.max !== undefined && value > rules.max) {
                return rules.message || `حداکثر مقدار ${rules.max}`;
            }
        }

        return null;
    };

    const handleProductChange = (productId: string, field: string, value: any) => {
        const currentProduct = data?.data?.products?.products?.find((p: any) => p._id === productId);
        if (!currentProduct) return;

        // Validate the field
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

    // Validate all fields of a product on initial load
    const validateProductOnLoad = (product: any) => {
        const newErrors: Record<string, string> = {};
        const initialProductValues = initialValues[product._id];
        
        if (!initialProductValues) return newErrors;

        Object.keys(validationRules).forEach(field => {
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

        Object.keys(validationRules).forEach(field => {
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
            const currentProduct = data?.data?.products?.products?.find((p: any) => p._id === productId);
            const editedProduct = editingProducts[productId];
            
            if (!currentProduct || !editedProduct) {
                console.log('Product not found');
                return;
            }

            const input: ProductInput = {
                title: editedProduct.title ?? currentProduct.title,
                desc: editedProduct.desc ?? currentProduct.desc,
                price: {
                    price: Number(editedProduct.price ?? currentProduct.price[currentProduct.price.length - 1].price),
                    date: new Date().toISOString()
                },
                cost: {
                    cost: Number(editedProduct.cost ?? currentProduct.cost[currentProduct.cost.length - 1].cost),
                    date: new Date().toISOString(),
                    count: Number(editedProduct.costCount ?? currentProduct.cost[currentProduct.cost.length - 1].count ?? 1)
                },
                count: Number(editedProduct.count ?? currentProduct.count),
                discount: {
                    discount: Number(editedProduct.discount ?? currentProduct.discount[currentProduct.discount.length - 1].discount),
                    date: 30
                },
                showCount: Number(editedProduct.showCount ?? currentProduct.showCount),
                popularity: Number(editedProduct.popularity ?? currentProduct.popularity),
                authorId: currentProduct.authorId?._id,
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

            // Clear editing state for this product
            setEditingProducts(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });

            // Clear errors for this product
            setErrors(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });

            // Update local data
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

                {/* (product , article , ...) section start  */}
                {products && products.products.map((c: any) => {
                    const isEditing = !!editingProducts[c._id];
                    const productErrors = errors[c._id] || validateProductOnLoad(c);
                    const hasErrors = productErrors && Object.values(productErrors).some(error => error);
                    const initialProductValues = initialValues[c._id];

                    return (
                        <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3" key={c._id}>
                            <div className="flex justify-between items-center gap-2">
                            <img src={`https://api.neynegar1.ir/imgs/${c.cover}`} alt="" className='w-20 rounded-lg h-20 object-cover' />
                                <h2 className="md:text-lg text-shadow">{c.title.split(":")[0]}</h2>
                            </div>
                            <div className="overflow-x-auto scrollable-section">
                                <div className="flex gap-4 pb-4 w-max">
                                    <ProductInput
                                        label="عنوان"
                                        value={editingProducts[c._id]?.title ?? initialProductValues?.title}
                                        onChange={(value) => handleProductChange(c._id, 'title', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'title', editingProducts[c._id]?.title ?? initialProductValues?.title)}
                                        error={errors[c._id]?.title}
                                    />

                                    <ProductInput
                                        label="توضیحات"
                                        value={editingProducts[c._id]?.desc ?? initialProductValues?.desc}
                                        type="textarea"
                                        onChange={(value) => handleProductChange(c._id, 'desc', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'desc', editingProducts[c._id]?.desc ?? initialProductValues?.desc)}
                                        error={errors[c._id]?.desc}
                                    />

                                    <ProductInput
                                        label="قیمت فعلی"
                                        value={editingProducts[c._id]?.price ?? initialProductValues?.price}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'price', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'price', editingProducts[c._id]?.price ?? initialProductValues?.price)}
                                        error={errors[c._id]?.price}
                                    />

                                    <ProductInput
                                        label="قیمت خرید"
                                        value={editingProducts[c._id]?.cost ?? initialProductValues?.cost}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'cost', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'cost', editingProducts[c._id]?.cost ?? initialProductValues?.cost)}
                                        error={errors[c._id]?.cost}
                                    />

                                    <ProductInput
                                        label="تعداد خرید"
                                        value={editingProducts[c._id]?.costCount ?? initialProductValues?.costCount}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'costCount', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'costCount', editingProducts[c._id]?.costCount ?? initialProductValues?.costCount)}
                                        error={errors[c._id]?.costCount}
                                    />

                                    <ProductInput
                                        label="تخفیف فعلی"
                                        value={editingProducts[c._id]?.discount ?? initialProductValues?.discount}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'discount', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'discount', editingProducts[c._id]?.discount ?? initialProductValues?.discount)}
                                        error={errors[c._id]?.discount}
                                    />

                                    <ProductInput
                                        label="موجودی"
                                        value={editingProducts[c._id]?.count ?? initialProductValues?.count}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'count', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'count', editingProducts[c._id]?.count ?? initialProductValues?.count)}
                                        error={errors[c._id]?.count}
                                    />

                                    <ProductInput
                                        label="تعداد نمایشی"
                                        value={editingProducts[c._id]?.showCount ?? initialProductValues?.showCount}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'showCount', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'showCount', editingProducts[c._id]?.showCount ?? initialProductValues?.showCount)}
                                        error={errors[c._id]?.showCount}
                                    />

                                    <div className="flex flex-col gap-1 min-w-[200px]">
                                        <label className="text-sm text-gray-600">میزان فروش</label>
                                        <div className="p-2 border border-gray-300 rounded-lg bg-gray-50">
                                            {c.totalSell}
                                        </div>
                                    </div>

                                    <ProductInput
                                        label="محبوبیت"
                                        value={editingProducts[c._id]?.popularity ?? initialProductValues?.popularity}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'popularity', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'popularity', editingProducts[c._id]?.popularity ?? initialProductValues?.popularity)}
                                        error={errors[c._id]?.popularity}
                                    />

                                    <ProductInput
                                        label="نویسنده"
                                        value={(editingProducts[c._id]?.authorId?.fullName ?? initialProductValues?.authorId?.fullName) || ''}
                                        onChange={(value) => handleProductChange(c._id, 'authorId', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'authorId', editingProducts[c._id]?.authorId?.fullName ?? initialProductValues?.authorId?.fullName)}
                                        error={errors[c._id]?.authorId}
                                    />

                                    <ProductInput
                                        label="ناشر"
                                        value={editingProducts[c._id]?.publisher ?? initialProductValues?.publisher}
                                        onChange={(value) => handleProductChange(c._id, 'publisher', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'publisher', editingProducts[c._id]?.publisher ?? initialProductValues?.publisher)}
                                        error={errors[c._id]?.publisher}
                                    />

                                    <ProductInput
                                        label="تاریخ انتشار"
                                        value={editingProducts[c._id]?.publishDate ?? initialProductValues?.publishDate}
                                        onChange={(value) => handleProductChange(c._id, 'publishDate', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'publishDate', editingProducts[c._id]?.publishDate ?? initialProductValues?.publishDate)}
                                        error={errors[c._id]?.publishDate}
                                    />

                                    <ProductInput
                                        label="برند"
                                        value={editingProducts[c._id]?.brand ?? initialProductValues?.brand}
                                        onChange={(value) => handleProductChange(c._id, 'brand', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'brand', editingProducts[c._id]?.brand ?? initialProductValues?.brand)}
                                        error={errors[c._id]?.brand}
                                    />

                                    <ProductInput
                                        label="وضعیت"
                                        value={editingProducts[c._id]?.status ?? initialProductValues?.status}
                                        type="select"
                                        options={[
                                            { value: 'نو', label: 'نو' },
                                            { value: 'درحد‌نو', label: 'درحد‌نو' },
                                            { value: 'دسته‌دوم', label: 'دسته‌دوم' }
                                        ]}
                                        onChange={(value) => handleProductChange(c._id, 'status', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'status', editingProducts[c._id]?.status ?? initialProductValues?.status)}
                                        error={errors[c._id]?.status}
                                    />

                                    <ProductInput
                                        label="وضعیت نمایش"
                                        value={editingProducts[c._id]?.state ?? initialProductValues?.state ?? 'active'}
                                        type="select"
                                        options={[
                                            { value: 'active', label: 'فعال' },
                                            { value: 'inactive', label: 'غیرفعال' },
                                            { value: 'outOfStock', label: 'ناموجود' },
                                            { value: 'comingSoon', label: 'به زودی' }
                                        ]}
                                        onChange={(value) => handleProductChange(c._id, 'state', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'state', editingProducts[c._id]?.state ?? initialProductValues?.state ?? 'active')}
                                        error={errors[c._id]?.state}
                                    />

                                    <ProductInput
                                        label="سایز"
                                        value={editingProducts[c._id]?.size ?? initialProductValues?.size}
                                        onChange={(value) => handleProductChange(c._id, 'size', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'size', editingProducts[c._id]?.size ?? initialProductValues?.size)}
                                        error={errors[c._id]?.size}
                                    />

                                    <ProductInput
                                        label="وزن"
                                        value={editingProducts[c._id]?.weight ?? initialProductValues?.weight}
                                        type="number"
                                        onChange={(value) => handleProductChange(c._id, 'weight', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'weight', editingProducts[c._id]?.weight ?? initialProductValues?.weight)}
                                        error={errors[c._id]?.weight}
                                    />

                                    <ProductInput
                                        label="دسته‌بندی اصلی"
                                        value={editingProducts[c._id]?.majorCat ?? initialProductValues?.majorCat}
                                        onChange={(value) => handleProductChange(c._id, 'majorCat', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'majorCat', editingProducts[c._id]?.majorCat ?? initialProductValues?.majorCat)}
                                        error={errors[c._id]?.majorCat}
                                    />

                                    <ProductInput
                                        label="دسته‌بندی فرعی"
                                        value={editingProducts[c._id]?.minorCat ?? initialProductValues?.minorCat}
                                        onChange={(value) => handleProductChange(c._id, 'minorCat', value)}
                                        onFocus={() => handleFieldFocus(c._id, 'minorCat', editingProducts[c._id]?.minorCat ?? initialProductValues?.minorCat)}
                                        error={errors[c._id]?.minorCat}
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
                                        className={`px-4 py-2 rounded text-white ${
                                            hasErrors 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                        onClick={() => handleSaveChanges(c._id)}
                                        disabled={isSaving || hasErrors}
                                    >
                                        {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                                    </button>
                                )}
                                <button 
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={() => {/* TODO: Implement delete functionality */}}
                                >
                                    حذف محصول
                                </button>
                            </div>
                        </div>
                    );
                })}
                {/* (product , article , ...) section end  */}

                {products?.totalPages > 1 &&
                    <PaginationBox
                        count={products.totalPages}
                        currentPage={products.currentPage}
                    />
                }
            </div>
        </>
    );
}

export default CMSProductBox;
