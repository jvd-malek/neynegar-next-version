import { commentType } from "./comment"
import { orderType } from "./order"
import { productCoverType, productType } from "./product"
import { ticketType } from "./ticket"

export interface userType {
    _id: string,
    status: string,
    name: string,
    email: string,
    phone: number,
    alert: string[],
    bascket: [{
        count: number, productId
        : productCoverType
    }],
    discount: [{ code: string, date: number, discount: number }],
    address: string,
    postCode: number,
    totalBuy: number,
    createdAt?: string,
    updatedAt?: string,
    favorite: { productId: productType }[],
    img: string,
    readingList: {
        articleId: {
            _id: string;
            title: string;
            desc: string;
            content: string;
            subtitles: string[];
            views: number;
            cover: string;
            images: string[];
            popularity: number;
            majorCat: string;
            minorCat: string;
            authorId: {
                _id: string;
                firstname: string;
                lastname: string;
                fullName: string;
            };
            createdAt: string;
        };
    }[],
    courseProgress: {
        courseId: {
            _id: string;
            title: string;
            desc: string;
            cover: string;
            entry: number;
            popularity: number;
            sections: {
                title: string;
                txt: string[];
                images?: number[];
            }[];
            images: string[];
            prerequisites: {
                _id: string;
                title: string;
            }[];
            articleId?: {
                _id: string;
                title: string;
            };
            createdAt: string;
            updatedAt: string;
        };
        progress: number;
    }[];
}

export type accountType = {
    user: userType,
    state: boolean,
    comments: commentType[],
    tickets: ticketType[],
    orders: orderType[]
}

export interface UserBasket {
    count: number
    productId: {
        _id: string
        title: string
        weight: number
        cover: string
        state: string
        price: number
        discount: number
        showCount: number
    },
    packageId: {
        _id: string
        title: string
        weight: number
        cover: string
        state: string
        price: number
        discount: number
        showCount: number
    },
    currentPrice: number
    currentDiscount: number
    itemTotal: number
    itemDiscount: number
    itemWeight: number
}
