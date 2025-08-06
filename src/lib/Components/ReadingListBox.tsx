'use client';

import { useState } from 'react';
import Link from 'next/link';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';

interface ReadingListBoxProps {
    readingList: {
        articleId: {
            _id: string;
            title: string;
            desc: string;
            content: string;
            subtitles: string[];
            views: number;
            cover: string;
            images: string[];
            popularity: number;
            majorCat: string;
            minorCat: string;
            authorId: {
                _id: string;
                firstname: string;
                lastname: string;
                fullName: string;
            };
            createdAt: string;
        };
    }[];
}

function ReadingListBox({ readingList }: ReadingListBoxProps) {
    
    const [showAll, setShowAll] = useState(false);
    const displayedArticles = showAll ? readingList : readingList.slice(0, 3);

    return (
        <section>
            <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3">
                <p className="text-lg">
                    مقالات ذخیره شده
                </p>
                {readingList.length > 3 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="flex items-center gap-x-1.5 cursor-pointer"
                    >
                        {showAll ? 'نمایش کمتر' : 'مشاهده همه'}
                        <span className="text-slate-700">
                            <KeyboardBackspaceRoundedIcon />
                        </span>
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-8 justify-center">
                {readingList.length > 0 ? (
                    <div className="w-full mt-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedArticles.map((item) => (
                                <Link 
                                    href={`/article/${item.articleId._id}`} 
                                    key={item.articleId._id}
                                    className="bg-white shadow-cs rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="relative">
                                        <img
                                            src={`https://api.neynegar1.ir/uploads/${item.articleId.cover}`}
                                            alt={item.articleId.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                            {item.articleId.views} بازدید
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                            {item.articleId.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {item.articleId.desc}
                                        </p>
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span>{item.articleId.authorId.fullName}</span>
                                            <span>{new Date(Number(item.articleId.createdAt)).toLocaleDateString('fa-IR')}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-center mb-2 mt-14">
                        هنوز مقاله‌ای به لیست خواندن خود اضافه نکرده‌اید.
                        <span><SentimentDissatisfiedTwoToneIcon /></span>
                    </p>
                )}
            </div>
        </section>
    );
}

export default ReadingListBox; 