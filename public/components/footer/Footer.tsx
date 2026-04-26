// next
import Link from "next/link";
import Image from 'next/image';

// icons
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhoneEnabledRoundedIcon from '@mui/icons-material/PhoneEnabledRounded';
import ArrowOutwardOutlined from '@mui/icons-material/ArrowOutwardOutlined';
import LinkedIn from '@mui/icons-material/LinkedIn';
import WhatsApp from '@mui/icons-material/WhatsApp';

// images
import rubika from '@/public/images/logo-Rubika.webp';
import bale from '@/public/images/logo-Bale.webp';
import eitaa from '@/public/images/logo-Eitaa.webp';

// قراردهی لینک روبیکا و لینکدین

function Footer() {
    return (
        <footer className="w-full mt-12 container mx-auto px-3" id="footer">
            <div
                className="flex md:flex-row flex-col z-10 bg-white gap-8 justify-around rounded-xl p-8 mb-12 before:bg-blue-200 before:absolute relative before:left-1/2 before:-translate-x-1/2 before:w-[50%] before:h-5 before:-bottom-5 before:rounded-b-3xl before:-z-10 font-bold text-lg"
                itemScope
                itemType="https://schema.org/Organization"
            >
                <div className="flex flex-col">
                    <h3 className="border-b-2 font-bold border-solid border-gray-300">لینک‌های مفید</h3>
                    <div className="mt-4 flex flex-col sm:flex-row md:flex-col items-start md:gap-0 sm:gap-2 text-sm">
                        <div className="flex-1">
                            <Link
                                href='/category/مقالات'
                                className='block text-blue-900 leading-6 hover:text-mist-500 active:text-mist-500'
                                aria-label='لینک '
                            >
                                وبلاگ نی‌نگار
                            </Link>
                            <Link
                                href='/category/لوازم خوشنویسی'
                                className='block text-blue-900 leading-6 hover:text-mist-500 active:text-mist-500'
                                aria-label='لینک '
                            >
                                لوازم خوشنویسی
                            </Link>
                            <Link
                                href='/category/حراجستون'
                                className='block text-blue-900 leading-6 hover:text-mist-500 active:text-mist-500'
                                aria-label='لینک '
                            >
                                فروش ویژه محصولات
                            </Link>
                        </div>
                        <div className="flex-1">
                            <Link
                                href='/course/6877cca190dcf6cc752ed4e2'
                                className='block text-blue-900 leading-6 hover:text-mist-500 active:text-mist-500'
                                aria-label='لینک '
                            >
                                دوره مقدماتی نستعلیق
                            </Link>
                            <Link
                                href='/category/پکیج'
                                className='block text-blue-900 leading-6 hover:text-mist-500 active:text-mist-500'
                                aria-label='لینک '
                            >
                                پکیج‌های لوازم خوشنویسی
                            </Link>
                            <Link
                                href='/category/کتاب/خوشنویسی'
                                className='block text-blue-900 leading-6 hover:text-mist-500 active:text-mist-500'
                                aria-label='لینک '
                            >
                                تازه‌ترین کتاب‌های خوشنویسی
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h3 className="border-b-2 font-bold border-solid border-gray-300">ارتباط با ما</h3>
                    <div className="mt-4 flex flex-col items-start gap-x-2 gap-y-3">
                        <p className="flex justify-center items-center gap-2 text-sm">
                            شماره تماس:
                            <Link
                                href="tel:09934242315"
                                className="ml-2 bg-white px-1 rounded-md flex justify-center items-center gap-1"
                                itemProp="telephone"
                                dir='ltr'
                            >
                                <PhoneAndroidIcon />
                                +98-9934242315
                            </Link>
                        </p>
                        <p className="flex justify-center items-center gap-2 text-sm">
                            شماره ثابت:
                            <Link
                                href="tel:02133334434"
                                className="ml-2 bg-white px-1 rounded-md flex justify-center items-center gap-1"
                                itemProp="telephone"
                                dir='ltr'
                            >
                                <PhoneEnabledRoundedIcon />
                                021-33334434
                            </Link>
                        </p>
                        <div className="flex sm:flex-row flex-col justify-center sm:items-center items-start gap-2">
                            <p className='text-sm'>شبکه‌های اجتماعی:</p>
                            <div className="flex flex-wrap justify-center items-center gap-1">
                                <Link
                                    href="https://www.instagram.com/neynegar1.ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-white px-1 py-0.5 rounded-md flex justify-center items-center gap-1 w-7 h-7"
                                    itemProp="sameAs"
                                >
                                    <InstagramIcon />
                                    <span className="sr-only">اینستاگرام نی نگار</span>
                                </Link>
                                <Link
                                    href="https://t.me/neynegar1_ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-white px-1 py-0.5 rounded-md flex  justify-center items-center gap-1 w-7 h-7"
                                    itemProp="sameAs"
                                >
                                    <TelegramIcon />
                                    <span className="sr-only">تلگرام نی نگار</span>
                                </Link>
                                <Link
                                    href="https://wa.me989934242315"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-white px-1 py-0.5 rounded-md flex  justify-center items-center gap-1 w-7 h-7"
                                    itemProp="sameAs"
                                >
                                    <WhatsApp />
                                    <span className="sr-only">واتساپ نی نگار</span>
                                </Link>
                                <Link
                                    href="/#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-white px-1 py-0.5 rounded-md flex  justify-center items-center gap-1 w-7 h-7"
                                    itemProp="sameAs"
                                >
                                    <LinkedIn />
                                    <span className="sr-only">لینکدین نی نگار</span>
                                </Link>
                                <Link
                                    href="https://web.bale.ai/@Neynegar1ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-white px-1 py-0.5 rounded-md flex  justify-center items-center gap-1 w-7 h-7"
                                    itemProp="sameAs"
                                >
                                    <Image src={bale} className='object-contain' alt="لوگو بله نی‌نگار" loading="lazy" width={20} height={20} />
                                    <span className="sr-only">بله نی نگار</span>
                                </Link>
                                <Link
                                    href="https://web.eitaa.com/#@Neynegar1_ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-white px-1 py-0.5 rounded-md flex  justify-center items-center gap-1 w-7 h-7"
                                    itemProp="sameAs"
                                >
                                    <Image src={eitaa} className='object-contain' alt="لوگو ایتا نی‌نگار" loading="lazy" width={20} height={20} />
                                    <span className="sr-only">ایتا نی نگار</span>
                                </Link>
                                <Link
                                    href="https://web.rubika.ir/neynegar1_ir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 bg-white px-1 py-0.5 rounded-md flex  justify-center items-center gap-1 w-7 h-7"
                                    itemProp="sameAs"
                                >
                                    <Image src={rubika} className='object-contain' alt="لوگو روبیکا نی‌نگار" loading="lazy" width={20} height={20} />
                                    <span className="sr-only">روبیکا نی نگار</span>
                                </Link>
                            </div>
                        </div>
                        <Link
                            href="/about-us"
                            className="flex justify-center items-center gap-2 text-sm text-blue-900 hover:text-mist-500 active:text-mist-500"
                            itemProp="about-us"
                        >
                            درباره ما
                            <ArrowOutwardOutlined fontSize='inherit' />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col">
                    <h3 className="border-b-2 font-bold border-solid border-gray-300">مجوزات</h3>
                    <div className="flex-wrap gap-3 flex mt-4 justify-center items-center">
                        <div className="flex justify-center items-center bg-white p-1 rounded-xl w-26 h-26 mx-auto">
                            <Link
                                referrerPolicy="origin"
                                target="_blank"
                                rel="noopener noreferrer"
                                href='https://trustseal.enamad.ir/?id=686694&Code=C91P7WhXwyhhNl0NxdehrU3PdVm6ZMxB'
                                title="نماد اعتماد الکترونیکی"
                            >
                                <img
                                    referrerPolicy="origin"
                                    src='https://trustseal.enamad.ir/logo.aspx?id=686694&Code=C91P7WhXwyhhNl0NxdehrU3PdVm6ZMxB'
                                    className="w-full rounded-md"
                                    alt="نماد اعتماد الکترونیکی"
                                    loading="lazy"
                                />
                            </Link>
                        </div>
                        <div className="flex justify-center items-center bg-white p-1 rounded-xl w-26 h-26 mx-auto">
                            <Link
                                referrerPolicy="origin"
                                target="_blank"
                                rel="noopener noreferrer"
                                href='https://www.zarinpal.com/trustPage/neynegar1.ir'
                                title="نماد اعتماد زرین پال"
                            >
                                <img
                                    referrerPolicy="origin"
                                    src='https://cdn.zarinpal.com/badges/trustLogo/1.png'
                                    alt="نماد اعتماد زرین پال"
                                    loading="lazy"
                                />
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            <div className="bg-white rounded-t-xl">
                <p className="p-3 text-center">
                    {'کلیه حقوق برای '}
                    <Link href="/" className="text-blue-800 font-bold" itemProp="url">
                        <span itemProp="name">فروشگاه مجازی نی‌نگار</span>
                    </Link>
                    {' محفوظ است '}
                </p>
            </div>
        </footer >
    );
}

export default Footer;