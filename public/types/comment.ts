import { repliesType } from "./replies"
import { userType } from "./user"
import { articleSingleType } from "./article"
import { productType } from "./product"

export type commentType = {
    _id: string,
    txt: string,
    star?: number,
    like?: number,
    productId?: productType,
    articleId?: articleSingleType,
    userId: userType,
    createdAt?: string,
    replies?: repliesType[],
    response?:string
    status?:string
}

export type paginatedCommentsType = {
    comments: commentType[],
    totalPages: number,
    currentPage: number,
    total: number
}
