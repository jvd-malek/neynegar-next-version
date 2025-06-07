import mongoose from "mongoose";

// _id will added at server
// this model doesnt need virtual relationship
export const checkoutSchema = new mongoose.Schema({
    products: {
        type: [{
            productId: { type: mongoose.Types.ObjectId, ref: "products", },
            count: Number
        }],
        required: true,
    },
    submition: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 60,
    },
    authority: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    totalWeigth: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true,
    },
    createdAt: {
        type: String,
    },
    updatedAt: {
        type: String,
    },
    expiredAt: {
        type: Date,
        required: true,
        default: () => Date.now() + (60 * 60 * 1000)
    }
}, { timestamps: true })

checkoutSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })

const checkoutModel = mongoose.models.checkouts || mongoose.model("checkouts", checkoutSchema);

export default checkoutModel;