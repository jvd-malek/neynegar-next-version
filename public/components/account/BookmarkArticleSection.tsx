// next
import Link from "next/link";


// components
import HomeHeader from "@/public/components/home/HomeHeader";
import Box from '@/public/components/product-boxes/Box';

// type
import { userType } from "@/public/types/user";


const BookmarkArticleSection = (user:userType) => {
    return (
        <section>
            <div className="bg-white rounded-lg px-2 py-4 w-full mt-10">
                <HomeHeader
                    title="لیست مطالعه من"
                    showAll={false}
                />
            </div>

            {(user && user.readingList?.length > 0) ?
                <Box articles={user.readingList} />
                :
                <div className="text-center bg-white rounded-lg p-6 w-full mt-4 space-y-4">
                    <p className="font-semibold">
                        هنوز مقاله‌ای به لیست مطالعه خود اضافه نکرده‌اید.
                    </p>
                    <p className="text-sm text-mist-700 flex justify-center items-center gap-1">
                        {`مطالعه `}
                        <Link href={"/article/6871f8b9159750ddb71f04e6"} className="font-semibold text-blue-700 underline">
                            {`خط نستعلیق`}
                        </Link>
                        {` را همین حالا شروع کنید.`}
                    </p>
                </div>
            }
        </section>
    );
}

export default BookmarkArticleSection;