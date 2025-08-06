"use client"
import { getCookie } from "cookies-next";
import { redirect } from "next/navigation";
import { animateScroll } from "react-scroll";
import DiscountInput from "./DiscountInput";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { notify } from '@/lib/utils/notify';

interface CostBoxProps {
    data: {
        user: any
        basket: any;
        subtotal: number;
        totalDiscount: number;
        total: number;
        shippingCost: number;
        grandTotal: number;
    };
    page: {
        page?: number;
        sort?: string;
        cat?: string;
        count?: number;
        search?: string;
        city?: string;
        activeLink?: string;
    };
}

function CostBox({ data, page }: CostBoxProps) {
    const jwt = getCookie('jwt');
    const basket = getCookie('basketForm');

    const [DiscountCode, setDiscountCode] = useState(0)
    const [shipment, setShipment] = useState("")

    useEffect(() => {
        if (basket) {
            const basketForm = JSON.parse(basket as string)
            if (basketForm.shipment) {
                setShipment(basketForm.shipment)
            }
        }
    }, [basket])

    const submitHandler = async () => {
        if (page.activeLink == "product") {
            animateScroll.scrollTo(300, {
                duration: 300,
                smooth: 'easeInOutQuart'
            })
            redirect("?activeLink=info")
        } else if (page.activeLink == "info") {
            if (basket) {
                const basketForm = JSON.parse(basket as string)
                if (
                    basketForm.phone &&
                    basketForm.name &&
                    basketForm.state &&
                    basketForm.city &&
                    basketForm.address &&
                    basketForm.postCode &&
                    basketForm.shipment
                ) {
                    animateScroll.scrollTo(300, {
                        duration: 300,
                        smooth: 'easeInOutQuart'
                    })
                    redirect(`?activeLink=shipment`)
                } else {
                    notify("لطفا تمامی اطلاعات مورد نیاز را به درستی پر کنید.", "warn")
                }
            } else {
                notify("لطفا تمامی اطلاعات مورد نیاز را به درستی پر کنید.", "warn")
            }
        } else if (page.activeLink == "shipment") {
            if (jwt) {
                const res = await fetcher(`
                            mutation CreateCheckoutPayment($shipment: String!, $discount: Float!) {
                                createCheckoutPayment(shipment: $shipment, discount: $discount) {
                                    authority
                                    paymentURL
                                    success
                                    message
                                }
                            }
                        `,
                    {
                        shipment,
                        discount: DiscountCode
                    }
                )

                if (res.createCheckoutPayment?.paymentURL) {
                    window.location.href = res.createCheckoutPayment.paymentURL;
                } else {
                    notify("خطا در ایجاد پرداخت", "error")
                }

            } else {
                notify("لطفا نحوه ارسال را انتخاب کنید.", "warn")
            }
        }
    }

    return (
        <>
            {/* starts of discount box */}
            <div className={`md:col-end-4 col-start-1 col-end-6 row-start-2 p-4 flex flex-col justify-around transition-all w-full rounded-xl bg-slate-200 `}>

                <DiscountInput DiscountCode={DiscountCode} setDiscountCode={setDiscountCode} user={data?.user} />

                <h3 className={`font-bold text-slate-800`}>
                    امکان ارسال با پیک موتوری برای ساکنین تهران
                </h3>
                <p className="text-slate-700">
                    افزودن کالا به سبد خرید به معنی رزرو آن نیست با توجه به محدودیت موجودی سبد خود را ثبت و خرید را تکمیل کنید.
                </p>
            </div>
            {/* ends of discount box */}

            {/* starts of cost box */}
            <div className={`md:col-start-4 col-start-1 text-slate-700 col-end-6 flex flex-col items-center gap-6 p-4 md:row-start-2 row-start-3 w-full rounded-xl transition-all bg-slate-200`}>

                <div className="flex justify-around w-full items-center gap-6 md:mt-0 mt-2">
                    <h3 className="">قیمت کل سفارش:</h3>
                    <h2>
                        <strong>{
                            data?.subtotal ?
                                (data?.subtotal).toLocaleString('fa-IR') : 0
                                    .toLocaleString('fa-IR')
                        } </strong><span className='text-sm'>تومان</span>
                    </h2>
                </div>
                <div className="flex justify-around w-full items-center gap-6">
                    <h3 className="">بسته‌بندی و ارسال:</h3>
                    {
                        shipment == "پیک" &&
                        <span className=' text-sm'>دریافت هزینه ارسال در مقصد</span>
                    }
                    {
                        !shipment &&
                        <span className=' text-sm'>وابسته به نوع ارسال</span>
                    }
                    {
                        shipment == "پست" &&
                        <h3>
                            <strong>{data?.shippingCost.toLocaleString('fa-IR')} </strong><span className='text-sm'>تومان</span>
                        </h3>
                    }
                </div>
                <div className="flex justify-around w-full items-center gap-6 md:mt-0 mt-2">
                    <h3 className="">تخفیف:</h3>
                    <h2>
                        <strong>{
                            data?.totalDiscount ?
                                (data?.totalDiscount + DiscountCode).toLocaleString('fa-IR') :
                                0
                                    .toLocaleString('fa-IR')} </strong><span className='text-sm'>تومان</span>
                    </h2>
                </div>
                <div className="flex justify-around w-full items-center gap-6 font-bold text-slate-800">
                    <h3 className="">قیمت قابل پرداخت:</h3>
                    <h2>
                        <strong>
                            {
                                data?.grandTotal ?
                                    ((shipment == "پست" ?
                                        data?.grandTotal * (100 - DiscountCode) / 100 :
                                        data?.total * (100 - DiscountCode) / 100))
                                        .toLocaleString('fa-IR') :
                                    0
                                        .toLocaleString('fa-IR')
                            }
                        </strong><span className='text-sm'> تومان</span>
                    </h2>
                </div>

                <button className={`transition-all duration-75 active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2.5 w-full rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                    onClick={() => submitHandler()}
                >
                    {page.activeLink == "shipment" ? "پرداخت" : "گام بعدی"}
                </button>

            </div>
            {/* ends of cost box */}
        </>
    );
}

export default CostBox;