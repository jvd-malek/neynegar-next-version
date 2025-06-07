'use client';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhoneEnabledRoundedIcon from '@mui/icons-material/PhoneEnabledRounded';
import Link from "next/link";
import { usePathname } from 'next/navigation';

function Footer() {
    const pathname = usePathname();

    if (pathname.includes('login')) {
        return null;
    }

    return (
        <footer className="relative bg-[url(../../public/Img/blue-low.webp)] bg-repeat bg-contain w-full h-fit text-white pt-10 mt-10">
            <div className="absolute inset-x-0 sm:-top-0 -top-1 h-[60%] bg-gradient-to-b from-slate-50 to-transparent" />
            <div
                className="flex md:flex-row flex-col z-40 text-white gap-8 justify-around sm:w-[85vw] w-[95vw] mx-auto rounded-3xl p-8 bg-dark-glassh mb-20 before:bg-black before:absolute relative before:left-1/2 before:-translate-x-1/2 before:w-[50%] before:h-5 before:-bottom-5 before:rounded-b-3xl before:-z-50"
                itemScope
                itemType="https://schema.org/Organization"
            >
                {/* Rest of your footer content remains the same */}
                <div className="flex flex-col">
                    <h3 className="border-b border-solid border-white">ارتباط با ما</h3>
                    <div className="mt-8 flex flex-col md:items-end items-center gap-2">
                        <div className="flex justify-center items-center md:flex-row flex-col" dir="ltr">
                            <p>social media:</p>
                            <div className="flex justify-center items-center">
                                <Link
                                    href="https://www.instagram.com/neynegar1.ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-black px-1 py-[2px] rounded-md flex gap-1"
                                    itemProp="sameAs"
                                >
                                    <InstagramIcon />
                                    <span className="sr-only">اینستاگرام نی نگار</span>
                                </Link>
                                <Link
                                    href="https://t.me/neynegar1_ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-black px-1 py-[2px] rounded-md flex gap-1"
                                    itemProp="sameAs"
                                >
                                    <TelegramIcon />
                                    <span className="sr-only">تلگرام نی نگار</span>
                                </Link>
                            </div>
                        </div>
                        <p className="flex justify-center items-center md:flex-row flex-col" dir="ltr">
                            phone:
                            <Link
                                href="tel:09934242315"
                                className="ml-2 bg-black px-1 rounded-md flex gap-1"
                                itemProp="telephone"
                            >
                                +98 9934242315
                                <PhoneAndroidIcon />
                            </Link>
                        </p>
                        <p className="flex justify-center items-center md:flex-row flex-col" dir="ltr">
                            tel:
                            <Link
                                href="tel:02133334434"
                                className="ml-2 bg-black px-1 rounded-md flex gap-1"
                                itemProp="telephone"
                            >
                                021 33334434
                                <PhoneEnabledRoundedIcon />
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h3 className="border-b border-solid border-white">مجوزات</h3>
                    <div className="flex gap-8 mt-6 justify-center items-center bg-black p-1 rounded-xl w-fit mx-auto">
                        <Link
                            referrerPolicy="origin"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://trustseal.enamad.ir/?id=314492&Code=I42DaEtOgCfNS3N0UAJm"
                            className="w-32"
                        >
                            <img
                                referrerPolicy="origin"
                                src="https://trustseal.enamad.ir/logo.aspx?id=314492&Code=I42DaEtOgCfNS3N0UAJm"
                                className="w-full rounded-md"
                                alt="نماد اعتماد الکترونیکی"
                                loading="lazy"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-dark-glassh w-[85vw] mx-auto rounded-t-3xl text-white">
                <p className="p-3 text-center">
                    {'کلیه حقوق برای '}
                    <Link href="/" className="text-black" itemProp="url">
                        <span itemProp="name">فروشگاه مجازی نی‌نگار</span>
                    </Link>
                    {' محفوظ است © '}
                    {new Date().getFullYear()}
                </p>
            </div>
        </footer>
    );
}

export default Footer;