'use client';

import { useState } from 'react';
import ProductInput from './ProductInput';
import { ProductInput as ProductInputType } from '@/types/product';
import { validateField } from '@/lib/validation/productValidation';
import { getCookie } from 'cookies-next';
import { linksType } from '@/lib/Types/links';

const ADD_PRODUCT = `
    mutation AddProduct($input: ProductInput!) {
        addProduct(input: $input) {
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
                count
            }
            count
            discount {
                discount
                date
            }
            showCount
            popularity
            authorId {
                _id
                fullName
            }
            publisher
            publishDate
            brand
            status
            state
            size
            weight
            majorCat
            minorCat
            cover
            images
        }
    }
`;

function CMSAddProduct({ links = [] }: { links: linksType[] }) {
    const [formData, setFormData] = useState<Record<string, any>>({
        title: '',
        desc: '',
        price: '',
        cost: '',
        costCount: 1,
        count: 0,
        discount: 0,
        showCount: 0,
        popularity: 0,
        authorId: '',
        publisher: '',
        publishDate: '',
        brand: '',
        status: 'نو',
        state: 'active',
        size: '',
        weight: '',
        majorCat: '',
        minorCat: '',
        cover: '',
        images: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleFieldChange = (field: string, value: any) => {
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFieldFocus = (field: string, value: any) => {
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error || ''
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        Object.keys(formData).forEach(field => {
            const value = formData[field];
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        try {
            if (!validateForm()) {
                const errorMessages = Object.entries(errors)
                    .filter(([_, message]) => message)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join('\n');

                alert('لطفاً خطاهای زیر را برطرف کنید:\n' + errorMessages);
                return;
            }

            setIsSaving(true);

            const input: ProductInputType = {
                title: formData.title,
                desc: formData.desc,
                price: {
                    price: Number(formData.price),
                    date: new Date().toISOString()
                },
                cost: {
                    cost: Number(formData.cost),
                    date: new Date().toISOString(),
                    count: Number(formData.costCount)
                },
                count: Number(formData.count),
                discount: {
                    discount: Number(formData.discount),
                    date: 30
                },
                showCount: Number(formData.showCount),
                popularity: Number(formData.popularity),
                authorId: formData.authorId,
                publisher: formData.publisher,
                publishDate: formData.publishDate,
                brand: formData.brand,
                status: formData.status,
                state: formData.state,
                size: formData.size,
                weight: Number(formData.weight),
                majorCat: formData.majorCat,
                minorCat: formData.minorCat,
                cover: formData.cover,
                images: formData.images
            };

            const jwt = getCookie("jwt") as string;
            const response = await fetch('http://localhost:4000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': jwt
                },
                body: JSON.stringify({
                    query: ADD_PRODUCT,
                    variables: { input }
                })
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            alert('محصول با موفقیت اضافه شد');
            setFormData({
                title: '',
                desc: '',
                price: '',
                cost: '',
                costCount: 1,
                count: 0,
                discount: 0,
                showCount: 0,
                popularity: 0,
                authorId: '',
                publisher: '',
                publishDate: '',
                brand: '',
                status: 'نو',
                state: 'active',
                size: '',
                weight: '',
                majorCat: '',
                minorCat: '',
                cover: '',
                images: []
            });
            setErrors({});

        } catch (error) {
            console.error('Error adding product:', error);
            alert('خطا در افزودن محصول: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
            <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                افزودن محصول جدید
            </h3>

            <div className="mt-5 py-4 px-8 rounded-xl">
                <div className="grid grid-cols-2 justify-between items-start gap-x-8 gap-y-4 pb-4 w-full mx-auto **:transition-all">
                    <ProductInput
                        label="عنوان"
                        value={formData.title}
                        onChange={(value) => handleFieldChange('title', value)}
                        onFocus={() => handleFieldFocus('title', formData.title)}
                        error={errors.title}
                    />

                    <ProductInput
                        label="توضیحات"
                        value={formData.desc}
                        type="textarea"
                        onChange={(value) => handleFieldChange('desc', value)}
                        onFocus={() => handleFieldFocus('desc', formData.desc)}
                        error={errors.desc}
                    />

                    <ProductInput
                        label="قیمت"
                        value={formData.price}
                        type="number"
                        onChange={(value) => handleFieldChange('price', value)}
                        onFocus={() => handleFieldFocus('price', formData.price)}
                        error={errors.price}
                    />

                    <ProductInput
                        label="قیمت خرید"
                        value={formData.cost}
                        type="number"
                        onChange={(value) => handleFieldChange('cost', value)}
                        onFocus={() => handleFieldFocus('cost', formData.cost)}
                        error={errors.cost}
                    />

                    <ProductInput
                        label="تعداد خرید"
                        value={formData.costCount}
                        type="number"
                        onChange={(value) => handleFieldChange('costCount', value)}
                        onFocus={() => handleFieldFocus('costCount', formData.costCount)}
                        error={errors.costCount}
                    />

                    <ProductInput
                        label="تخفیف"
                        value={formData.discount}
                        type="number"
                        onChange={(value) => handleFieldChange('discount', value)}
                        onFocus={() => handleFieldFocus('discount', formData.discount)}
                        error={errors.discount}
                    />

                    <ProductInput
                        label="موجودی"
                        value={formData.count}
                        type="number"
                        onChange={(value) => handleFieldChange('count', value)}
                        onFocus={() => handleFieldFocus('count', formData.count)}
                        error={errors.count}
                    />

                    <ProductInput
                        label="تعداد نمایشی"
                        value={formData.showCount}
                        type="number"
                        onChange={(value) => handleFieldChange('showCount', value)}
                        onFocus={() => handleFieldFocus('showCount', formData.showCount)}
                        error={errors.showCount}
                    />

                    <ProductInput
                        label="محبوبیت"
                        value={formData.popularity}
                        type="number"
                        onChange={(value) => handleFieldChange('popularity', value)}
                        onFocus={() => handleFieldFocus('popularity', formData.popularity)}
                        error={errors.popularity}
                    />

                    <ProductInput
                        label="نویسنده"
                        value={formData.authorId}
                        onChange={(value) => handleFieldChange('authorId', value)}
                        onFocus={() => handleFieldFocus('authorId', formData.authorId)}
                        error={errors.authorId}
                    />

                    <ProductInput
                        label="ناشر"
                        value={formData.publisher}
                        onChange={(value) => handleFieldChange('publisher', value)}
                        onFocus={() => handleFieldFocus('publisher', formData.publisher)}
                        error={errors.publisher}
                    />

                    <ProductInput
                        label="تاریخ انتشار"
                        value={formData.publishDate}
                        onChange={(value) => handleFieldChange('publishDate', value)}
                        onFocus={() => handleFieldFocus('publishDate', formData.publishDate)}
                        error={errors.publishDate}
                    />

                    <ProductInput
                        label="دسته‌بندی اصلی"
                        value={formData.majorCat}
                        onChange={(value) => handleFieldChange('majorCat', value)}
                        onFocus={() => handleFieldFocus('majorCat', formData.majorCat)}
                        error={errors.majorCat}
                    />

                    <ProductInput
                        label="دسته‌بندی فرعی"
                        value={formData.minorCat}
                        onChange={(value) => handleFieldChange('minorCat', value)}
                        onFocus={() => handleFieldFocus('minorCat', formData.minorCat)}
                        error={errors.minorCat}
                    />

                    <ProductInput
                        label="برند"
                        value={formData.brand}
                        onChange={(value) => handleFieldChange('brand', value)}
                        onFocus={() => handleFieldFocus('brand', formData.brand)}
                        error={errors.brand}
                    />

                    <ProductInput
                        label="وضعیت"
                        value={formData.status}
                        type="select"
                        options={[
                            { value: 'نو', label: 'نو' },
                            { value: 'درحد‌نو', label: 'درحد‌نو' },
                            { value: 'دسته‌دوم', label: 'دسته‌دوم' }
                        ]}
                        onChange={(value) => handleFieldChange('status', value)}
                        onFocus={() => handleFieldFocus('status', formData.status)}
                        error={errors.status}
                    />

                    <ProductInput
                        label="وضعیت نمایش"
                        value={formData.state}
                        type="select"
                        options={[
                            { value: 'active', label: 'فعال' },
                            { value: 'inactive', label: 'غیرفعال' },
                            { value: 'outOfStock', label: 'ناموجود' },
                            { value: 'comingSoon', label: 'به زودی' }
                        ]}
                        onChange={(value) => handleFieldChange('state', value)}
                        onFocus={() => handleFieldFocus('state', formData.state)}
                        error={errors.state}
                    />

                    <ProductInput
                        label="سایز"
                        value={formData.size}
                        onChange={(value) => handleFieldChange('size', value)}
                        onFocus={() => handleFieldFocus('size', formData.size)}
                        error={errors.size}
                    />

                    <ProductInput
                        label="وزن"
                        value={formData.weight}
                        type="number"
                        onChange={(value) => handleFieldChange('weight', value)}
                        onFocus={() => handleFieldFocus('weight', formData.weight)}
                        error={errors.weight}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isSaving ? 'در حال ذخیره...' : 'ذخیره محصول'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CMSAddProduct;