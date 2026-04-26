"use client";

// next and react
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// mui components
import IconButton from "@mui/material/IconButton";

// icons
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';

// utils
import useSWR from 'swr';
import { notify } from '@/public/utils/notify';
import { fetcher } from '@/public/utils/fetcher';

// types
import { linksType } from '@/public/types/links';
import { ProductionQuantityLimits } from '@mui/icons-material';

type BoxHeaderType = {
    count?: number[];
    searchCat?: boolean;
    article?: boolean;
    initialLinks?: linksType[];
};

type SortType = { txt: string; val: string; id: number };

export default function BoxHeader({
    count = [24, 36, 48],
    article = false,
    searchCat = false,
    initialLinks = []
}: BoxHeaderType) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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

    // مدیریت دسته‌بندی‌ها و مرتب‌سازی‌ها
    const [category, setCategory] = useState<string[]>();
    const [Sort, setSort] = useState<SortType[]>(allSort);
    const [inStock, setInStock] = useState<boolean>(Boolean(searchParams.get('instock')));
    const loc = pathname.split('/');
    const minorCat = decodeURIComponent(loc[3] || '');
    const majorCat = decodeURIComponent(loc[2] || '');

    useEffect(() => {
        if (links) {
            if (majorCat === "search") {
                setSort(article ? allSort.filter(s => [1, 5].includes(s.id)) : allSort);
            } else {
                const majorSub = links.find((l: any) => l.txt === majorCat);
                if (majorSub) {
                    const majorLinks = ["همه", ...majorSub.subLinks.map((s: any) => s.link)];
                    setSort(allSort.filter(s => majorSub.sort.includes(s.id)));

                    if (minorCat && minorCat !== "undefined") {
                        const minorSub = majorSub.subLinks.find((b: any) => b.link === minorCat);
                        setCategory(minorSub?.brand || majorLinks);
                    } else {
                        setCategory(majorLinks);
                    }
                }
            }
        }
    }, [links, minorCat, majorCat, article]);

    // به‌روزرسانی پارامترهای جستجو
    const updateSearchParams = (params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newParams.set(key, value);
        });
        router.push(`${pathname}?${newParams.toString()}`);
    };

    const handleStockShow = () => {
        setInStock(perv => !perv)
        updateSearchParams({ instock: `${!inStock}`, page: '1' });
        notify('فیلتر اعمال شد!', 'success');
    };

    return (
        <section
            aria-labelledby="category-heading"
            className="mt-6 flex flex-col justify-center items-center gap-6">

            <div
                className="bg-white w-full rounded-lg py-6 px-2 sm:px-6 flex flex-col justify-between items-center">
                <h1 className="text-center font-bold sm:text-3xl text-2xl">
                    {searchCat ?
                        `جستجوی شما: ${minorCat}` :
                        `محصولات ${minorCat} در دسته‌بندی ${majorCat}`
                    }
                </h1>

                <form className="flex gap-3 mt-8 justify-between items-center w-full">

                    <div className="md:flex-row flex-col flex gap-3 sm:items-center text-white">
                        {/* فیلتر مرتب‌سازی */}
                        <div className='bg-black transition-all flex items-center justify-center overflow-hidden shadow-md w-40 rounded-md p-1.5'>
                            <span className="text-white">
                                <FilterListRoundedIcon />
                            </span>
                            <div className='transition-all outline-none bg-black rounded-md overflow-hidden w-full'>
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
                        {!searchCat && category && (
                            <div className='bg-black transition-all flex items-center justify-between gap-2 overflow-hidden shadow-md p-1.5 w-40 rounded-md'>
                                <div className="text-white">
                                    <FilterAltRoundedIcon />
                                </div>
                                <div className='transition-all outline-none bg-black rounded-md overflow-hidden w-full'>
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

                    <div className="md:flex-row flex-col flex gap-3 sm:items-center">
                        {/* تعداد در صفحه */}
                        <div className="p-1.5 text-white bg-black transition-all rounded-md flex items-center w-40 shadow-md whitespace-nowrap">
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

                        {/* فیلتر دسته‌بندی */}
                        <div className='flex items-center justify-between gap-2 overflow-hidden p-1.5 w-40 rounded-md border-2'>
                            <p className="text-nowrap">
                                موجودها
                            </p>
                            <button
                                type='button'
                                onClick={handleStockShow}
                                className={`transition-all duration-300 ${inStock ? "bg-blue-300" : "bg-mist-300"} w-14 h-6 rounded-2xl cursor-pointer`}
                            >
                                <span className={`bg-white transition-transform duration-300 rounded-full w-5 h-4.5 block ${inStock ? "-translate-x-8.5" : "-translate-x-0.5"}`}></span>
                            </button>
                        </div>
                    </div>

                </form>
            </div>


        </section>
    );
}