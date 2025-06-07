import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import Image from 'next/image';
import Link from 'next/link';

type ArticleBoxType = {
    title: string,
    majorCat: string,
    minorCat?: string,
    subCat?: string,
    desc: string,
    _id: string,
    cover: string,
}

function ArticleBox({ title, majorCat, desc, _id, cover }: ArticleBoxType) {

    const customLoader = ({ src }: { src: string }) => {
        return `https://api.neynegar1.ir/imgs/${src}`;
    };

    return (

        <div className={`flex flex-col overflow-hidden bg-slate-600 shadow-cs rounded-2xl w-72`}>
            <Image src={cover} alt={title} className={`border-b-2 rounded-2xl border-solid border-slate-800 object-cover`} width={500} height={500} loading="lazy" loader={customLoader} />
            <div className="px-4 pt-2.5 pb-4 flex-grow border-b border-white">
                <p className={`text-sm h-10 line-clamp-2 text-white`}>
                    {`${title}، ${desc}`}
                </p>
            </div>

            <div className="flex items-end justify-between mt-1.5 px-5 pb-2 text-sm text-white">
                <span className=" space-x-1.5">
                    {majorCat}
                </span>
                <Link
                    href={`/article/${_id}`}
                    className="flex items-center gap-x-1.5 cursor-pointer text-white">
                    مشاهده مقاله
                    <span className="text-white">
                        <KeyboardBackspaceRoundedIcon />
                    </span>
                </Link>
            </div>
        </div>

    );
}

export default ArticleBox;