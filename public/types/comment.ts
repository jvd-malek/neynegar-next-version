import { repliesType } from "./replies"
import { userType } from "./user"

export type commentType = {
  _id: string;
  txt: string;
  star?: number;
  status: string;
  like?: number;
  target?: {
    type: string;
    refId: string;
    data?: {
      _id: string;
      title: string;
      cover?: string;
    };
  };
  userId: userType;
  replies: repliesType[];
  createdAt: string;
  updatedAt: string;
  response?:string
};

export type paginatedCommentsType = {
    comments: commentType[],
    totalPages: number,
    currentPage: number,
    total: number
}
