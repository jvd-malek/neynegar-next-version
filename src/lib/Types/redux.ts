import { articleCoverType, articleType } from "./article"
import { commentType } from "./comment"
import { homeType } from "./home"
import { paginationType } from "./pagination"
import { productAndArticleInputType, productCoverType, productInputType, productType } from "./product"
import { searchType } from "./search"

export type reduxType = {
     pagination: paginationType 
     suggestedProducts: productCoverType
     articles: articleCoverType
     article: articleType
     category: productCoverType
     product: productType
     home: homeType
     search: searchType
     comments: commentType[]
     inputs:productAndArticleInputType
}

export type reduxFullType = {
     pagination: paginationType 
     suggestedProducts: productCoverType
     articles: articleCoverType
     products: productType
     home: homeType
     search: searchType
     comments: commentType[]
     // input:productInputType
}