import { commentType } from "./comment"

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
    authorId: { _id: string, firstname: string, lastname: string },
    cover: string,
    content: string,
    createdAt: string,
}

export type articleType = {
    article: articleSingleType,
    comments?: commentType[],
}