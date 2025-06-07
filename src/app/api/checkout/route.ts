import { NextResponse } from "next/server";
import { createpayment, verifypayment } from "@/lib/middleware/zarinpal";
import checkoutModel from "@/lib/DB/model/checkoutModel";
import moment from "jalali-moment";
import orderModel from "@/lib/DB/model/orderModel";
import dbConnect from "@/lib/DB/db";
import { authBasketMiddleware } from "@/lib/middleware/authMiddleware";

interface RequestBody {
    shipment: string;
    discount: number;
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        const token = req.headers.get('authorization')
        const body: RequestBody = await req.json();
        const { shipment, discount } = body;

        const authResult = await authBasketMiddleware(token as string);

        if (authResult.status !== 200) {
            return Response.json(authResult.response, { status: authResult.status });
        }

        const data: any = authResult.response;
        const amountInRial = ((shipment == "post" ? data.grandTotal : data.total) - discount) * 10

        const payment = await createpayment({
            amountInRial,
            mobile: data.user.phone,
            desc: `سفارش با شناسه ${data.user._id}`
        });

        const check = await checkoutModel.create({
            products: data.user.bascket,
            submition: shipment,
            totalPrice: amountInRial,
            totalWeigth: data.totalWeight,
            discount: data.totalDiscount,
            userId: data.user._id,
            authority: payment.authority
        });

        const validOrderProducts = data.basket.map((p: any) => ({
            count: p.count,
            productId: p.productId._id,
            price: p.currentPrice,
            discount: p.currentDiscount
        })) || [];

        await orderModel.create({
            userId: data.user._id,
            products: validOrderProducts,
            submition: check.submition,
            totalPrice: check.totalPrice,
            totalWeigth: check.totalWeigth,
            discount: check.discount,
            authority: check.authority,
            createdAt: moment().locale("fa").format("YYYY/M/D")
        });

        return NextResponse.json(payment, { status: 200 });
    } catch (error) {
        console.error('Error in checkout POST:', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const authority = searchParams.get('authority');

        if (!authority) {
            return NextResponse.json(
                { error: "Authority parameter is required" },
                { status: 400 }
            );
        }

        const check = await checkoutModel.findOne({ authority });

        if (!check) {
            return NextResponse.json(
                { error: "Checkout not found" },
                { status: 404 }
            );
        }

        const payment = await verifypayment({
            amountInRial: check.totalPrice,
            authority: check.authority
        });

        return NextResponse.json(payment, { status: 200 });
    } catch (error) {
        console.error('Error in checkout GET:', error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}