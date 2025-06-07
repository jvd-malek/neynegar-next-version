import productModel from '@/lib/DB/model/productModel';
import { NextResponse } from 'next/server';

type Params = {
    majorCat?: string;
    minorCat?: string[];
};

export async function GET(
    req: Request,
    { params }: any
) {
    try {
        const { majorCat, minorCat } = await params;

        // حالت جستجو
        if (majorCat === 'search' && minorCat?.[0]) {
            const searchQuery = minorCat[0];
            const regex = new RegExp(searchQuery, 'i');
            const products = await productModel
                .find({ title: { $regex: regex } })
                .select('_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount')
                .sort({ popularity: -1, _id: -1 })
                .lean();

            return NextResponse.json(products, { status: 200 });
        }

        //   حالت حراجستون با محدودیت
        if (majorCat === 'حراجستون' && minorCat?.[0]) {
            const products = await productModel
                .find({ 'discount.discount': { $gt: 0 } })
                .limit(+minorCat?.[0])
                .select('_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount')
                .sort({ popularity: -1, _id: -1 })
                .lean();

            return NextResponse.json(products, { status: 200 });
        }

        // حالت حراجستون
        if (majorCat === 'حراجستون') {
            const products = await productModel
                .find({ 'discount.discount': { $gt: 0 } })
                .select('_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount')
                .sort({ popularity: -1, _id: -1 })
                .lean();

            return NextResponse.json(products, { status: 200 });
        }


        // حالت‌های مختلف دسته‌بندی
        let query: any = {};
        
        if (majorCat) query.majorCat = majorCat;
        if (minorCat?.length) query.minorCat = minorCat[0];

        const products = await productModel
            .find(query)
            .select('_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount')
            .sort({ popularity: -1, _id: -1 })
            .lean();

        return NextResponse.json(products, { status: 200 });

    } catch (error) {
        console.error('Error in products route:', error);
        return NextResponse.json(
            { error: 'خطا در دریافت محصولات' },
            { status: 500 }
        );
    }
}