interface CreatePaymentParams {
    amountInRial: number;
    mobile: string;
    desc: string;
}

interface VerifyPaymentParams {
    amountInRial: number;
    authority: string;
}

export const createpayment = async ({
    amountInRial,
    mobile,
    desc
}: CreatePaymentParams) => {
    try {
        const res = await fetch(process.env.ZARINPAL_API_BASE_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                merchant_id: process.env.ZARINPAL_MERCHANT_ID!,
                amount: amountInRial,
                description: desc,
                callback_url: process.env.ZARINPAL_API_CALLBACK!,
                metadata: { mobile },
            }),
        }).then((res) => res.json());

        return {
            authority: res.data.authority,
            paymentURL: `${process.env.ZARINPAL_PAYMENT_URL}${res.data.authority}`,
        };
    } catch (error) {
        console.error('Error in createpayment:', error);
        throw new Error("Payment creation failed");
    }
};

export const verifypayment = async ({
    amountInRial,
    authority
}: VerifyPaymentParams) => {
    try {
        const res = await fetch(process.env.ZARINPAL_API_VERIFY!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                merchant_id: process.env.ZARINPAL_MERCHANT_ID!,
                amount: amountInRial,
                authority,
            }),
        }).then((res) => res.json());

        return res;
    } catch (error) {
        console.error('Error in verifypayment:', error);
        throw new Error("Payment verification failed");
    }
};