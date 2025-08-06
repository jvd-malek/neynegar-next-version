'use client';

import { useState } from 'react';
import ProductInput, { DiscountInput } from './ProductInput';
import SearchableAuthorSelect from './SearchableAuthorSelect';
import { validateField } from '@/lib/validation/productValidation';
import { getCookie } from 'cookies-next';
import { linksType } from '@/lib/Types/links';

const ADD_PRODUCT = `
    mutation CreateProduct ($input: ProductInput!) {
        createProduct (input: $input) {
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
            size
            weight
            majorCat
            minorCat
            cover
            images
        }
    }
`;


function CMSAddProduct({ links = [], authors = [] }: { links: linksType[], authors: any }) {
    const [formData, setFormData] = useState<Record<string, any>>({
        title: '',
        desc: '',
        price: '',
        cost: '',
        costCount: "",
        count: "",
        discount: "",
        discountDuration: "30",
        showCount: "",
        popularity: 5,
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

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showErrorBox, setShowErrorBox] = useState(false);

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

        // Validate all form fields
        Object.keys(formData).forEach(field => {
            const value = formData[field];
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        // Validate imageFiles separately
        if (imageFiles.length === 0) {
            newErrors.imageFiles = 'حداقل یک تصویر برای محصول الزامی است';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        try {
            console.log('Starting handleSubmit...');
            console.log('Current imageFiles:', imageFiles);

            if (!validateForm()) {
                setShowErrorBox(true);
                return;
            }

            setIsSaving(true);

            // Initialize uploaded files object
            const uploadedFiles = {
                cover: '',
                images: [] as string[]
            };

            // Handle file uploads
            if (imageFiles && imageFiles.length > 0) {
                console.log('Processing image files...');
                const fileFormData = new FormData();

                // Add cover image
                if (imageFiles[0]) {
                    console.log('Adding cover image:', imageFiles[0].name);
                    fileFormData.append('cover', imageFiles[0]);
                }

                // Add additional images
                if (imageFiles.length > 1) {
                    console.log('Adding additional images...');
                    for (let i = 1; i < imageFiles.length; i++) {
                        if (imageFiles[i]) {
                            console.log('Adding image:', imageFiles[i].name);
                            fileFormData.append('images', imageFiles[i]);
                        }
                    }
                }

                // Get JWT token
                const jwt = getCookie("jwt") as string;
                if (!jwt) {
                    throw new Error('No authentication token found');
                }

                console.log('Uploading files to server...');
                const fileResponse = await fetch('https://api.neynegar1.ir/upload', {
                    method: 'POST',
                    headers: {
                        'authorization': jwt,
                        'Accept': 'application/json'
                    },
                    body: fileFormData
                });

                console.log('File upload response status:', fileResponse.status);
                const responseText = await fileResponse.text();
                console.log('File upload response text:', responseText);

                if (!fileResponse.ok) {
                    throw new Error(`Failed to upload files: ${responseText}`);
                }

                try {
                    const fileResult = JSON.parse(responseText);
                    console.log('Parsed file result:', fileResult);

                    if (fileResult && typeof fileResult === 'object') {
                        uploadedFiles.cover = fileResult.cover || '';
                        uploadedFiles.images = Array.isArray(fileResult.images) ? fileResult.images : [];
                    }
                } catch (parseError) {
                    console.error('Error parsing file upload response:', parseError);
                    throw new Error('Invalid response from file upload server');
                }
            }

            // Create product data
            const productData = {
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
                    date: Number(formData.discountDuration) * 24 * 60 * 60 * 1000 + Date.now()
                },
                showCount: Number(formData.showCount),
                totalSell: 0,
                popularity: Number(formData.popularity),
                authorId: formData.authorId || null,
                publisher: formData.publisher || '',
                publishDate: formData.publishDate || '',
                brand: formData.brand || '',
                status: formData.status || 'نو',
                state: formData.state || 'active',
                size: formData.size || '',
                weight: Number(formData.weight) || 0,
                majorCat: formData.majorCat || '',
                minorCat: formData.minorCat || '',
                cover: uploadedFiles.cover,
                images: uploadedFiles.images
            };

            console.log('Sending product data to GraphQL:', productData);
            const jwt = getCookie("jwt") as string;
            if (!jwt) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('https://api.neynegar1.ir/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': jwt
                },
                body: JSON.stringify({
                    query: ADD_PRODUCT,
                    variables: {
                        input: productData
                    }
                })
            });

            console.log('GraphQL response status:', response.status);
            const result = await response.json();
            console.log('GraphQL response:', result);

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            alert('محصول با موفقیت اضافه شد');

            // Reset form
            setFormData({
                title: '',
                desc: '',
                price: '',
                cost: '',
                costCount: "",
                count: "",
                discount: "",
                discountDuration: "30",
                showCount: "",
                popularity: 5,
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
            setImageFiles([]);
            setPreviewUrls([]);
            setErrors({});

        } catch (error: any) {
            console.error('Error in handleSubmit:', error);
            alert('خطا در افزودن محصول: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
            {showErrorBox && Object.keys(errors).length > 0 && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold mb-2">لطفاً خطاهای زیر را برطرف کنید:</h3>
                            <ul className="list-disc list-inside">
                                {Object.entries(errors)
                                    .filter(([_, message]) => message)
                                    .map(([field, message]) => (
                                        <li key={field} className="mb-1">
                                            {message}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => setShowErrorBox(false)}
                            className="text-red-700 hover:text-red-900 font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                افزودن محصول جدید
            </h3>

            <div className="mt-5 py-4 px-8 rounded-xl">
                <div className="grid md:grid-cols-2 grid-cols-1 justify-between items-start gap-x-8 gap-y-4 pb-4 w-full mx-auto **:transition-all duration-200">
                    <ProductInput
                        form
                        label="عنوان"
                        value={formData.title}
                        onChange={(value) => handleFieldChange('title', value)}
                        onFocus={() => handleFieldFocus('title', formData.title)}
                        error={errors.title}
                    />

                    <ProductInput
                        form
                        label="توضیحات"
                        value={formData.desc}
                        type="textarea"
                        onChange={(value) => handleFieldChange('desc', value)}
                        onFocus={() => handleFieldFocus('desc', formData.desc)}
                        error={errors.desc}
                    />

                    <ProductInput
                        form
                        label="قیمت"
                        value={formData.price}
                        type="number"
                        onChange={(value) => handleFieldChange('price', value)}
                        onFocus={() => handleFieldFocus('price', formData.price)}
                        error={errors.price}
                    />

                    <ProductInput
                        form
                        label="قیمت خرید"
                        value={formData.cost}
                        type="number"
                        onChange={(value) => handleFieldChange('cost', value)}
                        onFocus={() => handleFieldFocus('cost', formData.cost)}
                        error={errors.cost}
                    />

                    <ProductInput
                        form
                        label="تعداد خرید"
                        value={formData.costCount}
                        type="number"
                        onChange={(value) => handleFieldChange('costCount', value)}
                        onFocus={() => handleFieldFocus('costCount', formData.costCount)}
                        error={errors.costCount}
                    />


                    <DiscountInput
                        discount={formData.discount}
                        duration={formData.discountDuration}
                        onDiscountChange={(value) => handleFieldChange('discount', value)}
                        onDurationChange={(value) => handleFieldChange('discountDuration', value)}
                        onFocus={handleFieldFocus}
                        errors={errors}
                        form
                    />

                    <ProductInput
                        form
                        label="موجودی"
                        value={formData.count}
                        type="number"
                        onChange={(value) => handleFieldChange('count', value)}
                        onFocus={() => handleFieldFocus('count', formData.count)}
                        error={errors.count}
                    />

                    <ProductInput
                        form
                        label="تعداد نمایشی"
                        value={formData.showCount}
                        type="number"
                        onChange={(value) => handleFieldChange('showCount', value)}
                        onFocus={() => handleFieldFocus('showCount', formData.showCount)}
                        error={errors.showCount}
                    />

                    <ProductInput
                        form
                        label="محبوبیت"
                        value={formData.popularity}
                        type="number"
                        onChange={(value) => handleFieldChange('popularity', value)}
                        onFocus={() => handleFieldFocus('popularity', formData.popularity)}
                        error={errors.popularity}
                    />

                    <SearchableAuthorSelect
                        value={formData.authorId}
                        onChange={(value) => handleFieldChange('authorId', value)}
                        onFocus={() => handleFieldFocus('authorId', formData.authorId)}
                        error={errors.authorId}
                        authors={authors}
                        form
                    />

                    <ProductInput
                        form
                        label="ناشر"
                        value={formData.publisher}
                        onChange={(value) => handleFieldChange('publisher', value)}
                        onFocus={() => handleFieldFocus('publisher', formData.publisher)}
                        error={errors.publisher}
                    />

                    <ProductInput
                        form
                        label="تاریخ انتشار"
                        value={formData.publishDate}
                        onChange={(value) => handleFieldChange('publishDate', value)}
                        onFocus={() => handleFieldFocus('publishDate', formData.publishDate)}
                        error={errors.publishDate}
                    />

                    <ProductInput
                        form
                        label="دسته‌بندی اصلی"
                        value={formData.majorCat}
                        onChange={(value) => handleFieldChange('majorCat', value)}
                        onFocus={() => handleFieldFocus('majorCat', formData.majorCat)}
                        error={errors.majorCat}
                        type="select"
                        options={[
                            { value: "", label: "__ انتخاب کنید __" },
                            ...links.map(l => (
                                { value: l.txt, label: l.txt }
                            ))]
                        }
                    />

                    <ProductInput
                        form
                        label="دسته‌بندی فرعی"
                        value={formData.minorCat}
                        onChange={(value) => handleFieldChange('minorCat', value)}
                        onFocus={() => handleFieldFocus('minorCat', formData.minorCat)}
                        error={errors.minorCat}
                        type="select"
                        disabled={!formData.majorCat}
                        options={[
                            { value: "", label: "دسته‌بندی اصلی را انتخاب کنید" },
                            ...links.find(l => l.txt === formData.majorCat)?.subLinks?.map((l: any) => ({
                                value: l.link,
                                label: l.link
                            })) || []]
                        }
                    />

                    <ProductInput
                        form
                        label="برند"
                        value={formData.brand}
                        onChange={(value) => handleFieldChange('brand', value)}
                        onFocus={() => handleFieldFocus('brand', formData.brand)}
                        error={errors.brand}
                        type="select"
                        disabled={!formData.majorCat || !formData.minorCat}
                        options={[
                            { value: "", label: "دسته‌بندی فرعی را انتخاب کنید" },
                            ...links.find(l => l.txt === formData.majorCat)
                                ?.subLinks.find(sl => sl.link === formData.minorCat)
                                ?.brand?.filter(brand => brand !== "همه")
                                .map((brand: string) => ({
                                    value: brand,
                                    label: brand
                                })) || []]
                        }
                    />

                    <ProductInput
                        form
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
                        form
                        label="وضعیت نمایش"
                        value={formData.state}
                        type="select"
                        options={[
                            { value: 'active', label: 'فعال' },
                            { value: 'inactive', label: 'غیرفعال' },
                            { value: 'outOfStock', label: 'ناموجود' },
                            { value: 'comingSoon', label: 'به زودی' },
                            { value: 'callForPrice', label: 'تماس بگیرید' }
                        ]}
                        onChange={(value) => handleFieldChange('state', value)}
                        onFocus={() => handleFieldFocus('state', formData.state)}
                        error={errors.state}
                    />

                    <ProductInput
                        form
                        label="سایز"
                        value={formData.size}
                        onChange={(value) => handleFieldChange('size', value)}
                        onFocus={() => handleFieldFocus('size', formData.size)}
                        error={errors.size}
                    />

                    <ProductInput
                        form
                        label="وزن"
                        value={formData.weight}
                        type="number"
                        onChange={(value) => handleFieldChange('weight', value)}
                        onFocus={() => handleFieldFocus('weight', formData.weight)}
                        error={errors.weight}
                    />

                    <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            تصاویر محصول
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setImageFiles(prev => [...prev, ...files]);

                                // Create preview URLs
                                const newPreviewUrls = files.map(file => URL.createObjectURL(file));
                                setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
                            }}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-black file:text-white
                                hover:file:bg-gray-800"
                        />
                        {errors.imageFiles && (
                            <p className="mt-1 text-sm text-red-600">{errors.imageFiles}</p>
                        )}
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