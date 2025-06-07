import AccountChild from "./Account";
import { accountType } from "@/lib/Types/user";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';

type SearchParamsType = {
    activeLink?: string;
};

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
    const { activeLink } = await searchParams;

    const user: accountType = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/user/account`, {
        cache: "no-store",
        headers: {
            'authorization': jwt?.value as string
        }
    })
        .then(res => res.json())
        .then(res => {
            if (!res.state) {
                redirect("/login")
            }
            return res
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            redirect("/login")
        });

    const links = [
        { id: 1, txt: 'خانه' },
        { id: 2, txt: 'سفارشات' },
        { id: 3, txt: 'جزییات حساب' },
        { id: 4, txt: 'نظرات' },
        { id: 5, txt: 'پرسش و پاسخ' },
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
                            <p className={`mt-5 shadow-cs py-2 px-4 transition-all rounded-xl relative ${(activeLink === link.txt) ? "bg-black text-white" : "bg-white text-black"}`}>
                                {link.txt}
                            </p>
                        </Link>
                    ))
                }
            </div>
            <div className="bg-slate-200 lg:col-start-2 col-end-5 lg:row-start-1 row-start-2 col-start-1 transition-all relative text-slate-700 rounded-xl p-4">
                {user && (
                    <AccountChild type={activeLink ? activeLink : "خانه"} {...user} />
                )}
            </div>
        </div>
    );
}

export default Account;