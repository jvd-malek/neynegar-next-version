"use client"
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ContentWithLinks } from "@/lib/utils/linkParser";
import { fetcher } from "@/lib/fetcher";
import { notify } from '@/lib/utils/notify';

// Types
export type Section = {
    title: string;
    txt: string[];
    images?: number[];
};

interface CourseProgressObserverProps {
    courseId: string;
    sections: Section[];
    images?: string[];
}

const CourseProgressObserver: React.FC<CourseProgressObserverProps> = ({ courseId, sections, images }) => {
    const [userProgress, setUserProgress] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // دریافت پیشرفت کاربر از سرور
    async function getUserProgress() {
        try {
            const res = await fetcher(`
                query GetUserProgress {
                    user {
                        courseProgress {
                            courseId { 
                                _id 
                            }
                            progress
                        }
                    }
                }
            `)
            const user = res.user;
            console.log(user);

            if (user?.courseProgress) {
                const courseProgress = user.courseProgress.find(
                    (cp: any) => cp.courseId._id === courseId
                );
                if (courseProgress) {
                    setUserProgress(courseProgress.progress);
                }
            }
        } catch (error) {
            console.error("خطا در دریافت پیشرفت کاربر:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // اسکرول به آخرین سکشن مطالعه‌شده
    useEffect(() => {
        if (!isLoading && userProgress >= 0 && userProgress < sections.length) {
            const targetSection = sectionRefs.current[userProgress];
            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 500);
            }
        }
    }, [isLoading, userProgress, sections.length]);

    // دریافت پیشرفت کاربر هنگام لود کامپوننت
    useEffect(() => {
        getUserProgress();
    }, [courseId]);

    async function updateCourseProgress(courseId: string, progress: number) {
        try {
            await fetcher(`
                        mutation UpdateCourseProgress($courseId: ID!, $progress: Int!) {
                          updateCourseProgress(courseId: $courseId, progress: $progress) {
                            _id
                            courseProgress { courseId { _id }, progress }
                          }
                        }
                    `, { courseId, progress });
            setUserProgress(progress);
            notify(`پیشرفت شما تا بخش ${progress + 1} ثبت شد!`, 'success');
        } catch (error) {
            console.error("خطا در ثبت پیشرفت:", error);
            notify("خطا در ثبت پیشرفت", 'error');
        }
    }

    if (isLoading) {
        return <div className="mt-12 text-center">در حال بارگذاری...</div>;
    }

    return (
        <section className="mt-12 w-full">
            {userProgress >= 0 && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    شما تا بخش {userProgress + 1} پیش رفته‌اید.
                </div>
            )}
            {sections.map((section, idx) => (
                <div
                    key={idx}
                    className={`mb-10 bg-white rounded-xl p-6 ${idx <= userProgress ? 'border-l-4 border-green-500' : ''
                        }`}
                    ref={el => { sectionRefs.current[idx] = el; }}
                >
                    <h3 className="text-2xl font-bold mb-4">
                        {section.title}
                        {idx <= userProgress && (
                            <span className="ml-2 text-sm text-green-600"> مطالعه شده ✓</span>
                        )}
                    </h3>
                    {section.images && section.images.length > 0 && (
                        <div className="flex flex-wrap gap-4 mb-4">
                            {section.images.map((imgIdx: number, i: number) => (
                                images?.[imgIdx] && (
                                    <Image
                                        key={i}
                                        src={`https://api.neynegar1.ir/uploads/${images[imgIdx]}`}
                                        alt={`تصویر بخش ${section.title}`}
                                        width={400}
                                        height={200}
                                        className="rounded-lg"
                                    />
                                )
                            ))}
                        </div>
                    )}
                    {section.txt.map((txt: string, i: number) => (
                        <div key={i} className="mb-2 w-full text-xl text-slate-800 text-balance md:text-nowrap leading-loose">
                            <ContentWithLinks content={txt} />
                        </div>
                    ))}
                    {/* دکمه ثبت مطالعه - فقط برای سکشن‌های مطالعه نشده */}
                    {idx > userProgress && (
                        <button
                            className="mt-4 px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded"
                            onClick={async () => {
                                await updateCourseProgress(courseId, idx);
                            }}
                        >
                            ثبت مطالعه این بخش
                        </button>
                    )}
                </div>
            ))}
        </section>
    );
};

export default CourseProgressObserver; 