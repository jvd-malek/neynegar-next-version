// next
import Link from 'next/link';

// mui components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionActions from '@mui/material/AccordionActions';

// icons
import ExpandMore from "@mui/icons-material/ExpandMore";
import KeyboardBackspaceRounded from '@mui/icons-material/KeyboardBackspaceRounded';

const AboutUsSection = () => {
    return (
        <section
            className="mt-12"
            aria-label="بخش درباره ما سایت نی‌نگار"
        >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6 text-shadow">
                درباره نی‌نگار
            </h2>
            <div className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed text-shadow text-justify">
                <p className="px-3">
                    به دنیای هنر و قلم خوش آمدید! نی‌نگار، گنجینه‌ای از بهترین‌ها برای علاقه‌مندان به کتاب‌های نفیس و تخصصی در حوزه هنر، خوشنویسی و صنایع دستی، و همچنین مرکز عرضه لوازم باکیفیت هنری است. ما اینجا هستیم تا با ارائه محصولاتی منحصر به فرد و آموزشی، شما را در مسیر خلاقیت و شکوفایی هنری همراهی کنیم.
                </p>
                <p className="px-3 font-bold mt-2 animate-pulse">چرا نی‌نگار؟</p>
                <br />

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        تخصص در خوشنویسی
                    </AccordionSummary>
                    <AccordionDetails>
                        کلکسیونی بی‌نظیر از کتاب‌های مرجع، آثار استادان، و راهنماهای جامع برای علاقه‌مندان به هنر خوشنویسی، از نستعلیق و شکسته گرفته تا سایر سبک‌ها.
                    </AccordionDetails>
                    <AccordionActions>
                        <Link
                            href="/category/کتاب/خوشنویسی"
                            className='text-base text-mist-700 flex items-center gap-1 px-3 py-2 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors duration-200 group'
                            aria-label='تازه‌ترین کتاب‌های خوشنویسی'
                        >
                            تازه‌ترین کتاب‌های خوشنویسی
                            <KeyboardBackspaceRounded
                                className="text-lg transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse group-hover:animate-none group-active:-translate-x-1 group-active:animate-none"
                                aria-hidden="true"
                            />
                        </Link>
                    </AccordionActions>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        لوازم هنری درجه یک
                    </AccordionSummary>
                    <AccordionDetails>
                        مجموعه‌ای منتخب از بهترین قلم‌ها، مرکب‌ها، کاغذها، ابزار خوشنویسی و سایر لوازم مورد نیاز هنرمندان، که با دقت انتخاب شده‌اند تا کیفیت و تجربه کاربری شما را ارتقا دهند.
                    </AccordionDetails>
                    <AccordionActions>
                        <Link
                            href="/category/لوازم خوشنویسی"
                            className='text-base text-mist-700 flex items-center gap-1 px-3 py-2 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors duration-200 group'
                            aria-label='لوازم خوشنویسی'
                        >
                            لوازم خوشنویسی
                            <KeyboardBackspaceRounded
                                className="text-lg transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse group-hover:animate-none group-active:-translate-x-1 group-active:animate-none"
                                aria-hidden="true"
                            />
                        </Link>
                    </AccordionActions>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        آموزش تخصصی نستعلیق
                    </AccordionSummary>
                    <AccordionDetails>
                        با افتخار، دوره جامع آموزش نستعلیق را به صورت آنلاین ارائه می‌دهیم. این دوره، که توسط اساتید مجرب طراحی شده، شما را گام به گام از مبانی اولیه تا خلق آثار زیبا هدایت می‌کند.
                    </AccordionDetails>
                    <AccordionActions>
                        <Link
                            href="/course/6877cca190dcf6cc752ed4e2"
                            className='text-base text-mist-700 flex items-center gap-1 px-3 py-2 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors duration-200 group'
                            aria-label='دوره آموزشی نستعلیق'
                        >
                            دوره آموزشی نستعلیق
                            <KeyboardBackspaceRounded
                                className="text-lg transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse group-hover:animate-none group-active:-translate-x-1 group-active:animate-none"
                                aria-hidden="true"
                            />
                        </Link>
                    </AccordionActions>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        وبلاگ و مقالات هنری
                    </AccordionSummary>
                    <AccordionDetails>
                        ما فراتر از یک فروشگاه، یک مرجع فرهنگی هستیم. در وبلاگ ما، مقالات عمیق، نقد آثار، مصاحبه با هنرمندان و معرفی رویدادهای هنری را خواهید یافت که الهام‌بخش شما در مسیر هنری‌تان خواهد بود.
                    </AccordionDetails>
                    <AccordionActions>
                        <Link
                            href="/category/مقالات"
                            className='text-base text-mist-700 flex items-center gap-1 px-3 py-2 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors duration-200 group'
                            aria-label="مقالات تخصصی خوشنویسی و هنر"
                        >
                            آخرین مقالات
                            <KeyboardBackspaceRounded
                                className="text-lg transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse group-hover:animate-none group-active:-translate-x-1 group-active:animate-none"
                                aria-hidden="true"
                            />
                        </Link>
                    </AccordionActions>
                </Accordion>

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        تجربه خرید آسان و مطمئن
                    </AccordionSummary>
                    <AccordionDetails>
                        با رابط کاربری ساده، فرآیند خرید آسان، و پشتیبانی پاسخگو، تجربه‌ای دلنشین و امن را برای شما فراهم می‌کنیم.
                    </AccordionDetails>
                </Accordion>

                <p className="px-3 mt-6 text-mist-800">
                    چه یک هنرجوی تازه کار باشید که اولین قلم خود را به دست گرفته، چه یک استاد خوشنویس که به دنبال ابزاری خاص است، یا صرفاً فردی علاقه‌مند به دنیای زیبای هنر، فروشگاه نی‌نگار همراه همیشگی شماست.
                </p>
                <p className="px-3 mt-2">
                    با ما، قلمتان جاری و آثارتان ماندگار خواهد شد.
                </p>
            </div>
        </section >
    );
}

export default AboutUsSection;