import { articleCoverProductType } from "./article"
import { paginatedCommentsType } from "./comment"

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    patternMessage?: string;
    message?: string;
}

export interface Product {
    _id: string;
    authorId: Author;
    totalSell: number;
    title: string;
    desc: string;
    price: Price[];
    cost: Cost[];
    count: number;
    discount: Discount[];
    showCount: number;
    popularity: number;
    publisher: string;
    publishDate: string;
    brand: string;
    status: string;
    state?: string;
    size: string;
    weight: number;
    majorCat: string;
    minorCat: string;
    cover: string;
    images: string[];
}

export type productCoverType = {
    _id: string,
    title: string,
    desc: string,
    price: { price: number, date: string }[],
    discount: { discount: number, date: number }[],
    currentPrice: number,
    currentDiscount: number,
    popularity: number,
    cover: string,
    brand: string,
    majorCat: string,
    minorCat: string,
    finalPrice: number,
    count: number,
    showCount: number,
    state: string
}

export interface Price {
    price: number;
    date: string;
}

export interface Cost {
    cost: number;
    date: string;
    count: number;
}

export interface Discount {
    discount: number;
    date: number;
}

export interface Author {
    _id: string;
    fullName: string;
}

export interface ProductInput {
    title: string;
    desc: string;
    price: Price;
    cost: Cost;
    count: number;
    discount: Discount;
    showCount: number;
    popularity: number;
    authorId: string;
    publisher: string;
    publishDate: string;
    brand: string;
    status: string;
    state: string;
    size: string;
    weight: number;
    majorCat: string;
    minorCat: string;
    cover: string;
    images: string[];
}

export type HomePageBooks = {
    paintBooks: productCoverType[],
    gallery: productCoverType[],
    traditionalBooks: productCoverType[],
    tools: productCoverType[]
}

export type GroupDiscountsType = {
    _id: string,
    title: string,
    majorCat: string,
    minorCat: string,
    brand: string,
    endDate: string,
    isActive: string,
}

export type HomePageHero = {
    caliBooks: productCoverType[],
    discountProducts: productCoverType[],
    groupDiscounts: GroupDiscountsType[],
}

export type productType = {
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
    images: string[],
    createdAt?: string,
    updatedAt?: string,
    color?: string,
    authorArticleId?: articleCoverProductType,
    publisherArticleId?: articleCoverProductType,
    productArticleId?: articleCoverProductType,
    currentPrice?: number
    currentDiscount?: number
    finalPrice?: number
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

export type productsWithCommentsType = {
    product: productType,
    comments?: paginatedCommentsType,
}

export type paginatedProductCoverType = {
    products: productCoverType[],
    totalPages: number,
    currentPage: number,
    total: number
}
