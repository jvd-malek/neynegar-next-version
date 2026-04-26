"use client";

// next and react
import { useCallback, useState } from "react";
import { redirect } from "next/navigation";

// mui components and icons
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

// types and queries
import SearchResult from "@/public/components/header/headerComponents/SearchResult";

type SearchBarProps = {
  compact?: boolean;
};


export default function SearchBar({ compact }: SearchBarProps) {

  const [query, setQuery] = useState("");

  const queryHandler = (e: any) => {
    setQuery(e.target.value)
  }

  const searchHandler = useCallback(() => {
    if (query.trim().length > 0) {
      setQuery("");
      redirect(`/category/search/${query.trim()}`);
    }
  }, [query]);

  return (
    <>
      <Paper
        component="form"
        onSubmit={(e) => e.preventDefault()}
        elevation={0}
        className={`flex items-center rounded-lg border border-slate-200 bg-slate-50/70 focus-within:border-slate-400 transition-colors ${compact ? "w-32 xs:w-40 sm:w-48 h-9" : "w-full h-10"
          }`}
      >
        <IconButton
          type="button"
          aria-label="جستجو"
          size="small"
          className="text-black mx-1"
        >
          <SearchRoundedIcon fontSize="small" />
        </IconButton>

        <input
          name="search"
          aria-label="جستجو در نی‌نگار"
          type="text"
          value={query}
          onChange={queryHandler}
          onKeyDown={e => { if (e.key === 'Enter') searchHandler(); }}
          className="w-full outline-none px-1 placeholder:text-slate-300"
          placeholder="جستجو ..."
        />
      </Paper>

      <SearchResult query={query} setQuery={setQuery} />
    </>
  );
}

