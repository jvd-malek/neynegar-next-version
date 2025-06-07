'use client';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface SearchBoxProps {
    search: string;
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
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            searchHandler(searchValue);
        }
    };

    return (
        <div className="flex justify-center absolute top-4 left-3 items-center gap-2 pl-2 text-white bg-black w-fit rounded-lg shadow-md">
            <div className="text-slate-700">
                <input 
                    type="text"
                    className="py-2 px-4 outline-none rounded-full bg-black placeholder:text-slate-200 md:w-full w-36"
                    placeholder="جستجو محصولات"
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
        </div>
    );
} 