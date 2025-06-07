import mongoose from "mongoose";

// _id will added at server
export const userSchema = new mongoose.Schema({
    status: { // user - admin - owner - banUser - notifUser (allow us to send notif)
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20,
    },
    name: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 60,
    },
    email: {
        type: String,
        minLength: 10,
        maxLength: 30,
    },
    phone: {
        type: String,
        required: true,
        max: 11,
    },
    discount: {
        type: [{ code: String, date: Number, discount: Number }],
    },
    bascket: {
        type: [{
            productId: { type: mongoose.Types.ObjectId, ref: "products", },
            count: Number
        }],
        required: true,
    },
    favorite: [{
        productId: { type: mongoose.Types.ObjectId, ref: "products", }
    }],
    address: {
        type: String,
        minLength: 10,
        maxLength: 500,
    },
    postCode: {
        type: Number,
    },
    totalBuy: {
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

userSchema.virtual("totalPrice").get(function () {
    return this.bascket.reduce((total, item: any) => {
        if (item.productId.discount[item.productId.discount.length - 1].discount > 0) {
            return total + (item.count * (item.productId.price[item.productId.price.length - 1].price * ((100 - item.productId.discount[item.productId.discount.length - 1].discount) / 100)))
        } else {
            return total + (item.count * item.productId.price[item.productId.price.length - 1].price)
        }
    }, 0)
})

userSchema.virtual("totalDiscount").get(function () {
    return this.bascket.reduce((total, item: any) => {
        if (item.productId.discount[item.productId.discount.length - 1].discount > 0) {
            return total + (item.count * (item.productId.price[item.productId.price.length - 1].price * ((item.productId.discount[item.productId.discount.length - 1].discount) / 100)))
        } else {
            return 0
        }
    }, 0)
})

userSchema.virtual("totalWeigth").get(function () {
    return this.bascket.reduce((total, item: any) => {
        return total + (item.productId.weight * item.count)
    }, 0)
})

const userModel = mongoose.models.users || mongoose.model("users", userSchema);

export default userModel;