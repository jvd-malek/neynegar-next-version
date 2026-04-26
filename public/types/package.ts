import { productCoverType } from "./product"

export type packageCoverType = {
    _id: string,
    title: string,
    desc: string,
    price: { price: number, date: string }[],
    discount: { discount: number, date: number }[],
    popularity: number,
    cover: string,
    category: string,
    showCount: number,
    state: string,
    totalPrice: number,
    totalDiscount: number,
    finalPrice: number,
    totalProducts: number
}

export type packageType = {
    _id: string,
    title: string,
    desc: string,
    discount: { discount: number, date: number }[],
    popularity: number,
    cover: string,
    category: string,
    count: number,
    showCount: number,
    state: string,
    status: string,
    totalSell: number,
    tags: string[],
    products: {
        product: productCoverType,
        quantity: number
    }[]
    currentDiscount?: number,
    totalPrice: number,
    totalDiscount: number,
    finalPrice: number,
    totalProducts: number
    totalWeight: number
}