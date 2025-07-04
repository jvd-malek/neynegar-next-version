"use client"
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import moment from 'jalali-moment';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { generateReceiptText } from './ReceiptUtils';
import ReceiptCopyButton from './ReceiptCopyButton';
import { useRef } from 'react';
import domtoimage from 'dom-to-image';
import { getCookie } from 'cookies-next';

function Receipt({ activeLink, products, data }: {
    activeLink: string,
    products: any,
    data: {
        subtotal: number;
        totalDiscount: number;
        total: number;
        shippingCost: number;
        grandTotal: number;
    }
}) {
    const today = moment().locale('fa').format('jD jMMMM jYYYY');
    const basket = getCookie('basketForm');
    let basketForm = {
        phone: '',
        name: '',
        state: '',
        city: '',
        address: '',
        postCode: '',
        shipment: '',
    };

    if (basket) {
        basketForm = JSON.parse(basket as string)
    }

    const receiptText = generateReceiptText(products, data, {
        name: basketForm.name,
        state: basketForm.state,
        city: basketForm.city,
        address: basketForm.address,
        shipment: basketForm.shipment
    });

    const receiptRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (receiptRef.current) {
            domtoimage.toPng(receiptRef.current)
                .then(function (dataUrl: string) {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = 'receipt.png';
                    link.click();
                })
                .catch(function (error: any) {
                    console.error('خطا در ساخت تصویر:', error);
                });
        }
    };

    return (
        <>
            <div className="flex md:items-center items-end gap-2 justify-end md:flex-row flex-col">
                <ReceiptCopyButton receiptText={receiptText} />
                <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-2
                        px-4 py-1
                        text-sm font-medium cursor-pointer
                        transition-all duration-75 bg-black hover:bg-slate-900 w-fit rounded-md text-white"
                >
                    دانلود تصویر رسید
                </button>
            </div>

            <div ref={receiptRef} className={`w-full md:pb-16 pt-16 pb-6 mx-auto text-slate-700 transition-all duration-700 ${activeLink == "shipment" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
                <div className="bg-white text-slate-800 border rounded-lg shadow-lg px-6 py-8 mt-12 mx-auto w-full flex flex-col justify-between" dir="rtl">
                    <div className="">
                        <h1 className="font-semibold text-2xl my-3 text-center text-slate-700">فروشگاه نی‌نگار</h1>
                        <hr className="mb-4" />
                        <div className="flex justify-between mb-4 items-center font-semibold">
                            <div className='flex items-center'>
                                <div className=" flex items-center gap-2">
                                    <div className=" text-slate-800">
                                        <ReceiptRoundedIcon />
                                    </div>
                                    <p className=" whitespace-pre">{`پیش فاکتور  |   `}</p>
                                </div>
                                <p className=" font-normal text-sm">{today}</p>
                            </div>

                        </div>
                        <div className="mb-8">
                            <div className="text-gray-700 mb-4">{basketForm?.name}</div>
                            <div className="text-gray-700 mb-2">{`${basketForm?.state}/${basketForm?.city}`}</div>
                            <div className="text-gray-700 mb-2">{basketForm?.address}</div>
                            <div className="text-gray-700 bg-slate-200 border-slate-300 border-solid border-2 rounded-md w-fit px-2 py-1">{basketForm?.shipment == "bike" ? "ارسال با پیک" : "ارسال با پست"}</div>
                        </div>
                        <table className="w-full mb-8 px-8">
                            <thead>
                                <tr>
                                    <th className="text-right font-semibold text-gray-700">محصول</th>
                                    <th className="text-left font-semibold text-gray-700">قیمت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p: any) => (
                                    <tr key={p._id}>
                                        <td className="text-right text-gray-700">{`${p.productId.title} (${p.count.toLocaleString('fa-IR')} عدد)`}</td>
                                        <td className="text-left text-gray-700">{p.price ? p.price.toLocaleString('fa-IR') : p.productId.price.toLocaleString('fa-IR')}
                                            <span className=" text-xs font-mono"> تومان</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="text-right font-semibold text-gray-700">جمع کل</td>
                                    <td className="text-left font-semibold text-gray-700">{data.subtotal.toLocaleString('fa-IR')}
                                        <span className="text-xs font-mono"> تومان</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-right font-semibold text-gray-700">تخفیف</td>
                                    <td className="text-left font-semibold text-gray-700">{data.totalDiscount.toLocaleString('fa-IR')}
                                        <span className=" text-xs font-mono"> تومان</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-right font-semibold text-gray-700">هزینه ارسال</td>
                                    <td className={`text-left font-semibold text-gray-700 ${basketForm.shipment == "bike" && "text-xs"}`}>{basketForm?.shipment == "post" ? data.shippingCost.toLocaleString('fa-IR') : "دریافت هزینه در مقصد"}
                                        <span className={`text-xs font-mono ${basketForm.shipment == "bike" && "hidden"}`}> تومان</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-right font-semibold text-gray-700">مبلغ نهایی</td>
                                    <td className="text-left font-semibold text-gray-700 whitespace-nowrap">{(basketForm?.shipment == "post" ? data.grandTotal : data.total).toLocaleString('fa-IR')}
                                        <span className=" text-xs font-mono"> تومان</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="text-gray-700">از سفارش شما سپاس‌گذاریم. ❤️</div>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center mt-4">
                <KeyboardArrowDownRoundedIcon
                    fontSize="large"
                    className="text-black w-16 h-16 animate-bounce duration-1000 infinite"
                    aria-hidden="true"
                />
            </div>
        </>
    );
}

export default Receipt;