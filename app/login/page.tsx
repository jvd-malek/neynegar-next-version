// next and react
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

// icons and images
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import IconButton from "@mui/material/IconButton";
import Logo from '@/public/images/Logo.webp';

// components
import LoginForm from '@/public/components/login/LoginForm';

export const metadata: Metadata = {
    title: "ورود به حساب کاربری | نی‌نگار",
    description: "ورود یا ثبت نام در فروشگاه اینترنتی نی‌نگار. برای دسترسی به سبد خرید و سفارشات خود وارد شوید.",
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: "https://neynegar1.ir/login",
    },
    openGraph: {
        title: "ورود به حساب کاربری | نی‌نگار",
        description: "ورود یا ثبت نام در فروشگاه اینترنتی نی نگار. برای دسترسی به سبد خرید و سفارشات خود وارد شوید.",
        url: "https://neynegar1.ir/login",
        type: "website",
    },
    twitter: {
        card: 'summary_large_image',
        title: "ورود به حساب کاربری | نی‌نگار",
        description: "ورود یا ثبت نام در فروشگاه اینترنتی نی نگار. برای دسترسی به سبد خرید و سفارشات خود وارد شوید.",
    },
};


export default async function Login({ searchParams }: any) {
    const { bas } = await searchParams

    return (
        <>
            <div
                className="flex justify-center items-center w-full min-h-screen bg-white"
                itemScope
                itemType="https://schema.org/WebPage"
            >
                <main
                    className="container mx-auto px-4 py-8 flex md:flex-row flex-col justify-around items-center gap-4"
                    role="main"
                    aria-label="فرم ورود به حساب کاربری"
                >

                    <div className="flex flex-col justify-center items-start">
                        <Link
                            href={bas ? "/basket?activeLink=info" :"/"}
                            className="flex justify-center items-center gap-2"
                        >
                            <Image
                                src={Logo}
                                alt="لوگوی نی‌نگار"
                                className="rounded-md object-cover transition-transform duration-300 hover:scale-110 active:scale-110 flex-1"
                                width={80}
                                height={80}
                                loading="eager"
                                itemProp="image"
                            />
                            <h3 className="whitespace-pre-line font-bold text-lg border-r-2 flex-1 pr-2">
                                {`نی‌نگار:
                                هنر خطاطی در دستان شما`}
                            </h3>
                        </Link>
                        <p className="px-3 mt-1 text-mist-600 text-sm">
                            با ما، قلمتان جاری و آثارتان ماندگار خواهد شد.
                        </p>
                    </div>

                    <article
                        className="sm:h-[80vh] pt-10 h-[60vh] sm:max-w-100 w-[85vw] rounded-3xl relative bg-mist-200"
                        itemScope
                        itemType="https://schema.org/LoginAction"
                    >

                        <Link
                            href={bas ? "/basket?activeLink=info" :"/"}
                            className="absolute top-4 -right-1 z-20 bg-black px-1 rounded-r-lg rounded-l-2xl"
                            aria-label="بستن صفحه ورود"
                            prefetch={false}
                        >
                            <IconButton color="primary" aria-label="بستن">
                                <ClearRoundedIcon className="text-white" fontSize='small' />
                            </IconButton>
                        </Link>

                        <LoginForm />
                    </article>
                </main>
            </div>
        </>
    );
}