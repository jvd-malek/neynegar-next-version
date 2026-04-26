// next
import Image from 'next/image';
import Link from 'next/link';

// types and utils
import { customLoader } from '@/public/utils/product/ProductBoxUtils';

type CourseBoxType = {
    title: string,
    popularity: number,
    _id: string,
    cover: string,
    entry: number,
    userProgress: number,
    sections: { title: string }[]
}

function CourseBox({ title, _id, cover, entry, sections, userProgress, popularity }: CourseBoxType) {

    const totalSections = sections?.length || 0;
    const completedSections = userProgress + 1;
    const progressPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
    return (
        <div className={`bg-white rounded-xl p-4 shadow-md w-66`}>
                <div className="relative mb-3">
                    {cover ? (
                        <Link href={`/course/${_id}`}>
                            <Image
                                src={cover}
                                alt={`تصویر دوره ${title}`}
                                className={`rounded-lg object-cover h-32 w-full`}
                                width={500}
                                height={500}
                                quality={75}
                                loading="lazy"
                                loader={customLoader} />

                        </Link>
                    ) : (
                        <div className="animate-pulse bg-gray-300 rounded h-32"></div>
                    )}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {progressPercentage}%
                    </div>
                </div>
                <Link href={`/course/${_id}`} className='text-base font-bold line-clamp-2'>
                    {title}
                </Link>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>پیشرفت:</span>
                        <span className='text-black font-semibold'>{completedSections} از {totalSections} بخش</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <p>هنر آموز:
                            <span className='text-black font-semibold pr-1'>
                                {entry}
                            </span>
                        </p>
                        <p>محبوبیت:
                            <span className='text-black font-semibold pr-1'>
                                {popularity}
                            </span>
                        </p>
                    </div>
                </div>
        </div>
    );
}

export default CourseBox;