import { commentType } from "./comment"
import { orderType } from "./order"
import { productCoverSingleType, productSingleType } from "./product"
import { ticketType } from "./ticket"

export type userType = {
    _id: string,
    status: string,
    name: string,
    email: string,
    phone: number,
    bascket: [{
        count: number, productId
        : productCoverSingleType
    }],
    discount: [{ code: string, date: number, discount: number }],
    address: string,
    postCode: number,
    totalBuy: number,
    createdAt?: string,
    updatedAt?: string,
    favorite: { productId: productSingleType }[],
    img: string,
}

export type accountType = {
    user: userType,
    state: boolean,
    comments: commentType[],
    tickets: ticketType[],
    orders: orderType[]
}
