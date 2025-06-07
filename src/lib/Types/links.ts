export type linksType = {
    _id: number,
    txt: string,
    path: string,
    sort: number[]
    subLinks: { link: string, path: string, id: number, brand: string[] }[]
}