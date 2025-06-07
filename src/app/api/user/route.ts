import dbConnect from '@/lib/DB/db';
import userModel from '@/lib/DB/model/userModel';
import { SignJWT } from "jose"
import { cookies } from 'next/headers';
import { Types } from 'mongoose';
import { authMiddleware } from '@/lib/middleware/authMiddleware';
import { NextResponse } from 'next/server';
const secret = new TextEncoder().encode("jkdsgfke408b67j79vmisde4vtgu");

interface BasketItem {
    productId: string;
    count: number;
    showCount: number;
    // سایر ویژگی‌های مورد نیاز
}

interface RequestBody {
    basket?: BasketItem[];
    status?: string;
    favorite?: boolean;
}

async function createToken(payload: { id: Types.ObjectId }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' }) // الگوریتم رمزنگاری
        .setIssuedAt() // زمان ایجاد توکن
        .setExpirationTime('90day') // انقضا (مثلاً 2 ساعت)
        .sign(secret); // امضا با کلید مخفی
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        // const isBodyValid = validator(reqBody)
        // if (isBodyValid != true) {
        //     return Response.json(isBodyValid, { status: 422 })
        // }
        const reqBody = await req.json()
        const cookieStore = await cookies();

        const { name, phone } = reqBody

        const isUserExists: any = await userModel.findOne({
            phone
        }).lean()

        if (isUserExists) {
            const accessToken = await createToken({ id: isUserExists._id })

            const response = Response.json(
                { msg: "User logged in successfully" },
                { status: 200 }
            );

            cookieStore.set({
                name: 'abs',
                value: accessToken,
                path: '/',
                maxAge: 60 * 60 * 24 * 90 // 90 days
            });

            console.log(response);

            return response
        }

        const user = await userModel.create({
            status: "user",
            name,
            phone,
            bascket: [],
            discount: [],
            totalBuy: 0,
        })

        const accessToken = await createToken({ id: user._id })

        cookieStore.set('jwt', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 90 // 90 days
        });

        return Response.json(
            { msg: "User created successfully", user },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error:", error);
        return Response.json({ msg: "Database error", error }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();

        const reqBody: RequestBody = await req.json();
        const authResult = await authMiddleware(req);

        if (authResult.status !== 200) {
            return NextResponse.json(authResult.response, { status: authResult.status });
        }

        const user = authResult.user;
        
        // بهینه‌سازی ادغام سبد خرید
        const mergedBasket = reqBody.basket?.reduce<BasketItem[]>((acc, currentItem) => {
            const existingItem = acc.find(item => item.productId == currentItem.productId);

            if (existingItem) {
                if (existingItem.count < currentItem.showCount) {
                    existingItem.count += currentItem.count;
                } else {
                    existingItem.count = currentItem.showCount;
                }
            } else {
                acc.push({ ...currentItem });
            }

            return acc;
        }, [...(user.bascket || [])]) || user.bascket;

        console.log(mergedBasket);
        // به‌روزرسانی کاربر
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            {
                bascket: mergedBasket,
                status: reqBody.status ?? user.status,
                favorite: reqBody.favorite ?? user.favorite,
            },
            { new: true, lean: true }
        );

        
        if (!updatedUser) {
            return NextResponse.json(
                { message: "کاربر یافت نشد", success: false },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                basket: mergedBasket,
                success: true,
                updatedFields: {
                    statusUpdated: reqBody.status !== undefined,
                    favoriteUpdated: reqBody.favorite !== undefined,
                    basketUpdated: reqBody.basket !== undefined
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("خطا در به‌روزرسانی پروفایل:", error);
        return NextResponse.json(
            { message: "خطای سرور در پردازش درخواست", success: false },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const authResult = await authMiddleware(req);

        if (authResult.status !== 200) {
            return Response.json(authResult.response, { status: authResult.status });
        }

        const user = authResult.user;

        if (user) {
            return Response.json({ user, state: true }, { status: 200 })
        } else {
            return Response.json({ msg: "user does not exist", state: false }, { status: 404 })
        }

    } catch (error) {
        console.error("Error:", error);
        return Response.json({ msg: "Database error", error }, { status: 500 });
    }
}
