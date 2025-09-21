"use client"
import { memo, useCallback, useEffect } from "react";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import IconButton from '@mui/material/IconButton';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LocalLibraryRoundedIcon from '@mui/icons-material/LocalLibraryRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import Link from "next/link";
import { useState } from "react";
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { linksType } from "../../../Types/links";
import { userType } from '../../../Types/user';
import { redirect } from 'next/navigation'
import { animateScroll } from "react-scroll";
import useSWR from "swr";
type NavLinksProps = {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    links: linksType[];
    user: userType | undefined;
    isFocusSearch: boolean;
}

const NavLinks = memo(({ isOpen, setOpen, links, user, isFocusSearch }: NavLinksProps) => {
    const [search, setSearch] = useState('');
    const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);

    const scrollTop = useCallback(() => {
        animateScroll.scrollToTop({
            duration: 300,
            smooth: 'easeInOutQuart'
        })
        setOpen(false);
    }, [setOpen]);

    const searchHandler = useCallback(() => {
        if (search.trim().length > 0) {
            scrollTop();
            setSearch("");
            redirect(`/category/search/${search.trim()}`);
        }
    }, [redirect, scrollTop, search]);

    const query = `
        query SearchProductsAndArticles($query: String!, $page: Int, $limit: Int) {
            searchProducts(query: $query, page: $page, limit: $limit) {
                products {
                    _id
                    title
                    desc
                    cover
                    majorCat
                    minorCat
                }
                totalPages
                currentPage
                total
            }
            searchArticles(query: $query, page: $page, limit: $limit) {
                articles {
                    _id
                    title
                    desc
                    cover
                    majorCat
                    minorCat
                    authorId {
                        fullName
                    }
                }
                totalPages
                currentPage
                total
            }
        }
    `;

    const fetcher = async (url: string) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: {
                    query: search,
                    page: 1,
                    limit: 20
                }
            }),
        });
        return res.json();
    };

    const { data, error, isLoading, mutate } = useSWR(
        search ? "https://api.neynegar1.ir/graphql" : null,
        fetcher
    );

    useEffect(() => {
        if (search) {
            mutate();
        }
    }, [search, mutate]);

    useEffect(() => {
        if (isFocusSearch && searchInputRef && isOpen) {
            searchInputRef.focus();
        }
    }, [isFocusSearch, searchInputRef, isOpen]);

    return (
        <SwipeableDrawer
            anchor='bottom'
            open={isOpen}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            ModalProps={{ keepMounted: false }}
            disableSwipeToOpen={false}
            className="block lg:hidden"
        >
            <div className="h-[80vh] w-full bg-gray-200 text-center font-[Baloo]">
                <div className="relative z-10 bg-gray-200 text-white">
                    <ul
                        role="search"
                        className="flex gap-4 text-center flex-col lg:hidden w-full p-6 transition-all duration-200 h-full">
                        <div
                            className="flex gap-4">
                            <li className="p-[0.08rem] rounded-xl bg-black">
                                <div className="w-full rounded-xl" onClick={searchHandler}>
                                    <IconButton sx={{ color: 'white' }} >
                                        <SearchRoundedIcon />
                                    </IconButton>
                                </div>
                            </li>
                            <li className="w-full p-[0.08rem] rounded-xl ">
                                <input
                                    ref={setSearchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') searchHandler(); }}
                                    className="w-full bg-black rounded-xl outline-none px-4 py-[0.55rem] placeholder:text-slate-300"
                                    placeholder="جستجو محصولات"
                                />
                            </li>
                        </div>

                        <div className="mb-5 flex gap-4 transition-all">

                            <li className="p-[0.08rem] rounded-xl bg-black relative">
                                <Link href={'/basket'} onClick={scrollTop} className="w-full rounded-xl flex items-center gap-8">
                                    <IconButton sx={{ color: 'white' }}>
                                        <LocalMallRoundedIcon />
                                    </IconButton>
                                    {user && user.bascket.length > 0 && (
                                        <p className="absolute text-white bg-red-500 rounded-full top-1 left-1 w-4 h-4 text-sm text-center -rotate-12">{user.bascket.length.toLocaleString('fa-IR')}</p>
                                    )}
                                </Link>
                            </li>
                            <li className="p-[0.08rem] rounded-xl bg-black">
                                <Link href={user ? (user?.status == "owner" || user?.status == "admin" ? '/cms' : "/account") : "/login"} onClick={scrollTop} className="w-full rounded-xl flex items-center">
                                    <IconButton sx={{ color: 'white' }}>
                                        <PersonRoundedIcon />
                                    </IconButton>
                                </Link>
                            </li>
                            <li className="p-[0.08rem] rounded-xl bg-black">
                                <Link href={user ? "/account?activeLink=دوره‌های من" : "/#section-courses"} onClick={scrollTop} className="w-full rounded-xl flex items-center">
                                    <IconButton sx={{ color: 'white' }}>
                                        <LocalLibraryRoundedIcon />
                                    </IconButton>
                                </Link>
                            </li>
                            <li className="p-[0.08rem] rounded-xl bg-black">
                                <Link href="/" onClick={scrollTop} className="w-full rounded-xl flex items-center">
                                    <IconButton sx={{ color: 'white' }}>
                                        <HomeRoundedIcon />
                                    </IconButton>
                                </Link>
                            </li>
                        </div>

                        <div className="mt-4 transition-all">
                            {isLoading && (
                                <div className="text-center py-4">در حال جستجو...</div>
                            )}

                            {error && (
                                <div className="text-center py-4 text-red-500">
                                    خطا در دریافت نتایج
                                </div>
                            )}

                            {((data?.data?.searchProducts?.products?.length > 0) || (data?.data?.searchArticles?.articles?.length > 0)) ? (
                                <div className="space-y-4">
                                    {/* Products Section */}
                                    {data?.data?.searchProducts?.products?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-black mb-2 border-b border-black pb-1">محصولات</h3>
                                            <div className="space-y-2">
                                                {data.data.searchProducts.products.map((product: any) => (
                                                    <Link
                                                        key={`product-${product._id}`}
                                                        href={`/product/${product._id}`}
                                                        className="block p-3 bg-black focus:bg-slate-800 text-white rounded-lg transition-colors"
                                                        onClick={() => scrollTop()}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {product.cover && (
                                                                <img
                                                                    src={`https://api.neynegar1.ir/uploads/${product.cover}`}
                                                                    alt={product.title}
                                                                    className="w-8 h-8 object-cover rounded"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm">{product.title}</div>
                                                                <div className="text-xs text-gray-300">{product.desc?.substring(0, 40)}...</div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Articles Section */}
                                    {data?.data?.searchArticles?.articles?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-black mb-2 border-b border-black pb-1">مقالات</h3>
                                            <div className="space-y-2">
                                                {data.data.searchArticles.articles.map((article: any) => (
                                                    <Link
                                                        key={`article-${article._id}`}
                                                        href={`/article/${article._id}`}
                                                        className="block p-3 bg-black focus:bg-slate-800 text-white rounded-lg transition-colors"
                                                        onClick={() => scrollTop()}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {article.cover && (
                                                                <img
                                                                    src={`https://api.neynegar1.ir/uploads/${article.cover}`}
                                                                    alt={article.title}
                                                                    className="w-8 h-8 object-cover rounded"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <div className="font-medium text-sm">{article.title}</div>
                                                                <div className="text-xs text-gray-300">
                                                                    {article.authorId?.fullName && `نویسنده: ${article.authorId.fullName}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : search && !isLoading && (
                                <div className="text-center pt-4 pb-2 text-black">
                                    محصول یا مقاله‌ای یافت نشد
                                </div>
                            )}
                        </div>

                        {links?.map((li) => (
                            <li key={li._id}>
                                <div className="w-full mt-5 mb-4">
                                    <Link href={`/${li.path}`} onClick={scrollTop}>
                                        <div className="w-full rounded-xl bg-black py-3 cursor-pointer font-semibold">
                                            {li.txt}
                                        </div>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {li.subLinks.length > 0 && li.subLinks.map((l, i) => (
                                        <Link href={`/${l.path}`} onClick={scrollTop} key={i + 10}>
                                            <div className="w-full whitespace-nowrap rounded-lg py-1.5 bg-dark-glassh dark:gr2dark">
                                                {l.link}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </SwipeableDrawer>
    );
});

export default NavLinks;