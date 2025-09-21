"use client";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import Link from 'next/link';
import { Typewriter } from 'nextjs-simple-typewriter';
import { IconButton } from "@mui/material";
import { useEffect, useState } from 'react';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { notify } from '@/lib/utils/notify';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';

type BoxHeaderType = {
    title: string;
    all?: boolean;
    link?: string;
    searchBar?: boolean;
    count?: number[];
    searchCat?: boolean;
    article?: boolean;
    setArticle?: React.Dispatch<React.SetStateAction<boolean>>;
    bascket?: boolean;
    catTitle?: string;
    initialLinks?: any[]; // برای SSR/SSG
};

type SortType = { txt: string; val: string; id: number };

export default function BoxHeader({
    title,
    catTitle,
    all = true,
    link = "/",
    searchBar = false,
    bascket = false,
    count = [24, 36, 48],
    article = false,
    setArticle,
    searchCat = false,
    initialLinks = []
}: BoxHeaderType) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // مدیریت state برای UI
    const [selection, setSelection] = useState(false);
    const [selectionFilter, setSelectionFilter] = useState(false);

    // دریافت لینک‌ها با SWR با fallback از داده‌های اولیه
    const LINKS_QUERY = `query { links { _id txt path sort subLinks { link path brand } } }`;
    const { data: linksData } = useSWR(LINKS_QUERY, (query) => fetcher(query), {
        fallbackData: { links: initialLinks },
        revalidateOnFocus: false,
    });
    const links = linksData?.links || initialLinks;

    // تعریف انواع مرتب‌سازی
    const allSort: SortType[] = [
        { txt: "جدیدترین‌ها", val: "latest", id: 1 },
        { txt: "تخفیفی‌ها", val: "offers", id: 2 },
        { txt: "گرانترین‌ها", val: "expensive", id: 3 },
        { txt: "ارزانترین‌ها", val: "cheap", id: 4 },
        { txt: "محبوبیت", val: "popular", id: 5 }
    ];

    // استخراج پارامترهای جستجو از URL
    const currentSort = searchParams.get('sort') || 'latest';
    const currentCat = searchParams.get('cat') || 'همه';
    const currentCount = searchParams.get('count') || '24';
    const [search, setSearch] = useState<string>(searchParams.get('search') || '')
    // مدیریت دسته‌بندی‌ها و مرتب‌سازی‌ها
    const [category, setCategory] = useState<string[]>();
    const [Sort, setSort] = useState<SortType[]>(allSort);
    const loc = pathname.split('/');

    useEffect(() => {
        if (searchBar && links) {
            const minCat = decodeURIComponent(loc[3] || '');
            const majorCat = decodeURIComponent(loc[2] || '');

            if (majorCat === "search") {
                setSort(article ? allSort.filter(s => [1, 5].includes(s.id)) : allSort);
            } else {
                const majorSub = links.find((l: any) => l.txt === majorCat);
                if (majorSub) {
                    const majorLinks = ["همه", ...majorSub.subLinks.map((s: any) => s.link)];
                    setSort(allSort.filter(s => majorSub.sort.includes(s.id)));

                    if (minCat && minCat !== "undefined") {
                        const minorSub = majorSub.subLinks.find((b: any) => b.link === minCat);
                        setCategory(minorSub?.brand || majorLinks);
                    } else {
                        setCategory(majorLinks);
                    }
                }
            }
        }
    }, [links, loc[2], loc[3], article, searchBar]);

    // به‌روزرسانی پارامترهای جستجو
    const updateSearchParams = (params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newParams.set(key, value);
        });
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        notify('فیلتر اعمال شد!', 'success');
    };

    return (
        <div className={`${(searchBar && !bascket) && "bg-glassh p-4 rounded-2xl mx-4 container"} ${bascket && "bg-slate-200 p-4 rounded-2xl"}`}>
            <div className={`flex ${!(bascket && !searchBar) ? "mb-4 sm:items-center items-end sm:flex-row flex-col" : " items-center"}  justify-between gap-4`}>
                <div className="space-y-2.5 self-start">
                    <div className={`flex items-center justify-center gap-x-2.5 sm:gap-x-3.5 text-black font-medium rounded-md py-0.5 w-fit`}>
                        {!searchBar && !bascket && (
                            <div className="w-6 h-6 rounded-md bg-black"></div>
                        )}
                        {searchBar && !bascket ? (
                            <h1 className={`text-2xl ${searchBar && "sm:text-3xl"}`}>
                                <Link href={`/`} className='cursor-pointer'>
                                    <HomeRoundedIcon /> | </Link>
                                {catTitle ? (
                                    <>
                                        {catTitle != "جستجو" ?
                                            <Link href={`/category/${catTitle}`} className='cursor-pointer'>{catTitle} | </Link> :
                                            <span className="">{catTitle} | </span>
                                        }
                                        {title}
                                    </>
                                ) : (
                                    title
                                )}
                            </h1>
                        ) : (
                            <h3 className={`text-2xl ${searchBar && "sm:text-3xl"}`}>{title}</h3>
                        )}
                    </div>
                    {searchBar && !bascket && (
                        <div className="text-black sm:text-xl rounded-md py-0.5 px-2">
                            <Typewriter
                                words={[
                                    "به دنیای خوشنویسی ایرانی خوش آمدید!",
                                    "فروشگاه آنلاین لوازم خوشنویسی",
                                    "قلم‌های مرغوب، کاغذهای باکیفیت",
                                    "آموزش و الهام‌بخشی برای خوشنویسی",
                                    "نی‌نگار: هنر خطاطی در دستان شما"
                                ]}
                                loop={2}
                                cursor
                                cursorStyle="|"
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1000}
                            />
                        </div>
                    )}
                </div>
                {all && (
                    <Link
                        href={link}
                        className="flex items-center w-fit gap-x-1 rounded-xl px-2.5 py-2 text-slate-500 hover:bg-slate-500/10 active:bg-slate-500/10 transition-colors"
                        aria-label="مشاهده همه موارد"
                    >
                        <span className="inline-block">مشاهده همه</span>
                        <KeyboardBackspaceRoundedIcon />
                    </Link>
                )}

                {bascket && !searchBar &&
                    <LocalMallIcon fontSize='large' />
                }
            </div>

            {searchBar && (
                <form onSubmit={handleSearch} className="flex md:flex-wrap lg:flex-row flex-col gap-4 justify-between sm:items-center w-full mx-auto mt-10">

                    {/* فیلترها و سوئیچ - وسط */}
                    <div className="sm:flex-row flex-col flex gap-4 sm:items-center">
                        <div className="flex gap-4 text-white">
                            {/* فیلتر مرتب‌سازی */}
                            <div className={`bg-black transition-all flex items-center overflow-hidden shadow-md ${selection ? "w-40 rounded-r-3xl rounded-l-lg" : 'w-10 rounded-full'}`}>
                                <IconButton
                                    onClick={() => { setSelection(!selection); setSelectionFilter(false) }}
                                    aria-label="مرتب‌سازی"
                                >
                                    <div className="text-white h-6 -translate-y-1">
                                        <FilterListRoundedIcon />
                                    </div>
                                </IconButton>
                                <div className={`p-2 transition-all outline-none bg-black rounded-md overflow-hidden ${selection ? "w-full opacity-100" : "w-0 opacity-0"}`}>
                                    <select
                                        value={currentSort}
                                        onChange={(e) => {
                                            updateSearchParams({ sort: e.target.value, page: '1' });
                                            notify('فیلتر اعمال شد!', 'success');
                                        }}
                                        className="bg-black transition-all outline-none w-full"
                                        aria-label="مرتب‌سازی نتایج"
                                    >
                                        {Sort.map((s) => (
                                            <option value={s.val} key={s.id}>{s.txt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* فیلتر دسته‌بندی */}
                            {!searchCat && !bascket && category && (
                                <div className={`bg-black transition-all flex items-center justify-between gap-2 overflow-hidden shadow-md ${selectionFilter ? "w-36 rounded-r-3xl rounded-l-lg" : 'w-10 rounded-full'}`}>
                                    <IconButton
                                        onClick={() => { setSelectionFilter(!selectionFilter); setSelection(false) }}
                                        aria-label="فیلتر دسته‌بندی"
                                    >
                                        <div className="text-white h-6 -translate-y-1">
                                            <FilterAltRoundedIcon />
                                        </div>
                                    </IconButton>
                                    <div className={`py-2 transition-all outline-none bg-black rounded-md overflow-hidden ${selectionFilter ? "w-full opacity-100" : "w-0 opacity-0"}`}>
                                        <select
                                            value={currentCat}
                                            onChange={(e) => {
                                                updateSearchParams({ cat: e.target.value, page: '1' });
                                                notify('فیلتر اعمال شد!', 'success');
                                            }}
                                            className="bg-black transition-all outline-none w-full"
                                            aria-label="فیلتر بر اساس دسته‌بندی"
                                        >
                                            {category.map((c, i) => (
                                                <option value={c} key={i}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* تعداد در صفحه - سمت چپ */}
                    <div className="p-2 text-white bg-black transition-all rounded-lg flex items-center w-fit shadow-md whitespace-nowrap">
                        <label htmlFor="count-per-page" className="mr-2">تعداد در صفحه:</label>
                        <select
                            id="count-per-page"
                            value={currentCount}
                            onChange={(e) => {
                                updateSearchParams({ count: e.target.value, page: '1' });
                                notify('فیلتر اعمال شد!', 'success');
                            }}
                            className="bg-black transition-all outline-none"
                            aria-label="تعداد موارد نمایش داده شده در هر صفحه"
                        >
                            {count.map(i => (
                                <option value={i} key={i}>{i}</option>
                            ))}
                        </select>
                    </div>
                </form>
            )}
        </div>
    );
}