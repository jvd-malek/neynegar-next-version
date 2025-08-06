import { commentType } from "./comment"
import { orderType } from "./order"
import { productCoverSingleType, productSingleType } from "./product"
import { ticketType } from "./ticket"

export interface userType {
    _id: string,
    status: string,
    name: string,
    email: string,
    phone: number,
    bascket: [{
        count: number, productId
        : productCoverSingleType
    }],
    discount: [{ code: string, date: number, discount: number }],
    address: string,
    postCode: number,
    totalBuy: number,
    createdAt?: string,
    updatedAt?: string,
    favorite: { productId: productSingleType }[],
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
            views: number;
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
