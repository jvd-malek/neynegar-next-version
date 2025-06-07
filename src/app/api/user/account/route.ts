import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/DB/db';
import { authMiddleware } from '@/lib/middleware/authMiddleware';
import orderModel from '@/lib/DB/model/orderModel';
import commentModel from '@/lib/DB/model/commentModel';
import ticketModel from '@/lib/DB/model/ticketModel';

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        await dbConnect(); // اتصال به دیتابیس
        const authResult = await authMiddleware(req);

        if (authResult.status !== 200) {
            return NextResponse.json(authResult.response, { status: authResult.status });
        }

        const user = authResult.user;

        const orders = await orderModel
            .find({ userId: user._id })
            .lean()
            .populate('products.productId')
            .exec();

        const tickets = await ticketModel.find({ userId: user._id }).lean();

        const comments = await commentModel
            .find({ userId: user._id })
            .populate('replies.userId')
            .populate('productId')
            .populate('articleId')
            .exec();

        return NextResponse.json(
            { orders, comments, tickets, user, state: true },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ error: error, state: false });
    }
}
