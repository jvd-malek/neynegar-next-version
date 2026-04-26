import { linksType } from "./links"

export type paginationType = {
    page: number,
    countPerPage: number,
    search: string,
    sort: "popular"|"cheap"|"expensive"|"latest"|"offers",
    cat: string,
    links: linksType[]
}