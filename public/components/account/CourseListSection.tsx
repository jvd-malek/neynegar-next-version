// next
import Link from "next/link";

// components
import HomeHeader from "@/public/components/home/HomeHeader";
import CourseBox from "@/public/components/course/CourseBox";

// type
import { userType } from "@/public/types/user";


const CourseListSection = (user: userType) => {
    return (
        <section id="course-list">
            <div className="bg-white rounded-lg px-2 py-4 w-full mt-10">
                <HomeHeader
                    title="دوره‌های من"
                    showAll={false}
                />
            </div>

            {(user && user.courseProgress?.length > 0) ?
                <div className="flex flex-wrap gap-8 sm:justify-start justify-center items-center mt-4">
                    {user.courseProgress.map(c => (
                        <div key={c.courseId._id}>
                            <CourseBox {...c.courseId} userProgress={c.progress} />
                        </div>
                    ))}
                </div>
                :
                <div className="text-center bg-white rounded-lg p-6 w-full mt-4 space-y-4">
                    <p className="font-semibold">
                        هنوز در دوره‌ای شرکت نکرده‌اید.
                    </p>
                    <p className="text-sm text-mist-700 flex justify-center items-center gap-1">
                        {`دوره `}
                        <Link href={"/course/6877cca190dcf6cc752ed4e2"} className="font-semibold text-blue-700 underline">
                            {`مقدماتی نستعلیق`}
                        </Link>
                        {` را همین حالا شروع کنید.`}
                    </p>
                </div>
            }
        </section>
    );
}

export default CourseListSection;