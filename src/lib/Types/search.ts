import { articleCoverType } from "./article";
import { productCoverType } from "./product";

export type searchType = {
    articles: articleCoverType,
    products: productCoverType,
}