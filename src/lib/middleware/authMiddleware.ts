import { jwtVerify } from 'jose';
import { isValidObjectId } from 'mongoose';
import userModel from '@/lib/DB/model/userModel';
import dbConnect from '../DB/db';

const secret = new TextEncoder().encode("jkdsgfke408b67j79vmisde4vtgu");

export async function authMiddleware(req: Request) {
    try {
        await dbConnect()
        const token = req.headers.get('authorization')

        if (!token) {
            return { status: 403, response: { msg: 'This API is protected', state: false } };
        }

        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256']
        });


        if (isValidObjectId(payload.id)) {
            const user = await userModel.findById(payload.id)
                .populate('favorite.productId')
                .exec();

            if (!user) {
                return { status: 404, response: { msg: 'User not found', state: false } };
            }

            return { status: 200, user }; // اطلاعات کاربر را برگردانید
        }

        return { status: 403, response: { msg: 'Invalid token payload', state: false } };
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return { status: 403, response: { msg: 'Authentication failed', state: false } };
    }
}

export async function authBasketMiddleware(token: string) {
    try {
        await dbConnect()

        if (!token) {
            return { status: 403, response: { msg: 'This API is protected', state: false } };
        }

        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256']
        });

        if (isValidObjectId(payload.id)) {
            const user = await userModel.findById(payload.id)
            .populate({
                path: "bascket.productId",
                model: "products"
            })

            if (!user) {
                return { status: 404, response: { msg: 'User not found', state: false } };
            }
            
            // محاسبات سبد خرید با در نظر گرفتن مدل محصول
            let subtotal = 0;
            let totalDiscount = 0;
            let total = 0;
            let totalWeight = 0; // مجموع وزن کل سفارش

            const enrichedBasket = user.bascket.map((item: any) => {
                const product = item.productId;
                if (!product || !product.price || product.price.length === 0) {
                    return {
                        user,
                        count: item.count,
                        productId: null,
                        currentPrice: 0,
                        currentDiscount: 0,
                        itemTotal: 0,
                        itemDiscount: 0,
                        itemWeight: 0
                    };
                }

                // دریافت آخرین قیمت و تخفیف
                const latestPriceEntry = product.price[product.price.length - 1];
                const latestDiscountEntry = product.discount[product.discount.length - 1];

                const currentPrice = latestPriceEntry?.price || 0;
                const currentDiscount = latestDiscountEntry?.discount || 0;
                const productWeight = product.weight || 0; // وزن محصول

                const itemDiscountAmount = currentPrice * (currentDiscount / 100);
                const itemTotal = (currentPrice - itemDiscountAmount) * item.count;
                const itemWeight = productWeight * item.count; // وزن کل این آیتم

                // محاسبه جمع‌ها
                subtotal += currentPrice * item.count;
                totalDiscount += itemDiscountAmount * item.count;
                total += itemTotal;
                totalWeight += itemWeight; // افزودن به وزن کل

                return {
                    count: item.count,
                    productId: {
                        ...product,
                        _id: product._id.toString(),
                        price: currentPrice,
                        discount: currentDiscount,
                        weight: productWeight
                    },
                    currentPrice,
                    currentDiscount,
                    itemTotal,
                    itemDiscount: itemDiscountAmount * item.count,
                    itemWeight
                };
            });

            // محاسبه هزینه ارسال
            // فرمول: (مجموع وزن کل به گرم * 7) + 70000
            const shippingCost = (totalWeight * 7) + 70000;

            return {
                status: 200,
                response: {
                    user,
                    basket: enrichedBasket,
                    subtotal,
                    totalDiscount,
                    total,
                    totalWeight, // وزن کل سفارش
                    shippingCost, // هزینه ارسال محاسبه شده
                    grandTotal: total + shippingCost, // جمع کل با احتساب هزینه ارسال
                    state: true
                }
            };
        }

        return { status: 403, response: { msg: 'Invalid token payload', state: false } };
    } catch (error) {
        console.error('Basket middleware error:', error);
        return { status: 403, response: { msg: 'Authentication failed', state: false } };
    }
}