// next
import Link from 'next/link';

// mui components
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';

// components
import ProductFeatures from './ProductFeatures';

// types
import { Product } from '@/public/types/product';
import PriceChart from './PriceChart';

interface ProductInfoAccordionProps {
    product: Product;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

const ProductInfoAccordion: React.FC<ProductInfoAccordionProps> = ({ product }) => {

    // لینک دسته‌بندی
    const majorLink = `/category/${product.majorCat}`;
    const minorLink = `/category/${product.majorCat}/${product.minorCat}`;
    const brandLink = `/category/${product.majorCat}/${product.minorCat}${product.brand ? `?cat=${product.brand}` : ''}`;

    // متن موجودی
    const stockStatus = product.showCount > 0
        ? 'موجود'
        : 'ناموجود';

    const stockColor = product.showCount > 0
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';

    return (
        <div id='info' className="w-full space-y-2 bg-white rounded-xl p-6 h-fit">

            <h5 className="text-lg font-bold mb-4">
                اطلاعات محصول
            </h5>


            {/* ============ ۱. اطلاعات پایه ============ */}
            <Accordion
                defaultExpanded
                className="shadow-sm border border-gray-200 rounded-lg before:hidden"
                sx={{ '&:before': { display: 'none' } }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    className="bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <InfoIcon className="text-blue-500" />
                        <p className="font-bold text-gray-800">
                            اطلاعات پایه
                        </p>
                    </div>
                </AccordionSummary>

                <AccordionDetails className="bg-white p-4">
                    <div className="space-y-4">

                        {/* عنوان */}
                        <div>
                            <h5 className="font-bold text-gray-900 mb-2">
                                {product.title}
                            </h5>
                        </div>

                        {/* توضیحات */}
                        <div>
                            <p className="text-gray-600 text-sm leading-7 line-clamp-3">
                                {product.desc}
                            </p>
                        </div>

                        {/* دسته‌بندی */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link
                                href={majorLink}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                                {product.majorCat}
                            </Link>

                            <span className="text-gray-400">/</span>

                            <Link
                                href={minorLink}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                                {product.minorCat}
                            </Link>

                            {product.brand && (
                                <>
                                    <span className="text-gray-400">/</span>
                                    <Link
                                        href={brandLink}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                        {product.brand}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>

            {/* ============ ۲. قیمت‌گذاری و موجودی ============ */}
            <Accordion
                defaultExpanded
                className="shadow-sm border border-gray-200 rounded-lg before:hidden"
                sx={{ '&:before': { display: 'none' } }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    className="bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <LocalOfferIcon className="text-red-500" />
                        <p className="font-bold text-gray-800">
                            قیمت‌گذاری و موجودی
                        </p>
                    </div>
                </AccordionSummary>

                <AccordionDetails className="bg-white p-4">
                    <div className="space-y-5">

                        {/* قیمت‌ها */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            {/* قیمت اصلی */}
                            <div className="flex items-center justify-between">
                                <p className="text-gray-600 text-sm">قیمت اصلی:</p>
                                <p className={`text-lg ${product.currentDiscount > 0 ? 'line-through text-gray-400' : 'font-bold text-gray-900'}`}>
                                    {formatPrice(product.currentPrice)}
                                </p>
                            </div>

                            {/* تخفیف */}
                            {product.currentDiscount > 0 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-600 text-sm">تخفیف:</p>
                                    <Chip
                                        label={`${product.currentDiscount.toLocaleString("Fa-IR")}%`}
                                        color="error"
                                        size="small"
                                        className="font-bold"
                                    />
                                </div>
                            )}

                            {/* 🆕 تاریخ انقضای تخفیف */}
                            {product.currentDiscount > 0 && product.discount.length > 0 && (() => {
                                const lastDiscount = product.discount[product.discount.length - 1];
                                const expiryDate = new Date(lastDiscount.date);
                                const now = new Date();
                                const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                                // فرمت تاریخ شمسی
                                const formattedDate = new Intl.DateTimeFormat('fa-IR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }).format(expiryDate);

                                return (
                                    <div className="flex items-center justify-between bg-red-50 rounded-lg p-2 border border-red-200">
                                        <p className="text-red-600 text-xs font-medium">
                                            ⏰ مهلت تخفیف:
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-red-700 text-xs font-bold">
                                                {formattedDate}
                                            </p>
                                            {daysLeft > 0 ? (
                                                <Chip
                                                    label={`${daysLeft.toLocaleString("Fa-IR")} روز باقیست`}
                                                    size="small"
                                                    className="bg-red-500 text-white text-xs h-6"
                                                />
                                            ) : (
                                                <Chip
                                                    label="امروز آخرین مهلت"
                                                    size="small"
                                                    className="bg-orange-500 text-white text-xs h-6"
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* قیمت نهایی */}
                            {product.currentDiscount > 0 && (
                                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                                    <p className="text-gray-800 font-bold text-sm">قیمت نهایی:</p>
                                    <p className="text-red-600 font-bold text-xl">
                                        {formatPrice(product.finalPrice)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* موجودی */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <InventoryIcon className={product.showCount > 0 ? 'text-green-500' : 'text-red-500'} />
                                <p className="font-bold text-gray-800 text-sm">وضعیت موجودی:</p>
                                <Chip
                                    label={stockStatus}
                                    className={`${stockColor} font-medium`}
                                    size="small"
                                />
                            </div>

                            {/* اگر موجودی دارد */}
                            {product.showCount > 0 ? (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-blue-800 text-xs leading-6">
                                            به دلیل محدودیت‌ها تعداد قابل خرید از سایت
                                            <span className="font-bold mx-1">{product.showCount}</span>
                                            عدد می‌باشد. اگر بیشتر نیاز دارین با ما هماهنگ کنین:
                                        </p>

                                        <div className="flex items-center gap-3 mt-3">
                                            {/* دکمه بله */}
                                            <a
                                                href="https://ble.ir/neynegarsupport"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <ChatIcon sx={{ fontSize: 18 }} />
                                                پشتیبانی بله
                                            </a>

                                            {/* دکمه تماس */}
                                            <a
                                                href="tel:09934242315"
                                                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <PhoneIcon sx={{ fontSize: 18 }} />
                                                تماس با ما
                                            </a>
                                        </div>
                                    </div>

                                    {/* محبوبیت */}
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-600 text-sm">محبوبیت:</p>
                                        <Rating
                                            value={product.popularity}
                                            readOnly
                                            precision={0.5}
                                            size="small"
                                        />
                                        <p className="text-gray-500 text-xs">
                                            ({product.popularity}/5)
                                        </p>
                                    </div>
                                </>
                            ) : (
                                /* اگر ناموجود است */
                                <>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-800 text-sm leading-6">
                                            متاسفانه این محصول در حال حاضر موجود نیست. برای اطلاع از موجودی و ثبت سفارش با ما در ارتباط باشید:
                                        </p>

                                        <div className="flex items-center gap-3 mt-3">
                                            {/* دکمه بله */}
                                            <a
                                                href="https://ble.ir/neynegarsupport"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <ChatIcon sx={{ fontSize: 18 }} />
                                                پشتیبانی بله
                                            </a>

                                            {/* دکمه تماس */}
                                            <a
                                                href="tel:09934242315"
                                                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <PhoneIcon sx={{ fontSize: 18 }} />
                                                تماس با ما
                                            </a>
                                        </div>
                                    </div>

                                    {/* محبوبیت */}
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-600 text-sm">محبوبیت:</p>
                                        <Rating
                                            value={product.popularity}
                                            readOnly
                                            precision={0.5}
                                            size="small"
                                        />
                                        <p className="text-gray-500 text-xs">
                                            ({product.popularity}/5)
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>

            {/* ============ ۳. ویژگی‌های محصول (شامل اطلاعات تکمیلی) ============ */}
            <Accordion
                className="shadow-sm border border-gray-200 rounded-lg before:hidden"
                sx={{ '&:before': { display: 'none' } }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    className="bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <InfoIcon className="text-purple-500" />
                        <p className="font-bold text-gray-800">
                            ویژگی‌های محصول
                        </p>
                    </div>
                </AccordionSummary>

                <AccordionDetails className="bg-white p-4">
                    <ProductFeatures
                        features={product.features}
                        size={product.size}
                        weight={product.weight}
                        publisher={product.publisher}
                        publishDate={product.publishDate}
                        brand={product.brand}
                    />
                </AccordionDetails>
            </Accordion>

            {/* ============ ۴. تاریخچه قیمت ============ */}
            <Accordion
                className="shadow-sm border border-gray-200 rounded-lg before:hidden"
                sx={{ '&:before': { display: 'none' } }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    className="bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <BarChartOutlined className="text-red-500" />
                        <p className="font-bold text-gray-800">
                            تاریخچه قیمت
                        </p>
                    </div>
                </AccordionSummary>

                <AccordionDetails className="bg-white p-1">
                    {product.price && product.price.length > 0 && (
                        <div className="mt-4">
                            <PriceChart
                                priceHistory={product.price}
                            />
                        </div>
                    )}
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default ProductInfoAccordion;