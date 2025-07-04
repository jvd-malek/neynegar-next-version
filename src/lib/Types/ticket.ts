import { userType } from "./user"

export type ticketType = {
    _id: string,
    userId: userType,
    createdAt?: string,
    updatedAt?: string,
    response?: string,
    status: string,
    title: string,
    txt: string
}

export type paginatedTicketsType = {
    tickets: ticketType[],
    totalPages: number,
    currentPage: number,
    total: number
}