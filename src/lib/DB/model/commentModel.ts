import mongoose from "mongoose";

// _id will added at server
export const commentSchema = new mongoose.Schema({
    txt: {
        type: String,
        required: true,
        maxLength: 1000,
    },
    status: {
        type: String,
        maxLength: 20,
    },
    star: {
        type: Number,
        required: true,
    },
    like: {
        type: Number,
        required: true,
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "products",
    },
    articleId: {
        type: mongoose.Types.ObjectId,
        ref: "articles",
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true,
    },
    replies: {
        type: [{ txt: String, userId: { type: mongoose.Types.ObjectId, ref: "users", }, like: Number, createdAt: String, updatedAt: String }],
        default: [],
    },
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    }
}, { timestamps: true })

// commentSchema.virtual("user", {
//     ref: 'users',
//     localField: 'userId',
//     foreignField: '_id'
// })

// commentSchema.virtual("replies", {
//     ref: 'replies',
//     localField: '_id',
//     foreignField: 'commentId'
// })

const commentModel = mongoose.models.comments || mongoose.model("comments", commentSchema);

export default commentModel;