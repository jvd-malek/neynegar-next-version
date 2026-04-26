// next
import Image from 'next/image';
import Link from 'next/link';

// mui icons and components
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';

// types and utils
import { customLoader } from '@/public/utils/product/ProductBoxUtils';

type ArticleBoxType = {
    title: string,
    minorCat?: string,
    desc: string,
    _id: string,
    cover: string,
    views: number
}

function ArticleBox({ title, desc, _id, cover, minorCat, views }: ArticleBoxType) {

    return (

        <div className={`flex relative flex-col min-w-40 mx-auto overflow-hidden rounded-2xl text-black bg-white p-1.5 shadow-md max-w-72`}>

            {cover ? (
                <Link href={`/article/${_id}`} className="relative">
                    <Image
                        src={cover}
                        alt={`تصویر مقاله ${title}`}
                        className={`transition-transform max-h-40 duration-300 hover:scale-107 active:scale-107 rounded-2xl object-cover`}
                        width={500}
                        height={500}
                        quality={75}
                        loading="lazy"
                        loader={customLoader} />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        {views} بازدید
                    </div>
                </Link>
            ) : (
                <div className="animate-pulse bg-gray-300 rounded w-full h-full max-h-72 min-h-40"></div>
            )}

            <div className="px-4 pt-2.5 pb-2 grow gap-2 border-b border-b-slate-100 h-26">
                <h3 className="text-base font-bold line-clamp-2" itemProp="name">
                    {title}
                </h3>
                <p className="text-sm line-clamp-2 text-mist-600">
                    {desc}
                </p>
            </div>

            <div className="flex items-end justify-between mt-1.5 py-1 px-2 bg-slate-100 rounded-b-lg text-sm">
                <span className="space-x-1.5 line-clamp-1">
                    {minorCat}
                </span>
                <Link
                    href={`/article/${_id}`}
                    className="flex items-center gap-1 group"
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