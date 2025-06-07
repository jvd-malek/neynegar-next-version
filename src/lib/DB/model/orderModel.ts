import mongoose from "mongoose";

// _id will added at server
// this model doesnt need virtual relationship
export const orderSchema = new mongoose.Schema({
    products: {
        type: [{
            productId: { type: mongoose.Types.ObjectId, ref: "products", },
            price: Number,
            discount: Number,
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
        default:0,
    },
    status: {
        default: "پرداخت نشده",
        type: String,
    },
    paymentId: {
        type: String,
        default: "",
    },
    authority: {
        type: String,
        required: true,
    },
    postVerify: {
        default: "",
        type: String,
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
    }
}, { timestamps: true })

const orderModel = mongoose.models.orders || mongoose.model("orders", orderSchema);

export default orderModel;