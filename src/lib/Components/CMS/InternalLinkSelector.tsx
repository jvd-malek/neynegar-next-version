'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';
import Image from 'next/image';

interface InternalLinkSelectorProps {
    onSelect: (link: string) => void;
    type: 'article' | 'product' | 'course';
    placeholder?: string;
}

const GET_ARTICLES = `
    query GetArticles($page: Int, $limit: Int, $search: String) {
        articles(page: $page, limit: $limit, search: $search) {
            articles {
                _id
                title
                cover
                authorId {
                    firstname
                    lastname
                }
            }
        }
    }
`;

const GET_PRODUCTS = `
    query GetProducts($page: Int, $limit: Int, $search: String) {
        products(page: $page, limit: $limit, search: $search) {
            products {
                _id
                title
                cover
                price {
                    price
                }
                discount {
                    discount
                }
            }
        }
    }
`;

const GET_COURSES = `
    query GetCourses($page: Int, $limit: Int, $search: String) {
        courses(page: $page, limit: $limit, search: $search) {
            courses {
                _id
                title
            }
            totalPages
            currentPage
            total
        }
    }
`;

function InternalLinkSelector({ onSelect, type, placeholder = "جستجو..." }: InternalLinkSelectorProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    let query = GET_ARTICLES;
    if (type === 'product') query = GET_PRODUCTS;
    if (type === 'course') query = GET_COURSES;
    const variables = {
        page: 1,
        limit: 10,
        search: search
    };

    const { data, error } = useSWR(
        search ? [query, variables] : null,
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000
        }
    );

    useEffect(() => {
        if (data) {
            let itemsData: any[] = [];
            if (type === 'article') itemsData = data.articles?.articles || [];
            else if (type === 'product') itemsData = data.products?.products || [];
            else if (type === 'course') itemsData = data.courses?.courses || [];
            setItems(itemsData);
        }
    }, [data, type]);

    const handleSelect = (item: any) => {
        let link = '';
        if (type === 'article') link = `/article/${item._id}`;
        else if (type === 'product') link = `/product/${item._id}`;
        else if (type === 'course') link = `/course/${item._id}`;
        onSelect(`[${item.title}](${link})`);
        setIsOpen(false);
        setSearch('');
    };

    const formatPrice = (price: number, discount?: number) => {
        if (discount && discount > 0) {
            const discountedPrice = price * (1 - discount / 100);
            return (
                <div className="flex flex-col text-xs">
                    <span className="line-through text-gray-500">{price.toLocaleString('fa-IR')} تومان</span>
                    <span className="text-green-600 font-bold">{discountedPrice.toLocaleString('fa-IR')} تومان</span>
                </div>
            );
        }
        return <span className="text-xs">{price?.toLocaleString('fa-IR')} تومان</span>;
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
                    {isLoading && (
                        <div className="p-2 text-center text-gray-500">در حال جستجو...</div>
                    )}
                    
                    {error && (
                        <div className="p-2 text-center text-red-500">خطا در دریافت اطلاعات</div>
                    )}
                    
                    {items.length > 0 ? (
                        items.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => handleSelect(item)}
                                className="w-full p-3 text-right hover:bg-gray-100 border-b border-gray-200 last:border-b-0 text-sm flex items-center gap-3 transition-colors duration-200"
                            >
                                {/* Cover Image */}
                                <div className="flex-shrink-0">
                                    <Image
                                        src={`https://api.neynegar1.ir/uploads/${item.cover}`}
                                        alt={item.title}
                                        width={50}
                                        height={50}
                                        className="rounded-lg object-cover w-12 h-12"
                                    />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 text-right">
                                    <div className="font-medium text-gray-900 line-clamp-2">
                                        {item.title}
                                    </div>
                                    
                                    {type === 'article' && item.authorId && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            نویسنده: {item.authorId.firstname} {item.authorId.lastname}
                                        </div>
                                    )}
                                    
                                    {type === 'product' && item.price && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            {formatPrice(item.price.price, item.discount?.discount)}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Arrow Icon */}
                                <div className="flex-shrink-0 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))
                    ) : search && !isLoading ? (
                        <div className="p-2 text-center text-gray-500">
                            {type === 'article' ? 'مقاله‌ای یافت نشد' : type === 'product' ? 'محصولی یافت نشد' : 'دوره‌ای یافت نشد'}
                        </div>
                    ) : null}
                </div>
            )}
            
            {/* Click outside to close */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

export default InternalLinkSelector;