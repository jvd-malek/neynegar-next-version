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
    const Authors = authors.map(author => (
        {
            label: author.fullName || author.lastname,
            value: author._id
        }
    ))

    // حالت‌های فرم
    const [formData, setFormData] = useState<formType[]>([
        {
            name: "title",
            type: "text",
            value: "",
            validateRule: validateTitle,
            error: false,
            errorMessage: "عنوان باید بین 3 تا 60 کاراکتر باشد"
        },
        {
            name: "desc",
            type: "text",
            value: "",
            validateRule: validateDescription,
            error: false,
            errorMessage: "توضیحات باید بین 3 تا 600 کاراکتر باشد"
        },
        {
            name: "price",
            type: "number",
            value: "",
            validateRule: validatePrice,
            error: false,
            errorMessage: "قیمت باید به تومان باشد"
        },
        {
            name: "cost",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "costCount",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "count",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "showCount",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "discount",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "date",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "majorCat",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'دسته‌بندی اصلی الزامی است'
        },
        {
            name: "minorCat",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'دسته‌بندی فرعی الزامی است'
        },
        {
            name: "brand",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "status",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'وضعیت کیفیت بسته الزامی است'
        },
        {
            name: "state",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'وضعیت نمایش بسته الزامی است'
        },
        {
            name: "weight",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: "وزن محصول الزامی است"
        },
        {
            name: "authorId",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "publisher",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "publishDate",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "size",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "instagramLink",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        }
    ]);

    const handleSubmit = useCallback(async () => {
        if (!handleFormValidator(formData)) return;
        setIsSubmitting(true);

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
                title: formData[0].value,
                desc: formData[1].value,
                price: {
                    price: Number(formData[2].value),
                    date
                },
                cost: {
                    cost: Number(formData[3].value),
                    date,
                    count: Number(formData[4].value)
                },
                count: Number(formData[5].value),
                showCount: Number(formData[6].value),
                discount: {
                    discount: Number(formData[7].value),
                    date: Number(formData[8].value) * 24 * 60 * 60 * 1000 + Date.now()
                },
                majorCat: formData[9].value,
                minorCat: formData[10].value,
                brand: formData[11].value || '',
                status: formData[12].value,
                state: formData[13].value,
                weight: Number(formData[14].value) || 0,
                authorId: formData[15].value || null,
                publisher: formData[16].value || '',
                publishDate: formData[17].value || '',
                size: formData[18].value || '',
                popularity: 5,
                totalSell: 0,
                images,
                cover
            };

            await fetcher(CREATE_PRODUCT, { input: productData });

            notify("محصول با موفقیت ذخیره شد.", 'success');
        } catch (error) {
            console.log(error);
            notify("عدم برقراری ارتباط با سرور", 'error');
        } finally {
            handleClearForm(setFormData)
            setImageFiles([])
            setPreviewUrls([])
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
                            id={formData[0].name}
                            label="عنوان"
                            form={formData[0]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder="عنوان باید بین 3 تا 60 کاراکتر باشد."
                            required
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            type='textarea'
                            id={formData[1].name}
                            label="توضیحات"
                            form={formData[1]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder="توضیحات باید بین 3 تا 600 کاراکتر باشد."
                            required
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[2].name}
                            label="قیمت فروش"
                            form={formData[2]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("قیمت فروش")}
                            required
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData[3].name}
                            label="قیمت خرید"
                            form={formData[3]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("قیمت خرید")}
                            required
                        />
                        <Input
                            id={formData[4].name}
                            label="تعداد خرید"
                            form={formData[4]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد خرید")}
                            required
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData[5].name}
                            label="تعداد انبار"
                            form={formData[5]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد انبار")}
                            required
                        />
                        <Input
                            id={formData[6].name}
                            label="تعداد نمایشی"
                            form={formData[6]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد نمایشی")}
                            required
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData[7].name}
                            label="درصد تخفیف"
                            form={formData[7]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                        <Input
                            id={formData[8].name}
                            label="مدت تخفیف (روز)"
                            form={formData[8]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[9].name}
                            label="دسته‌بندی اصلی"
                            form={formData[9]}
                            setForm={setFormData}
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
                            id={formData[10].name}
                            label="دسته‌بندی فرعی"
                            form={formData[10]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={[
                                { value: "", label: "--دسته‌بندی اصلی را انتخاب کنید--" },
                                ...links.find(l => l.txt === formData[9].value)?.subLinks?.map((l: any) => ({
                                    value: l.link,
                                    label: l.link
                                })) || []
                            ]}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[11].name}
                            label="برند"
                            form={formData[11]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            type='select'
                            options={[
                                { value: "", label: "--دسته‌بندی فرعی را انتخاب کنید--" },
                                ...links.find(l => l.txt === formData[9].value)
                                    ?.subLinks.find(sl => sl.link === formData[10].value)
                                    ?.brand?.filter(brand => brand !== "همه")
                                    .map((brand: string) => ({
                                        value: brand,
                                        label: brand
                                    })) || []
                            ]}
                        />
                    </div>
                </div>

                <div className="md:col-start-2 md:col-end-3 col-start-1 col-end-2 md:row-start-2 row-start-3 flex flex-col gap-2 md:mt-4 w-full pb-6 h-full">
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[12].name}
                            label="وضعیت"
                            form={formData[12]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={status}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[13].name}
                            label="وضعیت نمایش"
                            form={formData[13]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={state}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[14].name}
                            label="وزن"
                            form={formData[14]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("وزن")}
                            required
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[15].name}
                            label="نویسنده (امکان افزودن نویسنده در پنل مدیریت)"
                            form={formData[15]}
                            setForm={setFormData}
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
                            id={formData[16].name}
                            label="ناشر"
                            form={formData[16]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[17].name}
                            label="تاریخ انتشار"
                            form={formData[17]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[18].name}
                            label="سایز"
                            form={formData[18]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            type="instagram-link"
                            id={formData[19].name}
                            label="لینک اینستاگرام"
                            form={formData[19]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            descForm={formData[1]}
                            titleForm={formData[0]}
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
                                            const value = `${formData[1].value}\n${link}`

                                            handleChangeForm(setFormData, value, formData[1].name)
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <InternalLinkSelector
                                        type="product"
                                        placeholder="جستجوی محصول..."
                                        onSelect={(link) => {
                                            const value = `${formData[1].value}\n${link}`

                                            handleChangeForm(setFormData, value, formData[1].name)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 col-span-1">
                        <LinkPreview
                            content={`${formData[1].value}` || ''}
                            title="پیش‌نمایش لینک‌های توضیحات"
                        />
                    </div>
                </div>

            </form>
        </div>
    );
}

export default CMSAddProduct;