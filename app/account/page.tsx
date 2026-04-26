// next
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';
import Link from "next/link";

// components
import Header from "@/public/components/header/Header";
import Footer from "@/public/components/footer/Footer";
import StickyMenu from "@/public/components/link/StickyMenu";
import { BookmarkArticleSectionSkeleton, BookmarkProductSectionSkeleton, CourseListSectionSkeleton } from "@/public/components/account/AccountSkeleton";
import NotificatinSection from "@/public/components/account/NotificatinSection";
import ProfileSection from "@/public/components/account/ProfileSection";

// icons
import CircleNotificationsRoundedIcon from '@mui/icons-material/CircleNotificationsRounded';
import AccountCircleRounded from "@mui/icons-material/AccountCircleRounded";

// utils
import { fetcher, noCaching } from "@/public/utils/fetcher";

// queries
import { GET_USER_BY_TOKEN } from "@/public/graphql/userQueries";
import { GET_ORDERS_BY_USER } from "@/public/graphql/orderQueries";
import { GET_COMMENTS_BY_USER } from "@/public/graphql/commentQueries";
import { GET_TICKETS_BY_USER } from "@/public/graphql/ticketQueries";

// types
import { userType } from "@/public/types/user";
import { paginatedOrdersType } from "@/public/types/order";
import { paginatedCommentsType } from "@/public/types/comment";
import { paginatedTicketsType } from "@/public/types/ticket";

// Lazy load heavy components with better loading states
const BookmarkArticle = dynamic(() => import("@/public/components/account/BookmarkArticleSection"), {
    loading: BookmarkArticleSectionSkeleton
});

const BookmarkProduct = dynamic(() => import("@/public/components/account/BookmarkProductSection"), {
    loading: BookmarkProductSectionSkeleton
});

const CourseList = dynamic(() => import("@/public/components/account/CourseListSection"), {
    loading: CourseListSectionSkeleton
});

const OrderListSection = dynamic(() => import("@/public/components/account/OrderListSection"), {
    loading: CourseListSectionSkeleton
});

const DiscountSection = dynamic(() => import("@/public/components/account/DiscountSection"), {
    loading: CourseListSectionSkeleton
});

const CommentSection = dynamic(() => import("@/public/components/account/CommentSection"), {
    loading: CourseListSectionSkeleton
});

const TicketSection = dynamic(() => import("@/public/components/account/TicketSection"), {
    loading: CourseListSectionSkeleton
});

type variableType = {
    page: number,
    limit: number
}

export const metadata: Metadata = {
    title: 'حساب کاربری | فروشگاه نی‌نگار',
    description: 'مدیریت حساب کاربری، مشاهده سفارشات و تنظیمات شخصی',
    keywords: ['حساب کاربری', 'پروفایل', 'سفارشات', 'تنظیمات حساب', 'نی‌نگار'],
    alternates: {
        canonical: 'https://example.com/account',
    },
    openGraph: {
        title: 'حساب کاربری | فروشگاه نی‌نگار',
        description: 'مدیریت حساب کاربری در فروشگاه نی‌نگار',
        url: 'https://example.com/account',
        siteName: 'نی‌نگار',
        images: [
            {
                url: 'https://example.com/images/og-account.jpg',
                width: 800,
                height: 600,
            },
        ],
        locale: 'fa_IR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'حساب کاربری | فروشگاه نی‌نگار',
        description: 'مدیریت حساب کاربری در فروشگاه نی‌نگار',
        images: ['https://example.com/images/twitter-account.jpg'],
    },
};

const userDataFetcher = async (jwt: string) => {
    const userData = await fetcher(GET_USER_BY_TOKEN, {}, noCaching, jwt);
    return userData.userByToken
}

const orderDataFetcher = async (jwt: string, variable: variableType) => {
    const orderData = await fetcher(GET_ORDERS_BY_USER, variable, noCaching, jwt);
    return orderData.ordersByUser
}

const commentDataFetcher = async (jwt: string, variable: variableType) => {
    const commentData = await fetcher(GET_COMMENTS_BY_USER, variable, noCaching, jwt);
    return commentData.commentsByUser
}

const ticketDataFetcher = async (jwt: string, variable: variableType) => {
    const ticketData = await fetcher(GET_TICKETS_BY_USER, variable, noCaching, jwt);
    return ticketData.ticketsByUser
}


const Account = async ({ searchParams }: any) => {

    const { activeLink = "خانه", page: searchParamsPage, count } = await searchParams;
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value

    const page = {
        page: parseInt(searchParamsPage || '1'),
        count: parseInt(count || '10')
    };


    const user: userType | null = jwt ? await userDataFetcher(jwt) : null

    const orders: paginatedOrdersType | null = (user && jwt) ? await orderDataFetcher(jwt, {
        page: page.page,
        limit: page.count
    }) : null

    const comments: paginatedCommentsType | null = (user && jwt) ? await commentDataFetcher(jwt, {
        page: page.page,
        limit: page.count
    }) : null

    const tickets: paginatedTicketsType | null = (user && jwt) ? await ticketDataFetcher(jwt, {
        page: page.page,
        limit: page.count
    }) : null

    console.log(tickets);
    

    if (!user || !jwt) {
        redirect("/login");
    }

    const links = [
        { id: 1, txt: 'خانه' },
        { id: 2, txt: 'سفارشات' },
        { id: 3, txt: 'پروفایل' },
        { id: 4, txt: 'نظرات' },
        { id: 5, txt: 'پرسش و پاسخ' },
        { id: 6, txt: 'اعلان‌ها' }
    ];

    return (
        <>
            <Header />
            <main className="mt-6 container mx-auto px-3 lg:grid grid-cols-4 gap-6">

                <StickyMenu links={links} activeLink={activeLink} />

                <div className="col-start-2 col-end-5 row-start-1 transition-all">

                    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center bg-white rounded-lg py-2 px-6 w-full">
                        <div className="text-xl">
                            <p className="text-nowrap">{`${user?.name} عزیز؛ خوش اومدی 🙌`}</p>
                            <p className="text-sm text-mist-600 font-semibold">{user.phone}</p>
                        </div>
                        <div className="self-end">
                            <Link
                                href={"/account?activeLink=پروفایل"}
                                className="text-mist-600 text-5xl relative"
                            >
                                <AccountCircleRounded fontSize='inherit' />
                            </Link>
                            <Link
                                href={"/account?activeLink=اعلان‌ها"}
                                className="text-mist-600 text-5xl relative"
                            >
                                <CircleNotificationsRoundedIcon fontSize='inherit' />
                                {user?.alert?.length > 0 &&
                                    <span className="absolute left-0 bg-red-600 text-xs rounded-full w-6 h-6 top-2 flex justify-center items-center text-white">{user?.alert.length}</span>
                                }
                            </Link>
                        </div>
                    </div>

                    {
                        activeLink === 'خانه' &&
                        <>
                            <BookmarkProduct {...user} />
                            <BookmarkArticle {...user} />
                            <CourseList {...user} />
                            <OrderListSection user={user} orders={orders} demo />
                            <DiscountSection {...user} />
                            <CommentSection user={user} comments={comments} demo />
                            <TicketSection user={user} tickets={tickets} demo />
                        </>
                    }

                    {
                        activeLink === 'سفارشات' &&
                        <OrderListSection user={user} orders={orders} />
                    }

                    {
                        activeLink === 'پروفایل' &&
                        <ProfileSection {...user} />
                    }

                    {
                        activeLink === 'نظرات' &&
                        <CommentSection user={user} comments={comments} />
                    }

                    {
                        activeLink === 'پرسش و پاسخ' &&
                        <TicketSection user={user} tickets={tickets} />
                    }

                    {
                        activeLink === 'اعلان‌ها' &&
                        <NotificatinSection {...user} />
                    }

                </div>
            </main>
            <Footer />
        </>
    );
}

export default Account;