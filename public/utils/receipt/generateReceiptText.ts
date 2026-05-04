// utils
import { getCookie } from 'cookies-next';

// types
import { UserBasket } from '@/public/types/user';

interface BasketForm {
    name: string;
    state: string;
    city: string;
    address: string;
    shipment: string;
    discountCode?: string;
    phone?: string;
    postCode?: string;
}

interface ReceiptData {
    subtotal: number;
    totalDiscount: number;
    total: number;
    shippingCost: number;
    grandTotal: number;
}

export const generateReceiptText = (
    products: UserBasket[],
    data: ReceiptData,
    basketForm: BasketForm,
    isBeforePayment?: boolean
): string => {
    const today = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(Number()))


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

    const productsText = products.map(product => {
        const price = Number(product.currentPrice);
        const discount = Number(product.currentDiscount);
        const count = Number(product.count);
        const finalPrice = price * (100 - discount) / 100 * count;
        const isPackage = product.packageId ? true : false
        const title = isPackage ? product.packageId.title : product.productId.title
        return `${title} (${count.toLocaleString('fa-IR')} عدد): ${finalPrice.toLocaleString('fa-IR')} تومان`
    }).join('\n');

    return `فروشگاه نی‌نگار
    
${isBeforePayment ? "**پیش فاکتور**" : "**فاکتور**"}

تاریخ: ${today}
مشخصات گیرنده:
${basketForm?.name}
${basketForm?.phone ? `تلفن: ${basketForm.phone}` : ''}
${basketForm?.postCode ? `کد پستی: ${basketForm.postCode}` : ''}
${basketForm?.state}/${basketForm?.city}
${basketForm?.address}
نحوه ارسال: ${basketForm?.shipment === "پیک" ? "ارسال با پیک" : "ارسال با پست"}

محصولات:
${productsText}

جمع کل: ${data.subtotal.toLocaleString('fa-IR')} تومان
تخفیف${discountCode ? ` (کد: ${discountCode})` : ''}: ${(data.totalDiscount + extraDiscount).toLocaleString('fa-IR')} تومان
هزینه ارسال: ${basketForm?.shipment === "پست" ? `${data.shippingCost.toLocaleString('fa-IR')} تومان` : "دریافت هزینه در مقصد"}
مبلغ نهایی: ${finalPayable.toLocaleString('fa-IR')} تومان

از سفارش شما سپاس‌گذاریم. ❤️`;
};