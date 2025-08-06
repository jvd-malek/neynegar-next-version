"use client"
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from "@mui/material";
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { animateScroll } from 'react-scroll';
import { linksType } from '@/lib/Types/links';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

function SearchBox({ links }: any) {
    const searchParams = useSearchParams();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const scrollTop = useCallback(() => {
        animateScroll.scrollToTop({
            duration: 300,
            smooth: 'easeInOutQuart'
        })
        setIsSearchOpen(false);
        setSearchQuery("");
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length > 0) {
            router.push(`/category/search/${searchQuery.trim()}`);
            scrollTop();
        }
    };

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
                    query: searchQuery,
                    page: Number(searchParams.get('page')) || 1,
                    limit: 10
                }
            }),
        });
        return res.json();
    };

    const { data, error, isLoading, mutate } = useSWR(
        searchQuery ? "https://api.neynegar1.ir/graphql" : null,
        fetcher
    );

    useEffect(() => {
        if (searchQuery) {
            mutate();
        }
    }, [searchQuery, mutate]);

    return (
        <>
            <button
                onClick={() => setIsSearchOpen(true)}
                className="fixed bottom-4 lg:block hidden right-4 cursor-pointer bg-black text-white p-2 rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-300 z-50"
            >
                <SearchRoundedIcon />
            </button>

            <Modal
                open={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            >
                <div className="top-1/2 -translate-y-1/2 absolute left-1/2 -translate-x-1/2 w-full max-w-2xl">
                    <div className="bg-slate-50 rounded-md p-6 mx-4 h-[80vh]">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="جستجو..."
                                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    dir="rtl"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="submit"
                                        className="bg-black cursor-pointer text-white p-2 rounded-lg hover:bg-primary/90"
                                    >
                                        <SearchRoundedIcon />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsSearchOpen(false)}
                                        className="p-2 cursor-pointer bg-black text-white rounded-lg hover:bg-primary/90"
                                    >
                                        <ClearRoundedIcon />
                                    </button>
                                </div>
                            </div>

                            {/* Search Results */}
                            <div className="mt-4 max-h-[50vh] transition-all overflow-y-auto">
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
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">محصولات</h3>
                                                <div className="space-y-2">
                                                    {data.data.searchProducts.products.map((product: any) => (
                                                        <Link
                                                            key={`product-${product._id}`}
                                                            href={`/product/${product._id}`}
                                                            className="block p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                                            onClick={() => scrollTop()}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {product.cover && (
                                                                    <img 
                                                                        src={`https://api.neynegar1.ir/uploads/${product.cover}`}
                                                                        alt={product.title}
                                                                        className="w-10 h-10 object-cover rounded"
                                                                    />
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{product.title}</div>
                                                                    <div className="text-sm text-gray-500">{product.desc?.substring(0, 50)}...</div>
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
                                                <h3 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">مقالات</h3>
                                                <div className="space-y-2">
                                                    {data.data.searchArticles.articles.map((article: any) => (
                                                        <Link
                                                            key={`article-${article._id}`}
                                                            href={`/article/${article._id}`}
                                                            className="block p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                                            onClick={() => scrollTop()}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {article.cover && (
                                                                    <img 
                                                                        src={`https://api.neynegar1.ir/uploads/${article.cover}`} 
                                                                        alt={article.title}
                                                                        className="w-10 h-10 object-cover rounded"
                                                                    />
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{article.title}</div>
                                                                    <div className="text-sm text-gray-500">
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
                                ) : searchQuery && !isLoading && (
                                    <div className="text-center pt-4 pb-2 text-gray-500">
                                        محصول یا مقاله‌ای یافت نشد
                                    </div>
                                )}
                            </div>

                            {((searchQuery.length == 0) || 
                              ((data?.data?.searchProducts?.products?.length == 0) && 
                               (data?.data?.searchArticles?.articles?.length == 0))) &&
                                <div className="space-y-2">
                                    {links.map((l: linksType) => (
                                        <Link
                                            key={l._id}
                                            href={`${l.path}`}
                                            className="block p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                            onClick={() => scrollTop()}
                                        >
                                            {l.txt}
                                        </Link>
                                    ))}
                                </div>
                            }

                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default SearchBox;
