import { ValidationRule } from '@/types/product';

const validationRules: Record<string, ValidationRule> = {
    title: {
        required: true,
        minLength: 3,
        maxLength: 60,
        message: 'عنوان محصول باید بین 3 تا 60 کاراکتر باشد'
    },
    desc: {
        required: true,
        minLength: 3,
        maxLength: 600,
        message: 'توضیحات محصول باید بین 3 تا 600 کاراکتر باشد'
    },
    price: {
        required: true,
        min: 0,
        message: 'قیمت نمی‌تواند منفی باشد'
    },
    cost: {
        required: true,
        min: 0,
        message: 'هزینه نمی‌تواند منفی باشد'
    },
    count: {
        required: true,
        min: 0,
        message: 'تعداد محصول نمی‌تواند منفی باشد'
    },
    showCount: {
        required: true,
        min: 0,
        message: 'تعداد نمایش نمی‌تواند منفی باشد'
    },
    totalSell: {
        min: 0,
        message: 'تعداد کل فروش نمی‌تواند منفی باشد'
    },
    popularity: {
        required: true,
        min: 0,
        message: 'محبوبیت نمی‌تواند منفی باشد'
    },
    // authorId: {
    //     required: true,
    //     message: 'نویسنده الزامی است'
    // },
    publisher: {
        maxLength: 60,
        message: 'نام ناشر نمی‌تواند بیشتر از 60 کاراکتر باشد'
    },
    publishDate: {
        maxLength: 60,
        message: 'تاریخ انتشار نمی‌تواند بیشتر از 60 کاراکتر باشد'
    },
    brand: {
        maxLength: 60,
        message: 'نام برند نمی‌تواند بیشتر از 60 کاراکتر باشد'
    },
    status: {
        required: true,
        maxLength: 60,
        message: 'وضعیت کیفیت محصول الزامی است',
        pattern: /^(نو|درحد‌نو|دسته‌دوم)$/,
        patternMessage: 'وضعیت باید یکی از موارد نو، درحد‌نو یا دسته‌دوم باشد'
    },
    state: {
        required: true,
        maxLength: 60,
        message: 'وضعیت محصول الزامی است',
        pattern: /^(active|inactive|outOfStock|comingSoon)$/,
        patternMessage: 'وضعیت باید یکی از موارد active، inactive، outOfStock یا comingSoon باشد'
    },
    size: {
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
        message: 'دسته‌بندی اصلی الزامی است'
    },
    minorCat: {
        required: true,
        message: 'دسته‌بندی فرعی الزامی است'
    },
    imageFiles: {
        required: true,
        message: 'حداقل یک تصویر برای محصول الزامی است'
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
        return rules.patternMessage || rules.message || 'فرمت نامعتبر است';
    }

    return null;
}; 