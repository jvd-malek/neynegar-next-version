// react
import { memo, useCallback, useState } from "react";

// validation
import { validateDescription, validatePrice, validateTitle } from "@/public/validation/productValidation";

// utils
import { handleFormValidator, Input, placeholderForRequired } from "@/public/components/login/Input";
import { state, status } from "@/public/utils/cms/variables";
import { notify } from "@/public/utils/notify";

// mui components
import Modal from '@mui/material/Modal';

// types
import { formType } from "@/public/types/input";
import { linksType } from "@/public/types/links";
import { Product } from "@/public/types/product";

interface CMSProductCartProps {
    product: Product;
    links: linksType[];
    authors: any[];
    onSave: (id: string, input: any) => Promise<void>;
    onDelete: (id: string) => void;
    onImageClick: (product: Product) => void;
}

const CMSProductCart: React.FunctionComponent<CMSProductCartProps> = memo(({ product, links, authors, onSave, onDelete, onImageClick }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [features, setFeatures] = useState(product.features ?? []);
    const [featuresModalOpen, setFeaturesModalOpen] = useState("");
    const Authors = authors.map(author => (
        {
            label: author.fullName || author.lastname,
            value: author._id
        }
    ))
    
    // حالت‌های فرم
    const [formData, setFormData] = useState<Record<string, formType>>(() => {
        const lastPrice = product.price[product.price.length - 1].price;
        const lastCost = product.cost[product.cost.length - 1];
        const lastDiscount = product.discount[product.discount.length - 1];
        const isDiscountActive = lastDiscount?.date > Date.now();
        const discountValue = isDiscountActive ? lastDiscount.discount : 0;
        const discountDuration = isDiscountActive
            ? Math.ceil((lastDiscount.date - Date.now()) / 24 / 60 / 60 / 1000)
            : 30;

        return {
            title: {
                name: "title",
                type: "text",
                value: product.title,
                validateRule: validateTitle,
                error: false,
                errorMessage: "عنوان باید بین 3 تا 60 کاراکتر باشد"
            },
            desc: {
                name: "desc",
                type: "text",
                value: product.desc,
                validateRule: validateDescription,
                error: false,
                errorMessage: "توضیحات باید بین 3 تا 600 کاراکتر باشد"
            },
            price: {
                name: "price",
                type: "number",
                value: lastPrice,
                validateRule: validatePrice,
                error: false,
                errorMessage: "قیمت باید به تومان باشد"
            },
            cost: {
                name: "cost",
                type: "number",
                value: lastCost?.cost,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            costCount: {
                name: "costCount",
                type: "number",
                value: lastCost?.count || 1,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            count: {
                name: "count",
                type: "number",
                value: product.count,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            showCount: {
                name: "showCount",
                type: "number",
                value: product.showCount,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            discount: {
                name: "discount",
                type: "number",
                value: discountValue,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            date: {
                name: "date",
                type: "number",
                value: discountDuration,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            majorCat: {
                name: "majorCat",
                type: "text",
                value: product.majorCat,
                validateRule: null,
                error: false,
                errorMessage: 'دسته‌بندی اصلی الزامی است'
            },
            minorCat: {
                name: "minorCat",
                type: "text",
                value: product.minorCat,
                validateRule: null,
                error: false,
                errorMessage: 'دسته‌بندی فرعی الزامی است'
            },
            brand: {
                name: "brand",
                type: "text",
                value: product.brand,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            status: {
                name: "status",
                type: "text",
                value: product.status,
                validateRule: null,
                error: false,
                errorMessage: 'وضعیت کیفیت بسته الزامی است'
            },
            state: {
                name: "state",
                type: "text",
                value: product.state ?? 'active',
                validateRule: null,
                error: false,
                errorMessage: 'وضعیت نمایش بسته الزامی است'
            },
            weight: {
                name: "weight",
                type: "number",
                value: product.weight,
                validateRule: null,
                error: false,
                errorMessage: "وزن محصول الزامی است"
            },
            authorId: {
                name: "authorId",
                type: "text",
                value: product.authorId?._id || "",
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            publisher: {
                name: "publisher",
                type: "text",
                value: product.publisher,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            publishDate: {
                name: "publishDate",
                type: "text",
                value: product.publishDate,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            size: {
                name: "size",
                type: "text",
                value: product.size,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            totalSell: {
                name: "totalSell",
                type: "number",
                value: product.totalSell || 0,
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            popularity: {
                name: "popularity",
                type: "number",
                value: product.popularity || 5,
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
            },
            productLink: {
                name: "productLink",
                type: "text",
                value: "",
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            productTitle: {
                name: "productTitle",
                type: "text",
                value: "",
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            articleLink: {
                name: "articleLink",
                type: "text",
                value: "",
                validateRule: null,
                error: false,
                errorMessage: ""
            },
            articleTitle: {
                name: "articleTitle",
                type: "text",
                value: "",
                validateRule: null,
                error: false,
                errorMessage: ""
            }
        }
    }
    );

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

    const handleSaveClick = useCallback(async () => {
        const formsArray = Object.values(formData);
        if (!handleFormValidator(formsArray)) return; // notify errors

        setIsSubmitting(true)
        const getValue = (field: string) => formData[field]?.value ?? '';

        const input: any = {
            title: getValue("title"),
            desc: getValue("desc"),
            count: Number(getValue("count")),
            showCount: Number(getValue("showCount")),
            popularity: Number(getValue("popularity")),
            publisher: getValue("publisher"),
            publishDate: getValue("publishDate"),
            majorCat: getValue("majorCat"),
            minorCat: getValue("minorCat"),
            brand: getValue("brand"),
            status: getValue("status"),
            state: getValue("state") || 'active',
            size: getValue("size"),
            weight: Number(getValue("weight")),
            cover: product.cover,
            images: product.images,
        };

        // Feature change detection
        const newFeatures = features;
        if (newFeatures.length > 0) {
            input.features = newFeatures
        }

        // FAQ change detection
        const newFaq = getValue("faqTemplateIds") ? [`${getValue("faqTemplateIds")}`] : []
        if (newFaq.length > 0) {
            input.faqTemplateIds = newFaq
        }

        // Author change detection
        const currentAuthorId = product.authorId?._id ?? '';
        const newAuthorId = getValue("authorId");
        if (currentAuthorId != newAuthorId) {
            input.authorId = newAuthorId
        }

        // Price change detection
        const currentPrice = product.price[product.price.length - 1]?.price ?? 0;
        const newPrice = Number(getValue("price"));
        if (newPrice !== currentPrice) {
            input.price = { price: newPrice, date: new Date().toISOString() };
        }

        // Cost change detection
        const currentCost = product.cost[product.cost.length - 1]?.cost ?? 0;
        const currentCostCount = product.cost[product.cost.length - 1]?.count ?? 1;
        const newCost = Number(getValue("cost"));
        const newCostCount = Number(getValue("costCount"));
        if (newCost !== currentCost || newCostCount !== currentCostCount) {
            input.cost = { cost: newCost, count: newCostCount, date: new Date().toISOString() };
        }

        // Discount change detection
        const lastDiscount = product.discount[product.discount.length - 1];
        const currentDiscount = lastDiscount?.discount ?? 0;
        const currentDuration = lastDiscount?.date > Date.now()
            ? Math.ceil((lastDiscount.date - Date.now()) / 86400000)
            : 30;
        const newDiscount = Number(getValue("discount"));
        const newDuration = Number(getValue("discountDuration"));
        if (newDiscount !== currentDiscount || newDuration !== currentDuration) {
            input.discount = { discount: newDiscount, date: newDuration };
        }

        await onSave(product._id, input);
        setIsSubmitting(false)
    }, [formData, product, onSave]);

    // Validate all fields before saving
    const hasErrors = Object.values(formData).some(f => f.error);

    const copyHandler = () => {
        navigator.clipboard.writeText(product._id);
        notify("لینک این محصول در حافظه شما کپی شد.", "success");
    };


    return (
        <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between items-center gap-2">
                <img
                    src={`https://api.neynegar1.ir/uploads/${product.cover}`}
                    alt=""
                    className='w-20 rounded-lg h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity'
                    onClick={() => onImageClick(product)}
                    loading='lazy'
                />
                <div className="flex justify-center items-center flex-col">
                    <h2 className="md:text-lg text-sm font-bold line-clamp-2">{product.title.split("|")[0].trim()}</h2>
                    {/* Action buttons */}
                    <div className="flex justify-end gap-2 mt-4 self-end">
                        <button
                            className="px-2 py-1 rounded text-sm text-white bg-cyan-500 hover:bg-cyan-600"
                            onClick={copyHandler}
                        >
                            آیدی
                        </button>
                        <button
                            className={`px-2 py-1 rounded text-sm text-white ${hasErrors ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                            onClick={handleSaveClick}
                            disabled={hasErrors || isSubmitting}
                        >
                            ذخیره
                        </button>
                        <button
                            className="bg-red-500 cursor-pointer text-sm text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => onDelete(product._id)}
                            disabled={isSubmitting}
                        >
                            حذف
                        </button>
                    </div>
                </div>

            </div>

            {/* Scrollable fields */}
            <div className="overflow-x-auto scrollable-section relative">
                <div className="flex gap-4 sm:pb-4 w-max">

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            label="عنوان"
                            id={`title-${product._id}`}
                            form={formData.title}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder="عنوان باید بین 3 تا 60 کاراکتر باشد."
                            required
                            box
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            label="توضیحات"
                            id={`desc-${product._id}`}
                            form={formData.desc}
                            setForm={arraySetForm}
                            type="textarea"
                            disabled={isSubmitting}
                            placeholder="توضیحات باید بین 3 تا 600 کاراکتر باشد."
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            label="قیمت فعلی"
                            id={`price-${product._id}`}
                            form={formData.price}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("قیمت فروش")}
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center w-fit h-fit">
                        <Input
                            box
                            label="موجودی"
                            id={`count-${product._id}`}
                            form={formData.count}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد انبار")}
                            required
                        />
                        <Input
                            box
                            label="تعداد نمایشی"
                            id={`showCount-${product._id}`}
                            form={formData.showCount}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد نمایشی")}
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center w-fit h-fit">
                        <Input
                            box
                            label="قیمت خرید"
                            id={`cost-${product._id}`}
                            form={formData.cost}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("قیمت خرید")}
                            required
                        />
                        <Input
                            box
                            label="تعداد خرید"
                            id={`costCount-${product._id}`}
                            form={formData.costCount}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("تعداد خرید")}
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center w-fit h-fit">
                        <Input
                            box
                            label="درصد تخفیف"
                            id={`discount-${product._id}`}
                            form={formData.discount}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                        <Input
                            box
                            label="مدت تخفیف"
                            id={`discountDuration-${product._id}`}
                            form={formData.date}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`majorCat-${product._id}`}
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

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`minorCat-${product._id}`}
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

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`brand-${product._id}`}
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

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`status-${product._id}`}
                            label="وضعیت"
                            form={formData.status}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={status}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`state-${product._id}`}
                            label="وضعیت نمایش"
                            form={formData.state}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            required
                            type='select'
                            options={state}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`weight-${product._id}`}
                            label="وزن"
                            form={formData.weight}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            placeholder={placeholderForRequired("وزن")}
                            required
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`authorId-${product._id}`}
                            label="نویسنده"
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

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`publisher-${product._id}`}
                            label="ناشر"
                            form={formData.publisher}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`publishDate-${product._id}`}
                            label="تاریخ انتشار"
                            form={formData.publishDate}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`size-${product._id}`}
                            label="سایز"
                            form={formData.size}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            label="محبوبیت"
                            id={`popularity-${product._id}`}
                            form={formData.popularity}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            label="میزان فروش"
                            id={`totalSell-${product._id}`}
                            form={formData.totalSell}
                            setForm={arraySetForm}
                            disabled={true}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            id={`faqTemplateIds-${product._id}`}
                            label="لینک FAQ"
                            form={formData.faqTemplateIds}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center w-fit h-fit">
                        <Input
                            box
                            id={`feature-key-${product._id}`}
                            label="عنوان ویژگی"
                            form={formData.featureKey}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                        <Input
                            box
                            type="features"
                            id={`feature-value-${product._id}`}
                            label="مقدار ویژگی"
                            form={formData.featureValue}
                            setForm={arraySetForm}
                            setFeatures={setFeatures}
                            disabled={isSubmitting}
                            titleForm={formData.featureKey}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center w-fit h-fit">
                        <Input
                            box
                            id={`article-title-${product._id}`}
                            label="عنوان مقاله"
                            form={formData.articleTitle}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                        <Input
                            box
                            type="internal-link"
                            id={`article-link-${product._id}`}
                            label="لینک مقاله"
                            form={formData.articleLink}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            descForm={formData.desc}
                            titleForm={formData.articleTitle || formData.title}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg flex justify-between gap-2 items-center w-fit h-fit">
                        <Input
                            box
                            id={`product-title-${product._id}`}
                            label="عنوان محصول"
                            form={formData.productTitle}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                        />
                        <Input
                            box
                            type="internal-link"
                            id={`product-link-${product._id}`}
                            label="لینک محصول"
                            form={formData.productLink}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            descForm={formData.desc}
                            titleForm={formData.productTitle || formData.title}
                        />
                    </div>

                    <div className="bg-black p-2 rounded-lg w-fit h-fit">
                        <Input
                            box
                            type="instagram-link"
                            id={`instagram-${product._id}`}
                            label="لینک اینستاگرام"
                            form={formData.instagramLink}
                            setForm={arraySetForm}
                            disabled={isSubmitting}
                            descForm={formData.desc}
                            titleForm={formData.title}
                        />
                    </div>

                    <button
                        className="px-2 py-1 rounded text-sm text-white bg-cyan-500 hover:bg-cyan-600"
                        onClick={() => setFeaturesModalOpen(product._id)}
                    >
                        لیست ویژگی‌ها
                    </button>
                </div>
            </div>

            {/* Image Edit Modal */}
            <Modal
                open={featuresModalOpen == product._id}
                onClose={() => {
                    setFeaturesModalOpen("");
                }}
            >
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[95vw] h-[80vh] overflow-y-scroll scroll-smooth scrollbar-hidden flex flex-col justify-between" dir="rtl">
                    <div>
                        <h3 className="text-lg font-bold mb-4">لیست ویژگی‌های محصول</h3>
                        {features.length > 0 ?
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
                            </div> :
                            <p className="bg-gray-800 p-2 rounded text-blue-400 font-medium text-sm">هنوز ویژگی اضافه نکرده‌اید.</p>
                        }
                    </div>
                </div>
            </Modal>
        </div>
    );
})

export default CMSProductCart;