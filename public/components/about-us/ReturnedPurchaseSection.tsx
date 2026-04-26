// mui components
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// icons
import ExpandMore from "@mui/icons-material/ExpandMore";

const ReturnedPurchaseSection = () => {
    return (
        <section
            className="mt-16"
            aria-label="بخش شرایط تست و مرجوعی سایت نی‌نگار"
        >
            <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-6 text-shadow">
                تست و مرجوعی کالا
            </h3>

            <div className="text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed text-shadow text-justify">
                <p className="px-3">
                    ما در نی‌نگار، رضایت شما را در اولویت قرار می‌دهیم و تلاش می‌کنیم تا محصولاتی با بالاترین کیفیت به دست شما برسانیم. با این حال، درک می‌کنیم که ممکن است گاهی نیاز به تست یا مرجوعی کالا پیش بیاید. سیاست ما در این خصوص به شرح زیر است:
                </p>
                <br />
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        1. مهلت تست و بررسی
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`شما پس از دریافت کالا، به مدت ۷۲ ساعت فرصت دارید تا آن را به دقت بررسی و تست نمایید.
                در طول این مهلت، در صورت مشاهده هرگونه نقص فنی یا مغایرت با مشخصات ذکر شده در سایت، می‌توانید درخواست مرجوعی کالا را ثبت کنید.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        2. شرایط مرجوعی کالا
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`کالاهای معیوب یا آسیب‌دیده: اگر کالا در هنگام تحویل دارای نقص فنی، شکستگی، خراشیدگی یا هرگونه آسیب فیزیکی باشد (که ناشی از حمل و نقل نادرست نباشد و در توضیحات محصول به آن اشاره نشده باشد)، می‌توانید آن را مرجوع نمایید.

                مغایرت با مشخصات: در صورتی که کالای دریافت شده با مشخصات فنی، ظاهری یا توضیحات ارائه شده در صفحه محصول در سایت نی‌نگار مغایرت داشته باشد.

                عدم تطابق با نیاز (در شرایط خاص): این مورد تنها برای کتاب‌ها و لوازم هنری که ماهیت مصرفی ندارند و پلمپ آن‌ها باز نشده باشد، صدق می‌کند. در صورت باز شدن پلمپ یا استفاده، امکان مرجوعی صرفاً به دلیل عدم تطابق با نیاز وجود ندارد.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        3. کالاهای مشمول شرایط مرجوعی نمی‌شوند
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`کالاهایی که پلمپ آن‌ها باز شده است (مگر در مورد نقص فنی).
                کالاهایی که مورد استفاده قرار گرفته‌اند (مگر در مورد نقص فنی).
                کالاهای مصرفی مانند جوهر، رنگ، خمیرها و… پس از باز شدن پلمپ.
                لوازمی که به دلیل ماهیت خود، امکان تست دقیق توسط مشتری را ندارند و پس از استفاده، قابلیت مرجوعی را از دست می‌دهند.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        4. فرآیند ثبت درخواست مرجوعی
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`ابتدا با تیم پشتیبانی ما از طریق بخش ارتباط با ما در انتهای سایت و یا ارسال تیکت در پنل کاربری خود، تماس بگیرید و درخواست مرجوعی خود را با ذکر دلیل و شماره سفارش اعلام فرمایید.
                کارشناسان ما پس از بررسی اولیه، شما را راهنمایی خواهند کرد. در صورت تأیید درخواست، دستورالعمل‌های لازم برای ارسال کالا به شما داده خواهد شد.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        5. مسئولیت هزینه ارسال مرجوعی
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`در صورتی که مرجوعی به دلیل اشتباه از جانب فروشگاه (مانند ارسال کالای اشتباه، یا وجود نقص فنی/آسیب‌دیدگی تأیید شده) باشد، هزینه ارسال بر عهده فروشگاه خواهد بود.
                در غیر این صورت (مثلاً عدم تطابق با نیاز پس از باز شدن بسته)، هزینه ارسال بر عهده مشتری گرامی است.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        6. بررسی و تأیید مرجوعی
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`پس از دریافت کالای مرجوعی در انبار ما، کارشناسان فنی آن را مورد بررسی قرار می‌دهند.
                در صورت تأیید صحت شرایط مرجوعی، پردازش بازگشت وجه یا ارسال کالای جایگزین آغاز خواهد شد.
                بازگشت وجه معمولاً طی ۵ تا ۱۰ روز کاری پس از تأیید، به حساب مبدأ واریز می‌گردد.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        className="font-bold"
                    >
                        نکات مهم در خصوص شرایط مرجوعی کالا
                    </AccordionSummary>
                    <AccordionDetails>
                        <p className="whitespace-pre-line">
                            {`لطفاً قبل از ارسال کالا، حتماً با تیم پشتیبانی هماهنگ فرمایید.
                کالاهای مرجوعی باید در بسته‌بندی اولیه خود و به همراه تمامی اقلام، متعلقات و فاکتور خرید ارسال شوند.
                از نوشتن مستقیم بر روی بسته‌بندی اصلی کالا خودداری فرمایید.`}
                        </p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </section >
    );
}

export default ReturnedPurchaseSection;