import dbConnect from '@/lib/DB/db';
import productModel from '@/lib/DB/model/productModel';
import { isValidObjectId } from 'mongoose';

export async function GET(
    req: Request,
    { params }: any
): Promise<Response> {
    try {
        // اتصال به دیتابیس
        await dbConnect();

        // بررسی معتبر بودن ID
        const { id } = await params;
        if (!isValidObjectId(id)) {
            return Response.json({ error: 'شناسه محصول نامعتبر است' }, { status: 400 });
        }

        // دریافت محصول با اطلاعات مرتبط
        const product = await productModel
            .findById(id)
            .populate([
                { path: 'authorId' },
                { path: 'authorArticleId', select: '_id desc' },
                { path: 'publisherArticleId', select: '_id desc' },
                { path: 'productArticleId', select: '_id desc' },
                {
                    path: 'comments',
                    populate: [
                        { path: 'userId' },
                        { path: 'replies.userId' }
                    ]
                }
            ])
            .exec();

        if (!product) {
            return Response.json({ error: 'محصول یافت نشد' }, { status: 404 });
        }

        return Response.json({
            product,
            comments: product.comments
        }, {
            status: 200
        });

    } catch (error) {
        console.error('خطا در دریافت محصول:', error);
        return Response.json(
            { error: 'خطای سرور در پردازش درخواست' },
            { status: 500 }
        );
    }
}
