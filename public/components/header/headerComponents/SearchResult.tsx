"use client"

// next and react
import { useMemo } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";

// mui components
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Box from "@mui/material/Box";

// utils and swr
import { customLoader } from "@/public/utils/product/ProductBoxUtils";
import { fetcher } from "@/public/utils/fetcher";
import useSWR from "swr";

// types and queries
import { SEARCH } from "@/public/graphql/headerQueries";
import { HeaderSearchType } from "@/public/types/search";

type SearchDataType = {
    data: HeaderSearchType,
    isLoading: boolean,
    mutate: any
}

type SearchResultProps = {
    query: string,
    setQuery: React.Dispatch<React.SetStateAction<string>>
}

const SearchResult = ({ query, setQuery }: SearchResultProps) => {

    const open = query.trim().length > 0;
    const clear = () => setQuery("");

    const { data, isLoading, mutate }: SearchDataType = useSWR(
        query ? "search" : null,
        () => fetcher(SEARCH, { query, page: 1, limit: 10 })
    );

    useMemo(() => {
        const q = query.trim();
        if (!q) return null;
        return mutate();
    }, [query]);

    return (
        <Drawer
            anchor="top"
            open={open}
            onClose={clear}
            ModalProps={{
                disableAutoFocus: true,
                disableEnforceFocus: true,
                disableRestoreFocus: true,
                BackdropProps: { invisible: true }
            }}
            PaperProps={{
                dir: "rtl",
                className: "rounded-2xl mt-20 container mx-auto px-2"
            }}
        >
            <div className="w-full max-h-[65vh] flex md:flex-row flex-col justify-between items-start relative gap-4 px-4">

                {/* products */}
                <div className="w-full">
                    <Box className="pt-2 pb-3 px-4 border-b border-slate-100 flex items-center justify-between">
                        <Box component="span" className="text-lg font-bold">
                            محصولات
                        </Box>
                    </Box>

                    <List className="py-0.5">
                        {isLoading && <p className="animate-pulse">در حال بارگذاری ...</p>}
                        {data?.searchProducts?.products?.length > 0 ?
                            data.searchProducts.products.map((item: any) => (
                                <ListItemButton
                                    key={item._id}
                                    onClick={() => {
                                        redirect(`/product/${item._id}`)
                                    }}
                                    className="flex gap-2 justify-start items-center"
                                >
                                    <Image
                                        src={item.cover}
                                        alt={`تصویر محصول ${item.title}`}
                                        className="rounded-md object-cover"
                                        width={70}
                                        height={70}
                                        loading="lazy"
                                        loader={customLoader}
                                        itemProp="image"
                                    />
                                    <p className="line-clamp-2 text-start">
                                        {item.title}، {item.desc}
                                    </p>
                                </ListItemButton>
                            )) :
                            <p>
                                {!isLoading &&
                               "محصولی یافت نشد."
                                }
                            </p>
                        }
                    </List>
                </div>

                {/* articles */}
                <div className="w-full">
                    <Box className="pt-2 pb-3 px-4 border-b border-slate-100 flex items-center justify-between">
                        <Box component="span" className="text-lg font-bold">
                            مقالات
                        </Box>
                    </Box>

                    <List className="py-0.5">
                        {isLoading && <p className="animate-pulse">در حال بارگذاری ...</p>}
                        {data?.searchArticles?.articles?.length > 0 ?
                            data.searchArticles.articles.map((item: any) => (
                                <ListItemButton
                                    key={item._id}
                                    onClick={() => {
                                        redirect(`/article/${item._id}`)
                                    }}
                                    className="flex gap-2 justify-center items-center"
                                >
                                    <Image
                                        src={item.cover}
                                        alt={`تصویر مقاله ${item.title}`}
                                        className="rounded-md object-cover"
                                        width={70}
                                        height={70}
                                        loading="lazy"
                                        loader={customLoader}
                                        itemProp="image"
                                    />
                                    <p className="line-clamp-2 text-start">
                                        {item.title}، {item.desc}
                                    </p>
                                </ListItemButton>
                            )) :
                            <p>
                                مقاله‌ای یافت نشد.
                            </p>
                        }
                    </List>
                </div>

            </div>
        </Drawer >
    );
}

export default SearchResult;