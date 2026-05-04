"use client"

// next and react
import Link from "next/link";
import { useEffect, useRef, useState } from 'react';

// utils
import { getCookie } from 'cookies-next';
import domtoimage from 'dom-to-image';
import { fetcher } from '@/public/utils/fetcher';
import { generateReceiptText } from "@/public/utils/receipt/generateReceiptText";
import ReceiptCopyButton from "@/public/utils/receipt/ReceiptCopyButton";

// icons
import DiscountInput from "@/public/components/basket/DiscountInput";

// components
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

// types
import { UserBasket } from "@/public/types/user";


function Receipt({ products, data }: {
    products: UserBasket[],
    data: {
        subtotal: number;
        totalDiscount: number;
        total: number;
        shippingCost: number;
        grandTotal: number;
        user: any
        basket: any;
    }
}) {

    const today = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date())

    const basket = getCookie('basketForm');
    const [DiscountCode, setDiscountCode] = useState(0)
    const [DiscountCodeString, setDiscountCodeString] = useState("")
    const [shipment, setShipment] = useState("")

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


    const baseTotal = basketForm?.shipment == "post" ? data.grandTotal : data.total;
    const extraDiscount = Math.floor(baseTotal * DiscountCode / 100);
    const finalPayable = Math.floor(baseTotal * (100 - DiscountCode) / 100);

    const receiptText = generateReceiptText(products, data, {
        name: basketForm.name,
        state: basketForm.state,
        city: basketForm.city,
        address: basketForm.address,
        shipment: basketForm.shipment,
        phone: basketForm.phone
    }, true);

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


    useEffect(() => {
        if (basket) {
            const basketForm = JSON.parse(basket as string)
            if (basketForm.shipment) {
                setShipment(basketForm.shipment)
            }
        }
    }, [basket])

    const submitHandler = async () => {

        try {
            const res = await fetcher(`
                mutation CreateCheckoutPayment($shipment: String!, $discountCode: String) {
                    createCheckoutPayment(shipment: $shipment, discountCode: $discountCode) {
                        authority
                        paymentURL
                        success
                        message
                    }
                }`,
                {
                    shipment: shipment == "post" ? "پست" : "پیک",
                    discountCode: DiscountCodeString
                }
            )

            if (res.createCheckoutPayment?.paymentURL) {
                window.location.href = res.createCheckoutPayment.paymentURL;
            }
        } catch (error) {
            console.log(error);
        }
    }

    // هزینه قابل پرداخت
    let total = data?.grandTotal ?
        (shipment == "post" ?
            data?.grandTotal * (100 - DiscountCode) / 100 :
            data?.total * (100 - DiscountCode) / 100)
        : 0

    return (
        <>
            <div ref={receiptRef} className={`w-full`}>
                <div className="bg-white border font-semibold rounded-lg shadow p-6 mt-6 mx-auto w-full flex flex-col justify-between" dir="rtl">
                    <div className="">
                        <h1 className="font-semibold text-2xl my-3 text-center text-slate-700">فروشگاه نی‌نگار</h1>
                        <hr className="mb-4" />
                        <div className="flex justify-between mb-4 sm:items-center items-start font-semibold">
                            <div className='flex items-center'>
                                <div className=" flex items-center gap-2">
                                    <div className="">
                                        <ReceiptRoundedIcon />
                                    </div>
                                    <p className=" whitespace-pre">{`پیش فاکتور  |   `}</p>
                                </div>
                                <p className=" font-normal text-sm">{today}</p>
                            </div>

                            <div className="flex md:items-center items-end gap-2 justify-end md:flex-row flex-col">
                                <ReceiptCopyButton receiptText={receiptText} />
                                <button
                                    onClick={handleDownloadImage}
                                    className="flex items-center gap-2
                        px-4 py-1
                        text-sm font-medium cursor-pointer
                        transition-all duration-75 text-nowrap bg-black hover:bg-slate-900 w-fit rounded-md text-white"
                                >
                                    تصویر رسید
                                </button>
                            </div>
                        </div>
                        <div className="mb-8">
                            <div className="mb-4">{basketForm?.name}</div>
                            <div className="mb-2">{`${basketForm?.state}/${basketForm?.city}`}</div>
                            <div className="mb-2">{basketForm?.address}</div>
                            <div className="bg-slate-200 border-slate-300 border-solid border-2 rounded-md w-fit px-2 py-1">{basketForm?.shipment == "bike" ? "ارسال با پیک" : "ارسال با پست"}</div>

                            <div className="overflow-x-auto">
                                <table className="w-full  bg-white border border-gray-200 rounded-lg mt-6">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-1.5 text-right">نام محصول</th>
                                            <th className="px-3 py-1.5 text-right">قیمت</th>
                                            <th className="px-3 py-1.5 text-right">تخفیف</th>
                                            <th className="px-3 py-1.5 text-right">تعداد</th>
                                            <th className="px-3 py-1.5 text-right">قیمت نهایی</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products?.map((product: any, index: any) => {
                                            const price = Number(product.currentPrice);
                                            const discount = Number(product.currentDiscount);
                                            const count = Number(product.count);
                                            const finalPrice = price * (100 - discount) / 100 * count;
                                            const isPackage = product.packageId ? true : false
                                            const title = isPackage ? product.packageId.title : product.productId.title
                                            return (
                                                <tr key={index} className="border-t">
                                                    <td className="px-3 py-1.5">{title}</td>
                                                    <td className="px-3 py-1.5">
                                                        {price.toLocaleString()}
                                                        <span className="text-xs font-medium text-mist-500"> تومان</span>
                                                    </td>
                                                    <td className="px-3 py-1.5">{discount}%</td>
                                                    <td className="px-3 py-1.5">{count}</td>
                                                    <td className="px-3 py-1.5">
                                                        {finalPrice.toLocaleString()}
                                                        <span className="text-xs font-medium text-mist-500"> تومان</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <table className="w-fit bg-white border border-gray-200 rounded-lg mt-6">
                                <thead className="bg-gray-50 font-bold">
                                    <tr>
                                        <td className="px-3 py-1.5 text-right">جمع کل</td>
                                        <td className="px-3 py-1.5 text-right">تخفیف{DiscountCode ? ` (کد: ${DiscountCodeString})` : ''}</td>
                                        <td className="px-3 py-1.5 text-right">هزینه ارسال</td>
                                        <td className="px-3 py-1.5 text-right">مبلغ نهایی</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-3 py-1.5">
                                            {data.subtotal.toLocaleString('fa-IR')}
                                            <span className="text-xs font-medium text-mist-500"> تومان</span>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            {(data.totalDiscount + extraDiscount).toLocaleString('fa-IR')}
                                            <span className="text-xs font-medium text-mist-500"> تومان</span>
                                        </td>
                                        <td className={`px-3 py-1.5 ${basketForm.shipment == "bike" && "text-xs"}`}>
                                            {basketForm?.shipment == "post" ? data.shippingCost.toLocaleString('fa-IR') : "دریافت هزینه در مقصد"}
                                            <span className={`text-xs font-medium text-mist-500 ${basketForm.shipment == "bike" && "hidden"}`}> تومان</span>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            {finalPayable.toLocaleString('fa-IR')}
                                            <span className="text-xs font-medium text-mist-500"> تومان</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="text-gray-700" id="discount-code">از سفارش شما سپاس‌گذاریم. ❤️</div>
                    </div>
                </div>
            </div>

            <div
                className={`p-4 w-full rounded-lg bg-white mt-6`}>
                <DiscountInput
                    DiscountCode={DiscountCode}
                    setDiscountCode={setDiscountCode}
                    DiscountCodeString={DiscountCodeString}
                    setDiscountCodeString={setDiscountCodeString}
                    user={data?.user}
                />
            </div>

            {/* sm => cost box */}
            <div className={`sm:flex hidden p-4  w-full rounded-lg bg-white items-center justify-between mt-6`}>

                <div className="flex justify-around w-full items-center gap-6 font-bold text-slate-800">
                    <h3 className="">مبلغ قابل پرداخت:</h3>
                    <h2 className="flex justify-center items-center gap-0.5">
                        <strong>
                            {total.toLocaleString('fa-IR')}
                        </strong>
                        <span className='text-sm'> تومان</span>
                    </h2>
                </div>

                <button className={`transition-all duration-75 active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2.5 w-full rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                    onClick={() => submitHandler()}
                >
                    پرداخت
                </button>

            </div>

            {/* fixed cost box */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 shadow-md sm:hidden bg-white rounded-t-2xl px-4 w-full mx-auto py-2 text-center z-50 group">

                <div className="my-1.5 flex gap-2">
                    <Link
                        href="#discount-code"
                        className="w-full bg-black text-white py-1 rounded-lg text-sm text-center flex justify-center items-center gap-0.5"
                    >
                        کد تخفیف
                    </Link>
                    <p
                        className="w-full bg-mist-200 py-1 rounded-lg text-sm text-center flex justify-center items-center gap-0.5"
                    >
                        {total.toLocaleString('fa-IR')}
                        <span className="text-base">تومان</span>
                    </p>
                </div>

                <button className={`transition-all duration-75 active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2.5 w-full rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                    onClick={() => submitHandler()}
                >
                    پرداخت
                </button>

            </div>
        </>
    );
}
export default Receipt;