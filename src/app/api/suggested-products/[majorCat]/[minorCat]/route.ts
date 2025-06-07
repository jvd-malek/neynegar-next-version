import productModel from "@/lib/DB/model/productModel";
import { NextResponse } from "next/server";

type Params = {
    majorCat?: string;
    minorCat?: string;
};

export async function GET(
    req: Request,
    { params }: any
): Promise<Response> {

    try {
        const { majorCat, minorCat } = await params;

        if (majorCat === 'مقالات' && minorCat) {
            const products = await productModel
                .find({
                    $or: [
                        { authorArticleId: minorCat },
                        { productArticleId: minorCat },
                        { publisherArticleId: minorCat },
                    ],
                })
                .select(
                    '_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount'
                )
                .sort({ popularity: -1, _id: -1 })
                .limit(11)
                .lean();

            return NextResponse.json(products, { status: 200 });
        }

        const products = await productModel
            .find({ majorCat, minorCat })
            .select(
                '_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount'
            )
            .sort({ popularity: -1, _id: -1 })
            .limit(11)
            .lean();

        if (products.length === 0) {
            const fallbackProducts = await productModel
                .find({ majorCat })
                .select(
                    '_id title desc price discount popularity cover brand majorCat minorCat authorId count showCount'
                )
                .sort({ popularity: -1, _id: -1 })
                .limit(11)
                .lean();

            return NextResponse.json(fallbackProducts, { status: 200 });
        }

        return NextResponse.json(products, { status: 200 });

    } catch (error) {
        console.error("Error in suggested-products route:", error);
        return NextResponse.json(
            { error: "خطا در دریافت محصولات پیشنهادی" },
            { status: 500 }
        );
    }
}
