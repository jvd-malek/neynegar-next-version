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
        price: number,
        discount: number,
        productId: productSingleType
    }[],
    submition: string,
    totalPrice: number,
    totalWeight: number,
    shippingCost: number,
    discount: number,
    paymentId: string,
    postVerify?: string
}

export type paginatedOrdersType = {
    orders: orderType[],
    totalPages: number,
    currentPage: number,
    total: number
}