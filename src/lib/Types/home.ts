import { articleCoverType } from "./article";
import { productCoverType } from "./product";

export type homeType = {
    caliBooks: productCoverType,
    paintBooks: productCoverType,
    traditionalBooks: productCoverType,
    articles: articleCoverType,
    discountProducts: productCoverType,
    gallery: productCoverType
}