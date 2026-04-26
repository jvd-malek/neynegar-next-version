// mui components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// icons
import ExpandMore from "@mui/icons-material/ExpandMore";

const TransmissionSection = () => {
    return (
        <section
            className="mt-16"
            aria-label="بخش شرایط و روش‌های ارسال سایت نی‌نگار"
        >
            <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-6 text-shadow">
                شرایط و روش‌های ارسال
            </h3>

            <div className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed text-shadow text-justify">
                <p className="px-3">
                    ما در فروشگاه نی‌نگار، متعهد به ارسال سریع و ایمن محصولات شما هستیم. برای اطمینان از اینکه کالاها به بهترین شکل به دستتان برسند، روش‌های ارسال متنوعی را در نظر گرفته‌ایم:
                </p>
                <br />
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        1. پست پیشتاز
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`این روش برای ارسال به سراسر نقاط کشور در دسترس است.
                                    پس از پردازش و آماده‌سازی سفارش (که معمولاً ۱ تا ۲ روز کاری زمان می‌برد)، بسته شما به اداره پست تحویل داده می‌شود.
                                    زمان تقریبی تحویل بسته توسط پست پیشتاز، ۱ تا ۳ روز کاری پس از تحویل به پست است (بسته به مسافت و محدوده جغرافیایی).
                                    شما می‌توانید با استفاده از کد رهگیری مرسوله پستی که برایتان ارسال می‌شود، وضعیت بسته‌تان را به صورت آنلاین پیگیری نمایید.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        2. پست سفارشی
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`این گزینه نیز برای ارسال به تمامی نقاط ایران قابل انتخاب است و معمولاً هزینه کمتری نسبت به پست پیشتاز دارد.
                                    زمان تحویل بسته‌های پستی سفارشی ممکن است کمی بیشتر از پست پیشتاز باشد (حدود ۲ تا ۵ روز کاری پس از تحویل به پست).
                                    کد رهگیری مرسوله برای پیگیری وضعیت بسته در دسترس خواهد بود.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        3. ارسال با پیک موتوری (ویژه شهر تهران)
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`برای مشتریان ساکن در شهر تهران، امکان ارسال سریع با پیک موتوری فراهم است.
                                    سفارشاتی که تا ساعت ۸ شب ثبت و نهایی شوند، در همان روز کاری تحویل پیک خواهند شد.
                                    هزینه ارسال با پیک موتوری بر اساس مسافت محاسبه و در هنگام نهایی کردن سفارش به اطلاع شما خواهد رسید.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        4. ارسال با باربری (برای سفارش‌های حجیم یا خاص)
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`در صورتی که سفارش شما شامل اقلام بسیار حجیم، سنگین یا نیازمند شرایط حمل و نقل ویژه‌ای باشد، ممکن است از طریق شرکت‌های باربری معتبر ارسال گردد.
                                    هزینه و زمان تحویل در این روش، پس از هماهنگی با شما تعیین خواهد شد.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        نکات مهم در خصوص ارسال
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`1. هزینه ارسال: هزینه ارسال بر اساس وزن بسته، روش انتخابی و مقصد شما محاسبه می‌شود و در صفحه سبد خرید قابل مشاهده است.
                                    2. بسته‌بندی: تمامی محصولات با دقت و به بهترین شکل ممکن بسته‌بندی می‌شوند تا در طول مسیر آسیبی به آن‌ها وارد نشود.
                                    3. رهگیری سفارش: پس از ارسال، کد رهگیری مرسوله پستی یا باربری برای شما به صورت پیامک و یا از طریق پیامرسان‌های موجود، ارسال خواهد شد.
                                    4. تأخیر احتمالی: لطفاً توجه داشته باشید که زمان‌های ذکر شده برای تحویل، تخمینی هستند و ممکن است به دلیل شرایط پیش‌بینی نشده (مانند شرایط جوی، ترافیک کاری پست یا باربری) با اندکی تأخیر مواجه شوند.
                                    5. تأیید آدرس: لطفاً در هنگام ثبت سفارش، آدرس دقیق پستی و کد پستی خود را به همراه شماره تماس معتبر وارد نمایید تا در فرآیند تحویل مشکلی پیش نیاید.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </section >
    );
}

export default TransmissionSection;