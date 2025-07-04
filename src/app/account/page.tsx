import AccountChild from "./Account";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';

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

async function Account({ searchParams }: any) {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');
    const { activeLink = "خانه", page: searchPage, count } = await searchParams;

    const page = {
        page: parseInt(searchPage || '1'),
        count: parseInt(count || '10')
    };

    if (!jwt) {
        redirect('/login');
    }

    // Fetch user data
    const userData = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
            'authorization': jwt?.value as string,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query {
                    user {
                        _id
                        status
                        name
                        phone
                        discount {
                            code
                            date
                            discount
                        }
                        favorite {
                            productId {
                                _id
                                title
                                desc
                                price {
                                    price
                                    date
                                }
                                discount {
                                    discount
                                    date
                                }
                                cover
                                brand
                                popularity
                                showCount
                                majorCat
                                minorCat
                            }
                        }
                        readingList {
                            articleId {
                                _id
                                title
                                desc
                                content
                                subtitles
                                views
                                cover
                                images
                                popularity
                                majorCat
                                minorCat
                                authorId {
                                    _id
                                    firstname
                                    lastname
                                    fullName
                                }
                                createdAt
                            }
                        }
                        address
                        postCode
                        totalBuy
                    }
                }
            `
        }),
        cache: "no-store"
    }).then(res => res.json());


    if (!userData.data?.user) {
        redirect("/login");
    }

    // Fetch orders
    const ordersData = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
            'authorization': jwt?.value as string,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query OrdersByUser($userId: ID!, $page: Int, $limit: Int) {
                    ordersByUser(userId: $userId, page: $page, limit: $limit) {
                        orders {
                            _id
                            products {
                                productId {
                                    _id
                                    title
                                    cover
                                    brand
                                    status
                                }
                                count
                                price
                                discount
                            }
                            totalPrice
                            totalWeight
                            shippingCost
                            discount
                            status
                            paymentId
                            authority
                            postVerify
                            createdAt
                        }
                        totalPages
                        currentPage
                        total
                    }
                }
            `,
            variables: {
                userId: userData.data.user._id,
                page: page.page,
                limit: page.count
            }
        }),
        cache: "no-store"
    }).then(res => res.json());

    // Fetch comments
    const commentsData = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
            'authorization': jwt?.value as string,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query CommentsByUser($userId: ID!, $page: Int, $limit: Int) {
                    commentsByUser(userId: $userId, page: $page, limit: $limit) {
                        comments {
                            _id
                            txt
                            status
                            star
                            like
                            productId {
                                _id
                                title
                                cover
                            }
                            replies {
                                txt
                                userId {
                                    _id
                                    name
                                }
                                like
                            }
                            createdAt
                        }
                        totalPages
                        currentPage
                        total
                    }
                }
            `,
            variables: {
                userId: userData.data.user._id,
                page: page.page,
                limit: page.count
            }
        }),
        cache: "no-store"
    }).then(res => res.json());

    // Fetch tickets
    const ticketsData = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
        method: 'POST',
        headers: {
            'authorization': jwt?.value as string,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query TicketsByUser($userId: ID!, $page: Int, $limit: Int) {
                    ticketsByUser(userId: $userId, page: $page, limit: $limit) {
                        tickets {
                            _id
                            response
                            status
                            title
                            txt
                            createdAt
                            updatedAt
                        }
                        totalPages
                        currentPage
                        total
                    }
                }
            `,
            variables: {
                userId: userData.data.user._id,
                page: page.page,
                limit: page.count
            }
        }),
        cache: "no-store"
    }).then(res => res.json());

    const user = userData.data.user;
    const orders = ordersData.data.ordersByUser;
    const comments = commentsData.data.commentsByUser;
    const tickets = ticketsData.data.ticketsByUser;

    const links = [
        { id: 1, txt: 'خانه', icon: '🏠' },
        { id: 2, txt: 'سفارشات', icon: '📦' },
        { id: 3, txt: 'جزییات حساب', icon: '👤' },
        { id: 4, txt: 'نظرات', icon: '💬' },
        { id: 5, txt: 'پرسش و پاسخ', icon: '❓' },
    ];

    return (
        <div className="mt-32 w-[85vw] mx-auto grid grid-cols-4 gap-4">
            <div className="lg:w-[20%] w-full col-start-1 col-end-5 row-start-1 h-fit relative bg-slate-200 text-slate-700 rounded-xl p-4 text-center pt-20 z-10">
                <h1 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    پیشخوان
                </h1>
                {
                    links.map(link => (
                        <Link key={link.id} href={`?activeLink=${link.txt}`} >
                            <p className={`mt-5 shadow-cs py-2 px-4 transition-all rounded-xl relative ${(activeLink === link.txt) ? "bg-black text-white" : "bg-white text-black"} hover:bg-black hover:text-white`}>
                                {link.txt}
                                <span className="ml-2">{link.icon}</span>
                            </p>
                        </Link>
                    ))
                }
            </div>
            <div className="bg-slate-200 lg:col-start-2 col-end-5 lg:row-start-1 row-start-2 col-start-1 transition-all relative text-slate-700 rounded-xl p-4">
                {user && (
                    <AccountChild
                        type={activeLink}
                        user={user}
                        orders={orders}
                        comments={comments}
                        tickets={tickets}
                    />
                )}
            </div>
        </div>
    );
}

export default Account;