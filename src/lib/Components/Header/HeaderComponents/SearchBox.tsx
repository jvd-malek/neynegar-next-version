import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from "@mui/material";
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { animateScroll } from 'react-scroll';
import { linksType } from '@/lib/Types/links';

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
        query SearchProducts($query: String!, $page: Int, $limit: Int) {
            searchProducts(query: $query, page: $page, limit: $limit) {
                products {
                    _id
                    title
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
        searchQuery ? "http://localhost:4000/graphql" : null,
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
                                <button
                                    type="submit"
                                    className="bg-black cursor-pointer text-white p-2 rounded-lg hover:bg-primary/90"
                                >
                                    <SearchRoundedIcon />
                                </button>
                            </div>

                            {/* Search Results */}
                            <div className="mt-4 max-h-[60vh] transition-all overflow-y-auto">
                                {isLoading && (
                                    <div className="text-center py-4">در حال جستجو...</div>
                                )}

                                {error && (
                                    <div className="text-center py-4 text-red-500">
                                        خطا در دریافت نتایج
                                    </div>
                                )}

                                {data?.data?.searchProducts?.products?.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.data.searchProducts.products.map((product: any) => (
                                            <Link
                                                key={product._id}
                                                href={`/product/${product._id}`}
                                                className="block p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                                onClick={() => scrollTop()}
                                            >
                                                {product.title}
                                            </Link>
                                        ))}
                                    </div>
                                ) : searchQuery && !isLoading && (
                                    <div className="text-center pt-4 pb-2 text-gray-500">
                                        محصولی یافت نشد
                                    </div>
                                )}
                            </div>

                            {(searchQuery.length == 0 || data?.data?.searchProducts?.products?.length == 0) &&
                                <div className="space-y-2">
                                    {links.map((l:linksType) => (
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
                            
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(false)}
                                className="w-full p-2 text-gray-600 hover:text-gray-800"
                            >
                                بستن
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default SearchBox;