'use client';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import Image from 'next/image';
import Link from 'next/link';
import Skeleton from '@mui/material/Skeleton';
import { Author } from '@/types/article';

type ArticleBoxType = {
    title: string,
    majorCat: string,
    minorCat?: string,
    desc: string,
    _id: string,
    cover: string,
    authorId: Author,
    views: number
}

function ArticleBox({ title, majorCat, desc, _id, cover, minorCat, authorId, views }: ArticleBoxType) {

    const customLoader = ({ src }: { src: string }) => {
        return `https://api.neynegar1.ir/uploads/${src}`;
    };

    return (

        <div className={`flex relative flex-col min-w-40 mx-auto overflow-hidden rounded-2xl text-black bg-white p-1.5 shadow-cs max-w-72`}>

            {cover ? (
                <div className="relative">
                    <Image
                        src={cover}
                        alt={`تصویر مقاله ${title}`}
                        className={`transition-transform duration-300 hover:scale-107 active:scale-107 rounded-2xl object-cover`}
                        width={500}
                        height={500}
                        loading="lazy"
                        loader={customLoader} />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {views} بازدید
                    </div>
                </div>
            ) : (
                <Skeleton variant="rectangular" className='rounded-lg' height={200} />
            )}
            <div className="px-4 pt-2.5 pb-4 flex-grow border-b border-b-slate-100">
                <h3 className={`text-sm h-10 line-clamp-2`}>
                    {`${title}: ${desc}`}
                </h3>
            </div>

            <div className="flex items-end justify-between mt-1.5 py-1 px-2 bg-slate-100 rounded-b-lg text-sm">
                <span className="space-x-1.5 line-clamp-1">
                    {authorId?.firstname ? (authorId?.firstname + " " + authorId?.lastname) : (majorCat + ": " + minorCat)}
                </span>
                <Link
                    href={`/article/${_id}`}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200
                        rounded-lg transition-colors duration-200 group"
                >
                    <span className="text-sm font-medium">مشاهده مقاله</span>
                    <KeyboardBackspaceRoundedIcon
                        className=" text-lg transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse"
                        aria-hidden="true"
                    />
                </Link>
            </div>
        </div>

    );
}

export default ArticleBox;