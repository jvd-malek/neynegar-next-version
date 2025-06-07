import { userType } from "./user"


export type repliesType = {
    _id: string,
    commentId?: string,
    txt: string,
    like: number,
    userId: userType,
    createdAt: string,
}
