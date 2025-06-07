import { productSingleType } from "./product"
import { userType } from "./user"

export type orderType = {
    _id: string,
    userId?: userType,
    createdAt?: string,
    updatedAt?: string,
    status: string,
    products: {
        count: number,
        price: Number,
        discount: Number,
        productId: productSingleType
    }[],
    submition: string,
    totalPrice: number,
    discount: number,
    paymentId: string,
    postVerify?: string
}