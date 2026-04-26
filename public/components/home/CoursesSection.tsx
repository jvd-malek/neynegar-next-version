// next and components
import HomeHeader from "@/public/components/home/HomeHeader";
import Tutorials from "@/public/components/tutorials/Tutorials";

// utils and images
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";

// types and queries
import { GET_HOME_PAGE_COURSES } from "@/public/graphql/courseQueries";
import { courseCoverType } from "@/public/types/course";


const CoursesSection = async () => {
    const courses: courseCoverType[] = await fetcher(GET_HOME_PAGE_COURSES, {}, revalidateOneHour)
        .then(data => data.homePageCourses.courses)
        .catch(err => console.error(err))

    return (
        <section
            className="container mx-auto px-8 mt-16"
            id="section-courses"
            aria-label="بخش دوره‌های خوشنویسی نی‌نگار"
        >
            {courses?.map((course) => (
                <div key={course._id} className="mb-12">
                    <HomeHeader
                        title={course.title}
                        ariaLabel={course.title}
                        showAll={false}
                    />
                    <Tutorials
                        title={course.title}
                        articleDesc={course.articleId?.desc || ""}
                        articleLink={course.articleId?._id || ""}
                        courseDesc={course.desc}
                        courseLink={course._id}
                        products={course.relatedProducts}
                        productsLink={course.category}
                    />
                </div>
            ))}

            <div className="w-full flex justify-center items-center mb-8">
                <div className="bg-linear-to-r from-blue-200 to-blue-400 text-blue-900 rounded-xl px-8 py-4 text-xl font-bold shadow-lg animate-pulse">
                    دوره‌های بعدی تو راهه ...
                </div>
            </div>
        </section>
    );
};

export default CoursesSection;
