import Link from "next/link";
import { userType } from "@/lib/Types/user";
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';

interface CourseListBoxProps {
    courseProgress: userType["courseProgress"];
    demo?: boolean;
}

function CourseListBox({ courseProgress, demo = false }: CourseListBoxProps) {
    // محدود کردن دوره‌ها در حالت demo
    const displayCourses = demo ? courseProgress.slice(0, 3) : courseProgress;

    return (
        <div className="w-full">
            {/* Header - فقط در حالت غیر demo */}
            {!demo && (
                <div className="flex mt-12 justify-between items-center border-solid border-b border-slate-400 pb-3 mb-6">
                    <p className="text-lg">دوره‌های من</p>
                    <span className="text-sm text-gray-600">
                        {courseProgress?.length || 0} دوره
                    </span>
                </div>
            )}
            {displayCourses && displayCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayCourses.map((courseProgress: any) => {
                        const course = courseProgress.courseId;
                        const totalSections = course.sections?.length || 0;
                        const completedSections = courseProgress.progress + 1; // +1 چون progress از 0 شروع می‌شود
                        const progressPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
                        return (
                            <Link
                                href={`/course/${course._id}`}
                                key={course._id}
                                className="bg-white rounded-xl shadow-cs p-4 hover:shadow-lg transition-shadow"
                            >
                                <div className="relative mb-3">
                                    {course.cover && (
                                        <img
                                            src={`https://api.neynegar1.ir/uploads/${course.cover}`}
                                            alt={course.title}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                        {progressPercentage}%
                                    </div>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {course.title}
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>پیشرفت:</span>
                                        <span>{completedSections} از {totalSections} بخش</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>بازدید: {course.views}</span>
                                        <span>محبوبیت: {course.popularity}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white mt-7 shadow-cs py-8 px-6 rounded-xl w-full text-center">
                    <p className="text-gray-600 mb-2">
                        هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.
                    </p>
                    <p className="text-sm text-gray-500">
                        برای شروع یادگیری، دوره‌های موجود را بررسی کنید.
                    </p>
                    <span><SentimentDissatisfiedTwoToneIcon /></span>
                </div>
            )}
        </div>
    );
}

export default CourseListBox;