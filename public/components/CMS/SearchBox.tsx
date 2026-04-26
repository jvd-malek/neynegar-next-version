'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface SearchBoxProps {
    search?: string;
}

export default function SearchBox({ search }: SearchBoxProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState(search || "");

    const searchHandler = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("search", value);
        params.set("page", "1"); // Reset to first page on new search
        router.push(`?${params.toString()}`);
        setSearchValue("")
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            searchHandler(searchValue);
        }
    };

    return (
        <>
            <div className="text-white w-full">
                <input
                    type="text"
                    className="py-1.5 outline-none px-1 bg-black placeholder:text-slate-200 w-full"
                    placeholder="جستجو"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    id="search"
                />
            </div>

            <button
                className="flex justify-center items-center hover:text-gray-300 transition-colors"
                onClick={() => searchHandler(searchValue)}
            >
                <SearchRoundedIcon />
            </button>
        </>
    );
}