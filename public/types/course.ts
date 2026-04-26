import { articleCoverProductType } from "./article"
import { productCoverType } from "./product"

export type courseCoverType = {
    _id: string,
    title: string,
    desc: string,
    articleId: articleCoverProductType
    relatedProducts: productCoverType[]
    category: string,
}


export type courseType = {
    _id: string,
    title: string,
    desc: string,
    articleId: articleCoverProductType
    relatedProducts: productCoverType
    category: string,
}
