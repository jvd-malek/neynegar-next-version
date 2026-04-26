import { paginatedArticleCoverType } from "./article"
import { paginatedProductCoverType } from "./product"

export type HeaderSearchType = {
    searchProducts: paginatedProductCoverType,
    searchArticles: paginatedArticleCoverType,
}