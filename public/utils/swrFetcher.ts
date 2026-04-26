"use client"
import useSWR from "swr";
import { fetcher } from "@/public/utils/fetcher";

export const swrHandler = (query: string) => {
    return useSWR(
        query,
        (query) => fetcher(query),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );
}