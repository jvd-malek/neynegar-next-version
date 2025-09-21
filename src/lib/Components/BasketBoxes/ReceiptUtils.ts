// app/utils/receiptUtils.ts
import { getCookie } from 'cookies-next';

interface BasketForm {
    name: string;
    state: string;
    city: string;
    address: string;
    shipment: string;
    discountCode?: string;
    phone?: string;
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
    const today = new Date().toLocaleDateString('fa-IR')

    // Read applied discount (if any) from cookie to mirror UI calculations
    // Also check if discountCode is passed directly (for CMS orders)
    const discountCookie = getCookie('discountCode');
    let discountPercent = 0;
    let discountCode = basketForm?.discountCode || '';
    
    if (discountCookie && !basketForm?.discountCode) {
        try {
            const parsed = JSON.parse(discountCookie as string);
            discountPercent = Number(parsed?.percent) || 0;
            discountCode = String(parsed?.code || '');
        } catch (e) { /* noop */ }
    }

    const baseTotal = basketForm?.shipment === "پست" ? data.grandTotal : data.total;
    const extraDiscount = Math.floor(baseTotal * discountPercent / 100);
    const finalPayable = Math.floor(baseTotal * (100 - discountPercent) / 100);

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
${basketForm?.phone ? `تلفن: ${basketForm.phone}` : ''}
${basketForm?.state}/${basketForm?.city}
${basketForm?.address}
نحوه ارسال: ${basketForm?.shipment === "bike" ? "ارسال با پیک" : "ارسال با پست"}

محصولات:
${productsText}

جمع کل: ${data.subtotal.toLocaleString('fa-IR')} تومان
تخفیف${discountCode ? ` (کد: ${discountCode})` : ''}: ${(data.totalDiscount + extraDiscount).toLocaleString('fa-IR')} تومان
هزینه ارسال: ${basketForm?.shipment === "پست" ? `${data.shippingCost.toLocaleString('fa-IR')} تومان` : "دریافت هزینه در مقصد"}
مبلغ نهایی: ${finalPayable.toLocaleString('fa-IR')} تومان

از سفارش شما سپاس‌گذاریم. ❤️`;
};