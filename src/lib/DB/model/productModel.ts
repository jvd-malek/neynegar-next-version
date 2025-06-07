import mongoose from "mongoose";

// _id will added at server
export const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 60,
    },
    desc: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 600,
    },
    price: {
        type: [{ price: Number, date: String }],
        required: true,
    },
    cost: {
        type: [{ cost: Number, date: String, count: Number }],
        default: [],
    },
    discount: {
        type: [{ discount: Number, date: Number }],
        default: [{ discount: 0, date: 0 }]
    },
    count: {
        type: Number,
        required: true,
    },
    showCount: {
        type: Number,
        required: true,
    },
    totalSell: {
        type: Number,
        required: true,
    },
    popularity: {
        type: Number,
        required: true,
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        ref: "authors",
    },
    authorArticleId: {
        type: mongoose.Types.ObjectId,
        ref: "articles",
    },
    publisherArticleId: {
        type: mongoose.Types.ObjectId,
        ref: "articles",
    },
    productArticleId: {
        type: mongoose.Types.ObjectId,
        ref: "articles",
    },
    publisher: {
        type: String,
        default: '',
        maxLength: 60,
    },
    publishDate: {
        type: String,
        default: '',
        maxLength: 60,
    },
    brand: {
        type: String,
        default: '',
        maxLength: 60,
    },
    status: {
        type: String,
        required: true,
        maxLength: 60,
    },
    size: {
        type: String,
        default: '',
        maxLength: 60,
    },
    weight: {
        type: Number,
        required: true,
        min: 50,
    },
    majorCat: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 60,
    },
    minorCat: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 60,
    },
    cover: {
        type: String,
        required: true,
    },
    imgs: {
        type: String,
        default: ''
    },
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    }
}, { timestamps: true })

productSchema.virtual("comments", {
    ref: 'comments',
    localField: '_id',
    foreignField: 'productId'
})

const productModel = mongoose.models.products || mongoose.model("products", productSchema)

export default productModel;
