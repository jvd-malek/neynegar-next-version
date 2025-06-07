import productModel from '@/lib/DB/model/productModel';
import { NextResponse } from 'next/server';

export async function GET() {
    const products = await productModel
        .find({})
        .select(
            '_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount'
        )
        .sort({ popularity: -1, _id: -1 })
        .lean();

    return NextResponse.json(products, { status: 200 });
}
