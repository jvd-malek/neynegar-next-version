"use client"
import { createContext, useEffect, useState } from "react";

const pagination = createContext()
const Provider = ({ children }) => {
    const [page, setPage] = useState(1)
    const [countPerPage, setCountPerPage] = useState(24)
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState("latest")
    const [cat, setCat] = useState("همه")
    const [links, setLinks] = useState([])
    const [refresh, setRefresh] = useState(false)


    useEffect(() => {
        fetch("https://api.neynegar1.ir/links")
            .then(res => res.json())
            .then(data => setLinks(data))
    }, [])

    return (
        <pagination.Provider value={{
            page,
            setPage,
            countPerPage,
            setCountPerPage,
            search,
            setSearch,
            sort,
            setSort,
            cat,
            setCat,
            links,
            refresh,
            setRefresh
        }}>
            {children}
        </pagination.Provider>
    )
}

export { pagination };
export default Provider;