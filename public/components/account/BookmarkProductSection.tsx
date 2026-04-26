// next
import Link from "next/link";


// components
import HomeHeader from "@/public/components/home/HomeHeader";
import Box from '@/public/components/product-boxes/Box';

// type
import { userType } from "@/public/types/user";


const BookmarkProductSection = (user: userType) => {
    return (
        <section>
            <div className="bg-white rounded-lg px-2 py-4 w-full mt-8">
                <HomeHeader
                    title="مورد علاقه‌های من"
                    showAll={false}
                />
            </div>

            {(user && user.favorite?.length > 0) ?
                <Box favoriteProducts={user.favorite} />
                :
                <div className="text-center bg-white rounded-lg p-6 w-full mt-4 space-y-4">
                    <p className="font-semibold">
                        هنوز محصولی به لیست مورد‌علاقه خود اضافه نکرده‌اید.
                    </p>
                    <p className="text-sm text-mist-700 flex justify-center items-center gap-1">
                        {`از `}
                        <Link href={"/category/کتاب"} className="font-semibold text-blue-700 underline">
                            {`کتاب‌ها`}
                        </Link>
                        {` و همینطور از`}
                        <Link href={"/category/لوازم خوشنویسی"} className="font-semibold text-blue-700 underline">
                            {`لوازم`}
                        </Link>
                        {`خوشنویسی ما دیدن کنید.`}
                    </p>
                </div>
            }
        </section>
    );
}

export default BookmarkProductSection;