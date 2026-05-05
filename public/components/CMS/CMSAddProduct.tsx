'use client';

// react
import { useCallback, useState } from 'react';

// utils
import { notify } from '@/public/utils/notify';
import { fetcher, imageUploader } from '@/public/utils/fetcher';
import { handleChangeForm, handleClearForm, handleFormValidator, Input, placeholderForRequired } from '@/public/components/login/Input';
import { state, status } from '@/public/utils/cms/variables';

// validation
import { validateDescription, validatePrice, validateTitle } from "@/public/validation/productValidation";

// queries and types
import { linksType } from '@/public/types/links';
import InternalLinkSelector from '@/public/components/CMS/InternalLinkSelector';
import LinkPreview from '@/public/components/CMS/LinkPreview';
import { formType } from '@/public/types/input';
import { Feature } from '@/public/types/product';
import { CREATE_PRODUCT } from '@/public/graphql/productQueries';

type CMSAddProductProps = {
    links: linksType[],
    authors: {
        _id: string
        firstname: string
        lastname: string
        fullName?: string
    }[]
}

function CMSAddProduct({ links = [], authors = [] }: CMSAddProductProps) {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [features, setFeatures] = useState<Feature[]>([]);
    const Authors = authors.map(author => (
        {
            label: author.fullName || author.lastname,
            value: author._id
        }
    ))

    // حالت‌های فرم
    const [formData, setFormData] = useState<Record<string, formType>>({
        title: {
            name: "title",
            type: "text",
            value: "",
            validateRule: validateTitle,
            error: false,
            errorMessage: "عنوان باید بین 3 تا 60 کاراکتر باشد"
        },
        desc: {
            name: "desc",
            type: "text",
            value: "",
            validateRule: validateDescription,
            error: false,
            errorMessage: "توضیحات باید بین 3 تا 600 کاراکتر باشد"
        },
        price: {
            name: "price",
            type: "number",
            value: "",
            validateRule: validatePrice,
            error: false,
            errorMessage: "قیمت باید به تومان باشد"
        },
        cost: {
            name: "cost",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        costCount: {
            name: "costCount",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        count: {
            name: "count",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        showCount: {
            name: "showCount",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        discount: {
            name: "discount",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        date: {
            name: "date",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        majorCat: {
            name: "majorCat",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'دسته‌بندی اصلی الزامی است'
        },
        minorCat: {
            name: "minorCat",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'دسته‌بندی فرعی الزامی است'
        },
        brand: {
            name: "brand",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        status: {
            name: "status",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'وضعیت کیفیت بسته الزامی است'
        },
        state: {
            name: "state",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'وضعیت نمایش بسته الزامی است'
        },
        weight: {
            name: "weight",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: "وزن محصول الزامی است"
        },
        authorId: {
            name: "authorId",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        publisher: {
            name: "publisher",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        publishDate: {
            name: "publishDate",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        size: {
            name: "size",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        featureKey: {
            name: "featureKey",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        featureValue: {
            name: "featureValue",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        faqTemplateIds: {
            name: "faqTemplateIds",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        instagramLink: {
            name: "instagramLink",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        }
    });

    // A stable setForm that updates the whole forms object
    const setForm: React.Dispatch<React.SetStateAction<Record<string, formType>>> = useCallback((updater) => {
        setFormData(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            return next;
        });
    }, []);

    // For inputs that need a setForm compatible with array (like instagram-link), we wrap
    const arraySetForm: React.Dispatch<React.SetStateAction<formType[]>> = useCallback((updater) => {
        setForm(prev => {
            const asArray = Object.values(prev);
            const newArray = typeof updater === 'function' ? updater(asArray) : updater;
            const newObj: Record<string, formType> = {};
            newArray.forEach(f => newObj[f.name] = f);
            return newObj;
        });
    }, [setForm]);

    const handleSubmit = useCallback(async () => {
        const formsArray = Object.values(formData);
        if (!handleFormValidator(formsArray)) return; setIsSubmitting(true);

        const getValue = (field: string) => formData[field]?.value ?? '';

        // upload and add cover
        let cover = ""
        let images: string[] = []

        // Handle file uploads
        if (imageFiles && imageFiles.length > 0) {
            const fileFormData = new FormData();

            // Add cover image
            if (imageFiles[0]) {
                fileFormData.append('cover', imageFiles[0]);
            }

            if (imageFiles.length > 1) {
                for (let i = 1; i < imageFiles.length; i++) {
                    if (imageFiles[i]) {
                        fileFormData.append('images', imageFiles[i]);
                    }
                }
            }

            try {
                const fileResult = await imageUploader(fileFormData);

                if (fileResult && typeof fileResult === 'object') {
                    cover = fileResult.cover || '';
                    images = Array.isArray(fileResult.images) ? fileResult.images : [];
                }

            } catch (parseError) {
                console.error('Error parsing file upload response:', parseError);
                throw new Error('Invalid response from file upload server');
            }

        } else {
            notify("تصویر کاور الزامی است", "error")
            setIsSubmitting(false);
            return;
        }

        try {
            const date = new Date().toISOString()

            // Create product data
            const productData = {
                title: getValue("title"),
                desc: getValue("desc"),
                price: {
                    price: Number(getValue("price")),
                    date
                },
                cost: {
                    cost: Number(getValue("cost")),
                    date,
                    count: Number(getValue("costCount"))
                },
                count: Number(getValue("count")),
                showCount: Number(getValue("showCount")),
                discount: {
                    discount: Number(getValue("discount")),
                    date: Number(getValue("date")) * 24 * 60 * 60 * 1000 + Date.now()
                },
                majorCat: getValue("majorCat"),
                minorCat: getValue("minorCat"),
                brand: getValue("brand") || '',
                status: getValue("status"),
                state: getValue("state"),
                weight: Number(getValue("weight")) || 0,
                authorId: getValue("authorId") || null,
                publisher: getValue("publisher") || '',
                publishDate: getValue("publishDate") || '',
                size: getValue("size") || '',
                popularity: 5,
                totalSell: 0,
                images,
                cover,
                features: features.length > 0 ? features : undefined,
                faqTemplateIds: getValue("faqTemplateIds") ? [getValue("faqTemplateIds")] : undefined
            };

            await fetcher(CREATE_PRODUCT, { input: productData });

            notify("محصول با موفقیت ذخیره شد.", 'success');

            handleClearForm(arraySetForm)
            setImageFiles([])
            setPreviewUrls([])
            setFeatures([]);
            setIsSubmitting(false);

        } catch (error) {
            console.log(error);
            notify("عدم برقراری ارتباط با سرور", 'error');
            setIsSubmitting(false);
        }

    }, [formData]);

    return (
        <div className="bg-white relative rounded-lg p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2">

            <h3 className="text-xl font-bold">
                افزودن محصول جدید
            </h3>

            <form
                className="grid md:grid-cols-2 grid-cols-1  gap-4 justify-between mt-6"
                dir="rtl"
                itemScope
                itemType="https://schema.org/LoginAction"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >



                <div className="row-start-1 col-start-1 col-end-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        تصویر محصول
                        <span className='text-red-600'>*</span>
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

                <button
                    type='submit'
                    disabled={isSubmitting}
                    aria-label="ارسال فرم اطلاعات کاربر"
                    className="md:row-start-1 mt-6 font-bold md:col-start-2 h-fit px-4 md:py-2 py-4 md:w-fit w-full transition-all bg-cyan-800 hover:bg-cyan-900 rounded-lg text-white cursor-pointer"
                >
                    {isSubmitting ? 'در حال ذخیره...' : 'ذخیره محصول'}
                </button>

                <div className="col-start-1 col-end-2 row-start-2 flex flex-col gap-2 mt-4 w-full md:pb-6 h-full">

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.title.name}
                            label="عنوان"
                            form={formData.title}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder="عنوان باید بین 3 تا 60 کاراکتر باشد."
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            type='textarea'
                            id={formData.desc.name}
                            label="توضیحات"
                            form={formData.desc}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder="توضیحات باید بین 3 تا 600 کاراکتر باشد."
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.price.name}
                            label="قیمت فروش"
                            form={formData.price}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("قیمت فروش")}
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData.cost.name}
                            label="قیمت خرید"
                            form={formData.cost}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("قیمت خرید")}
                            required
                        />
                        <Input
                            id={formData.costCount.name}
                            label="تعداد خرید"
                            form={formData.costCount}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد خرید")}
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData.count.name}
                            label="تعداد انبار"
                            form={formData.count}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد انبار")}
                            required
                        />
                        <Input
                            id={formData.showCount.name}
                            label="تعداد نمایشی"
                            form={formData.showCount}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد نمایشی")}
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData.discount.name}
                            label="درصد تخفیف"
                            form={formData.discount}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                        <Input
                            id={formData.date.name}
                            label="مدت تخفیف (روز)"
                            form={formData.date}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.majorCat.name}
                            label="دسته‌بندی اصلی"
                            form={formData.majorCat}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={[
                                { value: "", label: "--انتخاب کنید--" },
                                ...links.map(l => (
                                    { value: l.txt, label: l.txt }
                                )) || []
                            ]}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.minorCat.name}
                            label="دسته‌بندی فرعی"
                            form={formData.minorCat}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={[
                                { value: "", label: "--دسته‌بندی اصلی را انتخاب کنید--" },
                                ...links.find(l => l.txt === formData.majorCat.value)?.subLinks?.map((l: any) => ({
                                    value: l.link,
                                    label: l.link
                                })) || []
                            ]}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.brand.name}
                            label="برند"
                            form={formData.brand}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            type='select'
                            options={[
                                { value: "", label: "--دسته‌بندی فرعی را انتخاب کنید--" },
                                ...links.find(l => l.txt === formData.majorCat.value)
                                    ?.subLinks.find(sl => sl.link === formData.minorCat.value)
                                    ?.brand?.filter(brand => brand !== "همه")
                                    .map((brand: string) => ({
                                        value: brand,
                                        label: brand
                                    })) || []
                            ]}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.weight.name}
                            label="وزن"
                            form={formData.weight}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("وزن")}
                            required
                        />
                    </div>

                </div>

                <div className="md:col-start-2 md:col-end-3 col-start-1 col-end-2 md:row-start-2 row-start-3 flex flex-col gap-2 md:mt-4 w-full pb-6 h-full">

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.status.name}
                            label="وضعیت"
                            form={formData.status}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={status}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.state.name}
                            label="وضعیت نمایش"
                            form={formData.state}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={state}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.authorId.name}
                            label="نویسنده (امکان افزودن نویسنده در پنل مدیریت)"
                            form={formData.authorId}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            type='select'
                            options={[
                                { value: "", label: "--انتخاب کنید--" },
                                ...Authors
                            ]}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.publisher.name}
                            label="ناشر"
                            form={formData.publisher}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.publishDate.name}
                            label="تاریخ انتشار"
                            form={formData.publishDate}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.size.name}
                            label="سایز"
                            form={formData.size}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center w-fit h-fit">
                        <Input
                            id={formData.featureKey.name}
                            label="عنوان ویژگی"
                            form={formData.featureKey}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                        <Input
                            type="features"
                            id={formData.featureValue.name}
                            label="مقدار ویژگی"
                            form={formData.featureValue}
                            setForm={arraySetForm}
                            setFeatures={setFeatures}
                            disabled={isSubmitting}
                            titleForm={formData.featureKey}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData.faqTemplateIds.name}
                            label="آیدی FAQ"
                            form={formData.faqTemplateIds}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder="آیدی قالب سوالات متداول"
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            type="instagram-link"
                            id={formData.instagramLink.name}
                            label="لینک اینستاگرام"
                            form={formData.instagramLink}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            descForm={formData.desc}
                            titleForm={formData.title}
                        />
                    </div>

                    <div className="p-2 rounded-lg flex justify-between gap-2 items-center">
                        <div className="md:col-span-2 col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                افزودن لینک داخلی به توضیحات
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <InternalLinkSelector
                                        type="article"
                                        placeholder="جستجوی مقاله..."
                                        onSelect={(link) => {
                                            const value = `${formData.desc.value}\n${link}`

                                            handleChangeForm(arraySetForm, value, formData.desc.name)
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <InternalLinkSelector
                                        type="product"
                                        placeholder="جستجوی محصول..."
                                        onSelect={(link) => {
                                            const value = `${formData.desc.value}\n${link}`

                                            handleChangeForm(arraySetForm, value, formData.desc.name)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {features.length > 0 && (
                        <div className="space-y-2 mt-2">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 bg-gray-800 p-2 rounded">
                                    <span className="text-blue-400 font-medium text-sm">{feature.key}:</span>
                                    <span className="text-white text-sm">{feature.value}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFeatures(prev => prev.filter((_, i) => i !== index))}
                                        className="mr-auto text-red-400 hover:text-red-300 text-sm"
                                        disabled={isSubmitting}
                                    >
                                        ❌ حذف
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="md:col-span-2 col-span-1">
                        <LinkPreview
                            content={`${formData.desc.value}` || ''}
                            title="پیش‌نمایش لینک‌های توضیحات"
                        />
                    </div>
                </div>

            </form>
        </div>
    );
}

export default CMSAddProduct;