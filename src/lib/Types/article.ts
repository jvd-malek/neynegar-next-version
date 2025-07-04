import { Author } from "@/types/article"
import { commentType, paginatedCommentsType } from "./comment"

export type articleCoverType = {
    _id: string,
    title: string,
    desc: string,
    majorCat: string,
    minorCat: string,
    subCat: string
    popularity: number,
    authorId: string,
    cover: string,
}[]

export type articleAuthorCoverType = {
    _id: string,
    title: string,
    desc: string,
    majorCat: string,
    minorCat: string,
    subCat: string
    popularity: number,
    authorId: Author,
    cover: string,
}[]

export type articleCoverProductType = {
    _id: string,
    desc: string,
}

export type articleSingleType = {
    _id: string,
    title: string,
    desc: string,
    majorCat: string,
    minorCat: string,
    subCat: string
    popularity: number,
    authorId: { _id: string, fullName: string , firstname: string, lastname: string },
    cover: string,
    content: string[],
    subtitles: string[],
    images: string[],
    views: number,
    createdAt: string,
}

export type articleType = {
    article: articleSingleType,
    comments?: paginatedCommentsType,
}