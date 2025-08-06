import { articleCoverProductType, articleType } from "./article"
import { commentType, paginatedCommentsType } from "./comment"

export type productCoverType = {
    _id: string,
    title: string,
    desc: string,
    price: { price: number, date: string }[],
    discount: { discount: number, date: number }[],
    popularity: number,
    cover: string,
    brand: string,
    majorCat: string,
    minorCat: string,
    count: number,
    showCount: number,
}[]

export type productCoverSingleType = {
    _id: string,
    title: string,
    desc: string,
    price: { price: number, date: string }[],
    discount: { discount: number, date: number }[],
    popularity: number,
    cover: string,
    brand: string,
    majorCat: string,
    minorCat: string,
    weight: number,
    showCount: number
}

export type productSingleType = {
    _id: string,
    title: string,
    desc: string,
    price: { price: number, date: string }[],
    discount: { discount: number, date: number }[],
    popularity: number,
    cover: string,
    cost: { cost: number, date: string, count: number }[],
    count: number,
    showCount: number,
    totalSell: number,
    authorId: { _id: string, firstname: string, lastname: string },
    publisher: string,
    publishDate: string,
    brand: string,
    status: string,
    state: string,
    size: string,
    weight: number,
    majorCat: string,
    minorCat: string,
    imgs: string,
    createdAt?: string,
    updatedAt?: string,
    color?: string,
    authorArticleId?: articleCoverProductType,
    publisherArticleId?: articleCoverProductType,
    productArticleId?: articleCoverProductType,
}

export type productAndArticleInputType = {
    title: string,
    desc: string,
    articleBody?: string,
    // img?: string,
    count: string,
    size: string,
    author: string,
    brand: string,
    weight: string,
    publisher: string,
    price: string,
    cost: string,
    publishDate: string,
    status: string,
    discount: string,
    majorCat: string,
    minorCat: string,
    discountDate: string,
    showCount: string,
    id: string
}

export type productInputHandlerType = {
    title?: string,
    desc?: string,
    count?: string,
    size?: string,
    author?: string,
    brand?: string,
    weight?: string,
    publisher?: string,
    price?: string,
    cost?: string,
    publishDate?: string,
    status?: string,
    discount?: string,
    majorCat?: string,
    minorCat?: string,
    discountDate?: string,
    showCount?: string,
    id?: string
}

export type productInputType = {
    title: string,
    desc: string,
    articleBody?: string,
    count: string,
    size: string,
    author: string,
    category: string,
    brand: string,
    weight: string,
    publisher: string,
    price: string,
    cost: string,
    img: string,
    publishDate: string,
    status: string,
    discount: string,
    majorCat: string
}

export type productType = {
    product: productSingleType,
    comments?: paginatedCommentsType,
}
