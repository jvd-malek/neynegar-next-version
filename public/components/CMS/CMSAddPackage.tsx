'use client';

// react
import { useCallback, useState } from 'react';

// utils
import { notify } from '@/public/utils/notify';
import { fetcher, imageUploader } from '@/public/utils/fetcher';
import { handleClearForm, handleClearInput, handleFormValidator, Input } from '@/public/components/login/Input';
import { state, status } from '@/public/utils/cms/variables';

// queries and types
import { CREATE_PACKAGE } from '@/public/graphql/packageQueries';
import { linksType } from '@/public/types/links';
import { formType } from '@/public/types/input';


function CMSAddPackage({ links = [] }: { links: linksType[] }) {

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [products, setProducts] = useState<{ product: string, quantity: number }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false)

    // حالت‌های فرم
    const [formData, setFormData] = useState<formType[]>([
        {
            name: "title",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: "عنوان باید بین 3 تا 60 کاراکتر باشد"
        },
        {
            name: "desc",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: "توضیحات باید بین 3 تا 600 کاراکتر باشد"
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
            errorMessage: 'وضعیت بسته الزامی است'
        },
        {
            name: "category",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'دسته‌بندی الزامی است'
        },
        {
            name: "brand",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: 'دسته‌بندی فرعی الزامی است'
        },
        {
            name: "discount",
            type: "text",
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
            name: "productId",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        },
        {
            name: "quantity",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: ""
        }
    ]);

    const handleSubmit = useCallback(async () => {
        if (!handleFormValidator(formData)) return;

        setIsSubmitting(true);
        try {

            // upload and add cover
            let cover = ""

            // Handle file uploads
            if (imageFiles && imageFiles.length > 0) {
                const fileFormData = new FormData();

                // Add cover image
                if (imageFiles[0]) {
                    fileFormData.append('cover', imageFiles[0]);
                }

                try {
                    const fileResult = await imageUploader(fileFormData);

                    if (fileResult && typeof fileResult === 'object') {
                        cover = fileResult.cover || '';
                    }

                } catch (parseError) {
                    console.error('Error parsing file upload response:', parseError);
                    throw new Error('Invalid response from file upload server');
                }
            }

            // Create product data
            const productData = {
                title: formData[0].value,
                desc: formData[1].value,
                status: formData[2].value,
                state: formData[3].value,
                category: formData[4].value,
                brand: formData[5].value,
                discount: {
                    discount: Number(formData[6].value),
                    date: Number(formData[7].value) * 24 * 60 * 60 * 1000 + Date.now()
                },
                products,
                totalSell: 0,
                cover
            };

            await fetcher(CREATE_PACKAGE, { input: productData });

            notify("پکیج با موفقیت ذخیره شد.", 'success');
        } catch (error) {
            console.log(error);
            notify("عدم برقراری ارتباط با سرور", 'error');
        } finally {
            handleClearForm(setFormData)
            setImageFiles([])
            setPreviewUrls([])
            setProducts([])
            setIsSubmitting(false);
        }
    }, [formData]);

    const productHandler = () => {
        setProducts(perv => ([...perv, { product: formData[8].value, quantity: +formData[9].value }]))
        handleClearInput(setFormData, "productId")
        handleClearInput(setFormData, "quantity")
    }

    return (
        <div className="bg-white relative rounded-lg p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2">

            <h3 className="text-xl font-bold">
                افزودن پکیج جدید
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
                        تصویر پکیج
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
                    ثبت اطلاعات
                </button>

                <div className="col-start-1 col-end-2 row-start-2 flex flex-col gap-2 mt-4 w-full md:pb-6 h-full">
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[0].name}
                            label="عنوان"
                            form={formData[0]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            autoFocus
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
                            required
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[2].name}
                            label="وضعیت"
                            form={formData[2]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={status}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[3].name}
                            label="وضعیت نمایش"
                            form={formData[3]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={state}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[4].name}
                            label="دسته‌بندی"
                            form={formData[4]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={[
                                { value: "", label: "--انتخاب کنید--" },
                                ...links.find(l => l.txt === "پکیج‌ها")?.subLinks?.map((l: any) => ({
                                    value: l.link,
                                    label: l.link
                                })) || []
                            ]}
                        />
                    </div>
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={formData[5].name}
                            label="دسته‌بندی فرعی"
                            form={formData[5]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={[
                                { value: "", label: "--دسته‌بندی را انتخاب کنید--" },
                                ...links.find(l => l.txt === "پکیج‌ها")
                                    ?.subLinks.find(sl => sl.link === formData[4].value)
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
                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData[6].name}
                            label="درصد تخفیف"
                            form={formData[6]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                        <Input
                            id={formData[7].name}
                            label="مدت تخفیف (روز)"
                            form={formData[7]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center">
                        <Input
                            id={formData[8].name}
                            label="آیدی محصول"
                            form={formData[8]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                        <Input
                            id={formData[9].name}
                            label="تعداد"
                            form={formData[9]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                        />
                    </div>

                    <button
                        type='button'
                        disabled={isSubmitting}
                        onClick={productHandler}
                        aria-label="افزودن محصول به پکیج"
                        className="font-bold px-4 py-4 w-full transition-all bg-black hover:bg-slate-900 rounded-lg text-white border-b-4 border-slate-700 active:border-white active:translate-y-1 cursor-pointer"
                    >
                        افزودن محصول
                    </button>

                    {products.length > 0 &&
                        <div className="w-full p-2 flex-col flex justify-center items-center gap-2">
                            {products.map(product => (
                                <div
                                    key={product.product}
                                    className="w-full bg-mist-200 font-bold text-black p-2 rounded-lg flex justify-between items-center"
                                >
                                    <div className="flex gap-4 items-center">
                                        <p className="">آیدی: {product.product}</p>
                                        <p className="">{product.quantity} عدد</p>
                                    </div>
                                    <button
                                        type='button'
                                        disabled={isSubmitting}
                                        onClick={() => setProducts(perv =>
                                            perv.filter(p => p.product !== product.product)
                                        )}
                                        aria-label="افزودن محصول به پکیج"
                                        className="font-bold px-2 py-1 bg-red-300 text-red-700 cursor-pointer rounded-lg"
                                    >
                                        حذف
                                    </button>
                                </div>
                            ))}
                        </div>
                    }

                </div>

            </form>
            {/* <div className="md:col-span-2 col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            افزودن لینک داخلی به توضیحات
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <InternalLinkSelector
                                    type="article"
                                    placeholder="جستجوی مقاله..."
                                    onSelect={(link) => {
                                        handleFieldChange('desc', formData.desc + '\n' + link);
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <InternalLinkSelector
                                    type="product"
                                    placeholder="جستجوی محصول..."
                                    onSelect={(link) => {
                                        handleFieldChange('desc', formData.desc + '\n' + link);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            افزودن لینک اینستاگرام به توضیحات
                        </label>
                        <div className="flex-1">
                            <input
                                type='text'
                                value={formData.instaLink}
                                placeholder="لینک پست اینستاگرام"
                                onChange={(e) => {
                                    const link = e.target.value
                                    handleFieldChange('desc', formData.desc + '\n' + "مشاهده تصاویر این محصول در اینستاگرام" + '\n' + `[${formData.title}](${link})`);
                                }}
                                className={`rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${!formData?.title && 'opacity-50 cursor-not-allowed'}`}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 col-span-1">
                        <LinkPreview
                            content={formData.desc || ''}
                            title="پیش‌نمایش لینک‌های توضیحات"
                        />
                    </div> */}




        </div>
    );
}

export default CMSAddPackage;