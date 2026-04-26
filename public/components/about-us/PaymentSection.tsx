// mui components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// icons
import ExpandMore from "@mui/icons-material/ExpandMore";

const PaymentSection = () => {
    return (
        <section
            className="mt-16"
            aria-label="بخش شرایط و روش‌های پرداخت سایت نی‌نگار"
        >
            <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-6 text-shadow">
                شرایط و روش‌های پرداخت
            </h3>
            <div className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed text-shadow text-justify">
                <p className="px-3">
                    در فروشگاه ما، تلاش کرده‌ایم تا فرآیند پرداخت را برای شما تا حد امکان آسان و امن کنیم. شما می‌توانید با یکی از روش‌های زیر، هزینه سفارش خود را پرداخت نمایید:
                </p>
                <br />
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        1. پرداخت آنلاین از طریق درگاه بانکی
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`پس از نهایی کردن سفارش، به صفحه امن درگاه بانکی هدایت خواهید شد.
                        با استفاده از کارت بانکی عضو شبکه شتاب و رمز دوم (پویا) خود، می‌توانید هزینه را به صورت کاملاً امن از درگاه زرین پال پرداخت کنید.
                        پس از تکمیل پرداخت، سفارش شما ثبت نهایی شده و به مراحل آماده‌سازی ارسال می‌شود.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        2. پرداخت کارت به کارت
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`در صورتی که تمایل به استفاده از روش پرداخت کارت به کارت دارید، می‌توانید مبلغ سفارش را با هماهنگی پشتیبانی انجام دهید.
                        مهم: پس از انجام انتقال وجه، لطفاً از طریق بخش ارتباط با ما در انتهای سایت، اطلاعات پرداخت خود (شامل: شماره پیگیری، تاریخ و ساعت تراکنش، و مبلغ واریزی) را به ما اطلاع دهید تا سفارش شما پردازش شود.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        3. پرداخت در محل (در صورت امکان و وجود هماهنگی)
                    </AccordionSummary>
                    <AccordionDetails>
                        این گزینه تنها برای سفارش‌های داخل شهر تهران و پس از هماهنگی قبلی با تیم پشتیبانی مقدور است. لطفاً قبل از نهایی کردن سفارش، با ما تماس بگیرید.
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        نکات مهم در خصوص روش پرداخت
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`1. امنیت پرداخت: تمامی تراکنش‌های آنلاین از طریق درگاه‌های امن بانکی (زرین پال) انجام می‌شود و اطلاعات کارت شما نزد ما محفوظ خواهد ماند.
                        2. اطمینان از مبلغ: لطفاً پیش از پرداخت، از صحت اطلاعات سفارش و مبلغ نهایی اطمینان حاصل فرمایید.
                        3. پشتیبانی: در صورت بروز هرگونه مشکل یا نیاز به راهنمایی در فرآیند پرداخت، تیم پشتیبانی ما آماده پاسخگویی به شماست.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </section >
    );
}

export default PaymentSection;