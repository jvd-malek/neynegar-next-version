// app/utils/receiptUtils.ts

import moment from 'jalali-moment';

interface BasketForm {
    name: string;
    state: string;
    city: string;
    address: string;
    shipment: string;
}

interface Product {
    productId: {
        title: string;
        price: Array<{ price: number }>;
    };
    count: number;
    price?: number;
}

interface ReceiptData {
    subtotal: number;
    totalDiscount: number;
    total: number;
    shippingCost: number;
    grandTotal: number;
}

export const generateReceiptText = (
    products: Product[],
    data: ReceiptData,
    basketForm: BasketForm
): string => {
    const today = moment().locale('fa').format('jD jMMMM jYYYY');

    const productsText = products.map(p =>
        `${p.productId.title} (${p.count.toLocaleString('fa-IR')} عدد): ${p.price ? p.price.toLocaleString('fa-IR') :
            p.productId.price.toLocaleString('fa-IR')
        } تومان`
    ).join('\n');

    return `فروشگاه نی‌نگار
    
**پیش فاکتور**

تاریخ: ${today}
مشخصات گیرنده:
${basketForm?.name}
${basketForm?.state}/${basketForm?.city}
${basketForm?.address}
نحوه ارسال: ${basketForm?.shipment === "bike" ? "ارسال با پیک" : "ارسال با پست"}

محصولات:
${productsText}

جمع کل: ${data.subtotal.toLocaleString('fa-IR')} تومان
تخفیف: ${data.totalDiscount.toLocaleString('fa-IR')} تومان
هزینه ارسال: ${basketForm?.shipment === "post" ? `${data.shippingCost.toLocaleString('fa-IR')} تومان` : "دریافت هزینه در مقصد"}
مبلغ نهایی: ${(basketForm?.shipment === "post" ? data.grandTotal : data.total).toLocaleString('fa-IR')} تومان

از سفارش شما سپاس‌گذاریم. ❤️`;
};