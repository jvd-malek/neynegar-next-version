// utils
import { fetcher } from "@/public/utils/fetcher";
import { notify } from "@/public/utils/notify";

// queris and types
import { GET_USER_BY_PHONE, SEND_VERIFICATION_CODE, VERIFY_CODE } from "@/public/graphql/userQueries";


export const IsUserExists = async (
    phone: string
) => {

    try {
        const data = await fetcher(GET_USER_BY_PHONE, {
            phone
        });

        if (data.userByPhone) {
            return data.userByPhone.name
        } else {
            return null
        }

    } catch (error: any) {
        console.error('Error in user check:', error);
        notify(error.message || 'خطا در بررسی شماره', "error");
    }
};

export const sendVerificationCode = async (name: string, phone: string) => {
    try {
        await fetcher(SEND_VERIFICATION_CODE, {
            name: name,
            phone: phone
        });
    } catch (error: any) {
        notify(error.message || 'خطا در ارسال کد');
    }
}

export const verifyCode = async (name: string, phone: string, code: string, basketCookie: string) => {
    try {

        // دریافت سبد خرید کاربر از کوکی ها در حالت میهمان
        // اضافه کردن به سبد خرید کاربر لاگین شده
        let basket = [];
        try {
            if (basketCookie) {
                basket = JSON.parse(basketCookie);
                basket = basket.map((item: any) => ({
                    productId: item.productId || item._id,
                    packageId: item.packageId,
                    count: item.count
                }));
            }
        } catch (e) {
            basket = [];
        }

        const nameToSend = name ? name : 'کاربر جدید';
        const variables: any = {
            phone: phone,
            code: code,
            name: nameToSend,
            basket: basket
        };

        const data = await fetcher(VERIFY_CODE, variables);

        const token = data?.verifyCode?.token;
        return token ? token : null
    } catch (error: any) {
        notify(error.message || 'کد نامعتبر است', "error");
    }
}