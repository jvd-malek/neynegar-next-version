import { commentType, paginatedCommentsType } from "./comment"

export interface Author {
    _id: string;
    firstname: string;
    lastname: string;
    fullName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type articleCoverType = {
    _id: string,
    title: string,
    desc: string,
    majorCat: string,
    minorCat: string,
    popularity: number,
    authorId: string,
    cover: string,
    views: number,
    createdAt: string,
}

export type articleAuthorCoverType = {
    _id: string,
    title: string,
    desc: string,
    majorCat: string,
    minorCat: string,
    popularity: number,
    authorId: Author,
    cover: string,
    views: number,
    createdAt: string,
}

export type articleCoverProductType = {
    _id: string,
    desc: string,
    title?: string
}

export interface Article {
    _id: string;
    authorId: Author;
    title: string;
    minorCat: string;
    majorCat: string;
    desc: string;
    content: string[];
    subtitles: string[];
    views: number;
    cover: string;
    images: string[];
    popularity: number;
    comments?: Comment[];
    createdAt?: string;
    updatedAt?: string;
}

export type articleSingleType = {
    _id: string,
    title: string,
    desc: string,
    majorCat: string,
    minorCat: string,
    popularity: number,
    authorId: { _id: string, fullName: string, firstname: string, lastname: string },
    cover: string,
    content: string[],
    subtitles: string[],
    images: string[],
    views: number,
    createdAt: string,
    updatedAt: string,
}

export type paginatedArticleCoverType = {
    articles: articleAuthorCoverType[],
    totalPages: number,
    currentPage: number,
    total: number
}