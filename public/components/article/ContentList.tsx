import Link from "next/link";

const ContentList = ({ titles }: { titles: string[] }) => {
    return (
        <div className="bg-white w-full rounded-lg p-6 h-fit">
            <h2 className="text-lg font-bold mb-4">فهرست مطالب</h2>
            <ul className="space-y-2">
                {titles.map((title, index) => (
                    <Link href={`#section-${index}`} key={index} className='flex justify-between items-center gap-3 p-3 bg-mist-100 rounded-lg hover:bg-slate-200 active:bg-slate-200 transition-colors duration-200'>
                        <div
                            className="transition-colors duration-200 flex items-center gap-2"
                        >
                            <span className="text-mist-500">{index + 1}.</span>
                            <p className="line-clamp-1">
                                {title}
                            </p>
                        </div>
                        <div className="text-mist-500">
                            <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </ul>
        </div>
    );
}

export default ContentList;