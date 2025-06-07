import { NextResponse } from 'next/server';
import dbConnect from "@/lib/DB/db";
import productModel from '@/lib/DB/model/productModel';
import mongoose from 'mongoose';

interface PriceEntry {
    price: number;
    date: string;
}

interface DiscountEntry {
    discount: number;
    date: number;
}

interface BasketItem {
    count: number;
    productId: string;
}

interface EnrichedBasketItem {
    count: number
    productId: any; // می‌توانید اینترفیس دقیق‌تری تعریف کنید
    currentPrice: number
    currentDiscount: number
    itemTotal: number
    itemDiscount: number
    itemWeight: number
}

interface ApiResponse {
    basket: EnrichedBasketItem[]
    subtotal: number
    totalDiscount: number
    total: number
    totalWeight: number
    shippingCost: number
    grandTotal: number
    state: boolean
}

function getCurrentPrice(prices: PriceEntry[]): number {
    if (!prices || prices.length === 0) return 0;
    // آخرین قیمت (آخرین عنصر آرایه)
    return prices[prices.length - 1].price;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { basket }: { basket: BasketItem[] } = await request.json();

        if (!basket || !Array.isArray(basket)) {
            return NextResponse.json(
                { error: 'سبد خرید الزامی است و باید آرایه باشد' },
                { status: 400 }
            );
        }

        const productIds = basket.map(item => new mongoose.Types.ObjectId(item.productId));

        const products = await productModel.find({
            _id: { $in: productIds }
        }).lean();

        let subtotal = 0;
        let totalDiscount = 0;
        let total = 0;
        let totalWeight = 0;

        const isDiscountValid = (discount: DiscountEntry) => {
            if (!discount || !discount.date) return false;
            const now = Date.now();
            const discountDate = discount.date
            return now <= discountDate;
        };

        const enrichedBasket: EnrichedBasketItem[] = basket.map(item => {
            const product: any = products.find((p: any) => p._id.toString() === item.productId);

            if (!product) {
                return {
                    count: item.count,
                    productId: null,
                    currentPrice: 0,
                    currentDiscount: 0,
                    itemTotal: 0,
                    itemDiscount: 0,
                    itemWeight: 0
                };
            }

            const latestPriceEntry = product.price[product.price.length - 1];
            const latestDiscountEntry = product.discount[product.discount.length - 1];

            const currentPrice = latestPriceEntry?.price || 0;
            const currentDiscount = isDiscountValid(latestDiscountEntry) ? (latestDiscountEntry?.discount || 0) : 0;
            const productWeight = product.weight || 0;

            const itemDiscountAmount = currentPrice * (currentDiscount / 100);
            const itemTotal = (currentPrice - itemDiscountAmount) * item.count;
            const itemWeight = productWeight * item.count;

            subtotal += currentPrice * item.count;
            totalDiscount += itemDiscountAmount * item.count;
            total += itemTotal;
            totalWeight += itemWeight;

            return {
                count: item.count,
                productId: {
                    _id: product._id.toString(),
                    title: product.title,
                    desc: product.desc,
                    weight: product.weight,
                    cover: product.cover,
                    brand: product.brand,
                    status: product.status,
                    majorCat: product.majorCat,
                    minorCat: product.minorCat,
                    popularity: product.popularity,
                    price: currentPrice,
                    discount: currentDiscount,
                    discountRaw: product.discount,
                    showCount: product.showCount
                },
                currentPrice,
                currentDiscount,
                itemTotal,
                itemDiscount: itemDiscountAmount * item.count,
                itemWeight
            };
        });

        const shippingCost = (totalWeight * 7) + 70000;

        const response: ApiResponse = {
            basket: enrichedBasket,
            subtotal,
            totalDiscount,
            total,
            totalWeight,
            shippingCost,
            grandTotal: total + shippingCost,
            state: true
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'خطا در دریافت اطلاعات محصولات از دیتابیس' },
            { status: 500 }
        );
    }
}