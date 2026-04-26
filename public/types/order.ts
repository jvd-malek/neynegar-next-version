import { packageCoverType } from "./package"
import { productCoverType, productType } from "./product"
import { userType } from "./user"

export type orderProductsType = {
    count: number,
    price: number,
    discount: number,
    productId: productCoverType
    packageId: packageCoverType
}

export type orderType = {
    _id: string,
    userId?: userType,
    createdAt?: string,
    updatedAt?: string,
    status: string,
    products: orderProductsType[],
    submition: string,
    totalPrice: number,
    totalWeight: number,
    shippingCost: number,
    discount: number,
    paymentId: string,
    postVerify?: string
    discountCode?: string
}

export type paginatedOrdersType = {
    orders: orderType[],
    totalPages: number,
    currentPage: number,
    total: number
}