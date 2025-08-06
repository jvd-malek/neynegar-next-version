import Image from 'next/image';
import Link from 'next/link';
import { ContentWithLinks } from '@/lib/utils/linkParser';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { Metadata } from "next";
import React from "react";
import CourseProgressObserver from "@/lib/Components/Course/CourseProgressObserver";

// Types for course and sections
// (You may want to move these to a types file if reused elsewhere)
type Section = {
    title: string;
    txt: string[];
    images?: number[];
};

type CourseType = {
    _id: string;
    title: string;
    desc: string;
    views: number;
    cover: string;
    popularity: number;
    articleId?: {
        _id: string;
        title: string;
    };
    sections?: Section[];
    images?: string[];
    prerequisites?: { _id: string; title: string }[];
    createdAt?: string;
    updatedAt?: string;
};

async function fetchCourse(id: string): Promise<CourseType | null> {
    const res = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: `
        query GetCourse($id: ID!) {
          course(id: $id) {
            _id
            title
            desc
            views
            cover
            popularity
            articleId { _id title }
            sections { title txt images }
            images
            prerequisites { _id title }
            createdAt
            updatedAt
          }
        }
      `,
            variables: { id }
        }),
        next: { revalidate: 3600 }
    });
    const data = await res.json();
    return data.data?.course || null;
}

// متا دیتا برای سئو
export async function generateMetadata({ params }: any): Promise<Metadata> {
    const { id } = await params;
    try {
        const res = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    query GetCourse($id: ID!) {
                      course(id: $id) {
                        _id
                        title
                        desc
                        cover
                        createdAt
                        updatedAt
                      }
                    }
                `,
                variables: { id }
            }),
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        const course = data.data?.course;
        if (!course) throw new Error("Course not found");
        const imageUrl = course.cover ? `https://api.neynegar1.ir/uploads/${course.cover}` : 'https://neynegar1.ir/logo.png';
        const descText = course.desc?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*/g, '').substring(0, 160) || "دوره آموزشی نی نگار";
        return {
            title: `${course.title} | دوره آموزشی | نی نگار`,
            description: descText,
            alternates: {
                canonical: `https://neynegar1.ir/course/${id}`,
                languages: {
                    'fa-IR': `https://neynegar1.ir/course/${id}`,
                },
            },
            openGraph: {
                title: `${course.title} | دوره آموزشی | نی نگار`,
                description: descText,
                url: `https://neynegar1.ir/course/${id}`,
                type: 'article',
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 600,
                        alt: course.title,
                    },
                ],
                siteName: 'نی نگار',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${course.title} | دوره آموزشی | نی نگار`,
                description: descText,
                images: [imageUrl],
            },
            keywords: [
                course.title,
                ...descText.split(' ').slice(0, 10)
            ].filter(Boolean),
        };
    } catch (error) {
        return {
            title: 'دوره آموزشی | نی نگار',
            description: 'صفحه دوره‌های آموزشی نی نگار',
        };
    }
}

export default async function CoursePage({ params }: any) {
    const { id } = await params;
    const course = await fetchCourse(id);

    if (!course) {
        return <div className="mt-32 text-center text-red-500">دوره‌ای یافت نشد.</div>;
    }

    return (
        <div className="sm:w-[85vw] w-[98vw] mx-auto mt-32 relative px-2">
            {/* Breadcrumb navigation */}
            <nav aria-label="breadcrumb" className="bg-slate-200 rounded-xl py-3 px-4 flex justify-start items-center gap-4 font-medium mb-8">
                {course && (
                    <>
                        <Link href="/" className="relative pl-6 flex items-center" aria-label="خانه">
                            <HomeRoundedIcon />
                            <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                                <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                            </span>
                        </Link>
                        <div className="relative pl-6">
                            <p className="line-clamp-1">
                                دوره‌ها
                            </p>
                            <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                                <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                            </span>
                        </div>
                        <p className="line-clamp-1" aria-current="page">{course.title}</p>
                    </>
                )}
            </nav>
            {/* Course Main Info */}
            <section className="bg-white rounded-xl pt-9 pb-4 px-6 text-black">
                <h1 className="border-b border-slate-200 pb-6 text-2xl font-bold">{course.title}</h1>
                <div className="flex flex-wrap gap-6 mt-4 text-slate-600">
                    <span>بازدید: {course.views}</span>
                    <span>محبوبیت: {course.popularity}</span>
                    {course.createdAt && <span>تاریخ ایجاد: {new Date(Number(course.createdAt)).toLocaleDateString('fa-IR')}</span>}
                </div>
                {course.cover && (
                    <div className="mt-8 rounded-xl overflow-hidden p-4 shadow bg-white relative w-fit mx-auto lg:mb-0 md:mb-4">
                        <Image
                            src={`https://api.neynegar1.ir/uploads/${course.cover}`}
                            alt={course.title}
                            width={800}
                            height={400}
                            className="rounded-lg w-full transition-transform duration-300 hover:scale-110 active:scale-110"
                        />
                    </div>
                )}
                <div className="mt-8 text-xl leading-relaxed text-slate-800 text-balance">
                    <ContentWithLinks content={course.desc} />
                </div>
                {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-bold mb-2">پیش‌نیازها:</h3>
                        <ul className="list-disc pr-6">
                            {course.prerequisites.map((pr: { _id: string; title: string }) => (
                                <li key={pr._id}>{pr.title}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {course.articleId && (
                    <div className="mt-8">
                        <h3 className="font-bold mb-2">مقاله مرتبط:</h3>
                        <Link href={`/article/${course.articleId._id}`} className="text-blue-600 underline">{course.articleId.title}</Link>
                    </div>
                )}
            </section>

            {/* Sections */}
            {course.sections && course.sections.length > 0 && (
                <CourseProgressObserver
                    courseId={course._id}
                    sections={course.sections}
                    images={course.images}
                />
            )}
        </div>
    );
}