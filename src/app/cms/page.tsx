import CmsChild from "./CmsChild";
import { ticketType } from "@/lib/Types/ticket";
import { orderType } from "@/lib/Types/order";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from 'next/navigation';

async function CmsPage({ searchParams }: any) {
    const links = [
        { id: 1, txt: 'محصولات' },
        { id: 2, txt: 'ثبت محصول' },
        { id: 3, txt: 'مقالات' },
        { id: 4, txt: 'تیکت‌ها' },
        { id: 5, txt: 'سفارشات' },
        { id: 6, txt: 'کاربران' },
        { id: 7, txt: 'تخفیف‌ها' },
    ]

    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    // اگر JWT وجود نداشت، به صفحه خانه ریدایرکت کن
    if (!jwt) {
        redirect('/');
    }

    const { activeLink } = await searchParams;
    
    const tickets = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
        method: "POST",
        headers: {
            'authorization': jwt?.value as string,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                query {
                    tickets {
                        _id
                        userId{_id}
                        response
                        status
                        title
                        txt
                        createdAt
                        updatedAt
                    }
                }
            ` }),
    })
        .then(res => res.json())

    const ticketState: ticketType[] = tickets.data

    const orders = await fetch(process.env.NEXT_BACKEND_GRAPHQL_URL!, {
        method: "POST",
        headers: {
            'authorization': jwt?.value as string,
            "Content-Type": "application/json"
        },
        // price
        // discount
        // authority
        // totalWeight
        body: JSON.stringify({
            query: `
                query {
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
                        }
                        submition
                        totalPrice
                        
                        discount
                        status
                        paymentId
                        
                        postVerify
                        userId {
                            _id
                            name
                            phone
                            email
                            address
                            postCode
                        }
                        createdAt
                        updatedAt
                    }
                }
            `
        }),
    })
        .then(res => res.json())
        .then(res => res.data.orders)
        .catch(error => {
            console.error("Error fetching orders:", error);
            return [];
        });

    const orderState: orderType[] = orders

    return (
        <div className="mt-32 w-[85vw] mx-auto grid grid-cols-4 gap-4">
            <div className="lg:w-[20%] w-full col-start-1 col-end-5 row-start-1 h-fit relative bg-slate-200 text-slate-700 rounded-xl p-4 text-center pt-20 z-10">
                <h1 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    مدیریت سایت
                </h1>
                {
                    links.map(link => (
                        <Link key={link.id} href={`?activeLink=${link.txt}`} className="cursor-pointer">
                            <p className={`mt-5 shadow-cs py-2 px-4 transition-all rounded-xl relative ${activeLink == link.txt ? "bg-black text-white" : "bg-white text-black"}`}>
                                {link.txt}
                                {link.txt == "تیکت‌ها" && ticketState.length > 0 &&
                                    ticketState.filter((i) => (
                                        !i.response
                                    )).length > 0 &&
                                    <p className=" absolute left-0 bg-red-600 rounded-full w-3 h-3 top-0"></p>
                                }
                                {link.txt == "سفارشات" && orderState.length > 0 &&
                                    orderState.filter((i) => (
                                        i.status == "در حال آماده‌سازی"
                                    )).length > 0 &&
                                    <p className=" absolute left-0 bg-red-600 rounded-full w-3 h-3 top-0"></p>
                                }
                            </p>
                        </Link>
                    ))
                }
            </div>
            <div className="bg-slate-200 lg:col-start-2 col-end-5 lg:row-start-1 row-start-2 col-start-1 transition-all relative text-slate-700 rounded-xl p-4">
                <CmsChild searchParams={searchParams} activeLink={activeLink} ticketState={ticketState} ordersState={orderState} />
            </div>

        </div>
    );
}

export default CmsPage;