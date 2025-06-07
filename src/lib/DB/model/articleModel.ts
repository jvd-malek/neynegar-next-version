import mongoose from "mongoose";

// _id will added at server
export const articleSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Types.ObjectId,
        ref: "authors",
        required: true,
    },
    title: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    minorCat: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    majorCat: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    desc: {
        type: String,
        required: true,
        minLength: 10,
    },
    content: {
        type: String,
        required: true,
    },
    cover: {
        type: String,
        required: true,
    },
    imgs: {
        type: String,
        required: true,
    },
    popularity: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    }
}, { timestamps: true })

articleSchema.virtual("comments", {
    ref: 'comments',
    localField: '_id',
    foreignField: 'articleId'
})

const articleModel = mongoose.models.articles || mongoose.model("articles", articleSchema)

export default articleModel;