import { ValidationRule } from '@/types/product';

const validationRules: Record<string, ValidationRule> = {
    title: {
        required: true,
        minLength: 3,
        maxLength: 100,
        message: 'عنوان باید بین 3 تا 100 کاراکتر باشد'
    },
    desc: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        message: 'توضیحات باید بین 10 تا 1000 کاراکتر باشد'
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
        min: 1,
        message: 'تعداد خرید باید حداقل 1 باشد'
    },
    count: {
        required: true,
        min: 0,
        message: 'موجودی نمی‌تواند منفی باشد'
    },
    discount: {
        min: 0,
        max: 100,
        message: 'تخفیف باید بین 0 تا 100 درصد باشد'
    },
    showCount: {
        required: true,
        min: 0,
        message: 'تعداد نمایشی نمی‌تواند منفی باشد'
    },
    popularity: {
        min: 0,
        max: 100,
        message: 'محبوبیت باید بین 0 تا 100 باشد'
    },
    authorId: {
        required: true,
        message: 'نویسنده الزامی است'
    },
    publisher: {
        required: true,
        message: 'ناشر الزامی است'
    },
    publishDate: {
        required: true,
        message: 'تاریخ انتشار الزامی است'
    },
    brand: {
        required: true,
        message: 'برند الزامی است'
    },
    status: {
        required: true,
        message: 'وضعیت الزامی است'
    },
    state: {
        required: true,
        message: 'وضعیت نمایش الزامی است'
    },
    size: {
        required: true,
        message: 'سایز الزامی است'
    },
    weight: {
        required: true,
        min: 0,
        message: 'وزن باید بزرگتر از صفر باشد'
    },
    majorCat: {
        required: true,
        message: 'دسته‌بندی اصلی الزامی است'
    },
    minorCat: {
        required: true,
        message: 'دسته‌بندی فرعی الزامی است'
    }
};

export const validateField = (field: string, value: any): string | null => {
    const rules = validationRules[field];
    if (!rules) return null;

    if (rules.required && (value === undefined || value === null || value === '')) {
        return rules.message || 'این فیلد الزامی است';
    }

    if (value === undefined || value === null || value === '') {
        return null;
    }

    if (rules.minLength && value.length < rules.minLength) {
        return rules.message || `حداقل طول باید ${rules.minLength} کاراکتر باشد`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
        return rules.message || `حداکثر طول باید ${rules.maxLength} کاراکتر باشد`;
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
        return rules.message || `حداقل مقدار باید ${rules.min} باشد`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
        return rules.message || `حداکثر مقدار باید ${rules.max} باشد`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
        return rules.message || 'فرمت نامعتبر است';
    }

    return null;
}; 