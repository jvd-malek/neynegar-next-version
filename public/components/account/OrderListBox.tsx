'use client';

// next and react
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// components
import Modal from '@mui/material/Modal';
import PaginationBox from '@/public/components/pagination/PaginationBox';

// utils
import { fetcher } from '@/public/utils/fetcher';
import { notify } from '@/public/utils/notify';
import ReceiptCopyButton from '@/public/utils/receipt/ReceiptCopyButton';
import { generateReceiptText } from '@/public/utils/receipt/generateReceiptText';

// icons
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

// types
import { orderType, paginatedOrdersType } from '@/public/types/order';

interface OrderListBoxProps {
    orders: paginatedOrdersType;
    user?: {
        name: string;
        address: string;
    };
    demo?: boolean
}

function getReceiptDataFromOrder(order: orderType | null) {
    const totalDiscount = order?.discount || 0;
    const shippingCost = order ? order.shippingCost : 0;
    const subtotal = order ? (order.totalPrice / 10) - shippingCost + totalDiscount : 0;
    const total = order ? (order.totalPrice / 10) - shippingCost : 0;
    const grandTotal = order ? order.totalPrice / 10 : 0;
    return { subtotal, totalDiscount, total, shippingCost, grandTotal };
}

function getProductDataFromOrder(order: any) {
    const data = order?.products.map((product: any) => {
        return {
            count: product.count,
            productId: product.productId,
            packageId: product.packageId,
            currentPrice: product.price,
            currentDiscount: product.discount,
            itemTotal: 0,
            itemDiscount: 0,
            itemWeight: 0
        }
    })
    return data;
}

function OrderListBox({ orders, user, demo = false }: OrderListBoxProps) {

    const [receipt, setReceipt] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<orderType | null>(null);
    const [orderVisibility, setOrderVisibility] = useState<Record<string, boolean>>({});
    const router = useRouter()

    const toggleOrderDetails = (orderId: string) => {
        setOrderVisibility(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const receiptHandler = (order: orderType) => {
        setReceipt(!receipt);
        setSelectedOrder(order);
    };

    useEffect(() => {
        if (!demo && orders?.orders?.length > 0) {
            orders.orders.forEach(order => {
                const authority = (order as any).authority;
                if (order.status === "پرداخت نشده" && authority) {

                    fetcher(`
                        mutation VerifyOrderPayment($orderId: ID!) {
                            verifyOrderPayment(orderId: $orderId) {
                                _id
                                status
                                paymentId
                            }
                        }
                    `, { orderId: order._id })
                        .then(data => {
                            console.log(data);
                            if (data?.verifyOrderPayment?.status && data.verifyOrderPayment.status !== "پرداخت نشده") {
                                notify("سفارش شما پرداختش تایید شد.", 'success');
                                router.refresh();
                            }
                        })
                }
            });
        }
    }, [orders, demo]);

    // محدود کردن سفارشات در حالت demo
    const displayOrders = demo ? orders.orders.slice(0, 3) : orders.orders;

    const products = getProductDataFromOrder(selectedOrder)
    const data = getReceiptDataFromOrder(selectedOrder)
    const formData = {
        name: user?.name || "",
        address: user?.address?.split("%%")[2] || "",
        state: user?.address?.split("%%")[0] || "",
        city: user?.address?.split("%%")[1] || "",
        shipment: selectedOrder?.submition || "",
        discountCode: selectedOrder?.discountCode || "",
        postCode: `${selectedOrder?.userId?.postCode}` || ""
    }

    const receiptText = selectedOrder ? generateReceiptText(products, data, formData) : "";


    return (
        <>

            {displayOrders.map((order) => (
                <div key={order._id} className="mt-5 bg-white font-semibold py-4 px-6 rounded-xl flex flex-col gap-3 text-xs sm:text-sm">
                    <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                        <div className='sm:border-none border-b border-mist-300 w-full sm:pb-0 pb-4'>
                            <h2 className="md:text-lg text-shadow">سفارش {order._id}</h2>
                            <p className="text-sm text-gray-600">
                                {`تاریخ: ${order.createdAt ?
                                    new Intl.DateTimeFormat('fa-IR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }).format(new Date(Number(order.createdAt)))
                                    : 'نامشخص'}
                                    `}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm justify-between sm:mt-0 mt-4">
                            <button
                                onClick={() => toggleOrderDetails(order._id)}
                                className="px-3 py-1.5 bg-blue-500 text-nowrap text-white rounded hover:bg-blue-600"
                            >
                                {orderVisibility[order._id] ? 'بستن جزئیات' : 'نمایش جزئیات'}
                            </button>
                            <button
                                onClick={() => receiptHandler(order)}
                                className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                فاکتور
                            </button>
                        </div>
                    </div>

                    {orderVisibility[order._id] && (
                        <div className="mt-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold mb-2">اطلاعات سفارش</h3>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p>وضعیت: {order.status}</p>
                                        <p>نحوه ارسال: {order.submition ?? "انتخاب نشده"}</p>
                                        <p>قیمت کل: {(order.totalPrice / 10).toLocaleString() || '0'} تومان</p >
                                        <p>تخفیف: {order.discount?.toLocaleString() || '0'} تومان</p>
                                        {selectedOrder?.discountCode &&
                                            <p>کد تخفیف: {selectedOrder?.discountCode}</p>
                                        }
                                        <p>شناسه پرداخت: {order.paymentId || 'نامشخص'}</p>
                                        {order.submition !== "پیک" && order.postVerify && (
                                            <p>کد رهگیری: {order.postVerify || 'نامشخص'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">محصولات</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full bg-white border border-gray-200 rounded-lg">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-1.5 text-right">تصویر</th>
                                                <th className="px-3 py-1.5 text-right">نام محصول</th>
                                                <th className="px-3 py-1.5 text-right">قیمت</th>
                                                <th className="px-3 py-1.5 text-right">تخفیف</th>
                                                <th className="px-3 py-1.5 text-right">تعداد</th>
                                                <th className="px-3 py-1.5 text-right">قیمت نهایی</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.products?.map((product, index) => {
                                                const price = Number(product.price);
                                                const discount = Number(product.discount);
                                                const count = Number(product.count);
                                                const finalPrice = price * (100 - discount) / 100 * count;
                                                const isPackage = product.packageId ? true : false
                                                const title = isPackage ? product.packageId.title : product.productId.title
                                                const cover = isPackage ? product.packageId.cover : product.productId.cover

                                                return (
                                                    <tr key={index} className="border-t">
                                                        <td className="px-3 py-1.5">
                                                            <img
                                                                src={`https://api.neynegar1.ir/uploads/${cover}`}
                                                                alt={title}
                                                                className="w-20 h-20 object-cover rounded"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-1.5">{title}</td>
                                                        <td className="px-3 py-1.5">{price.toLocaleString()} تومان</td>
                                                        <td className="px-3 py-1.5">{discount}%</td>
                                                        <td className="px-3 py-1.5">{count}</td>
                                                        <td className="px-3 py-1.5">{finalPrice.toLocaleString()} تومان</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Pagination - فقط در حالت غیر demo */}
            {!demo && orders.totalPages > 1 && (
                <PaginationBox
                    count={orders.totalPages}
                    currentPage={orders.currentPage}
                />
            )}

            {/* Receipt Modal */}
            <Modal
                open={receipt}
                onClose={() => setReceipt(false)}
            >
                <div className="bg-white text-slate-800 border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[95vw] h-[80vh] overflow-y-scroll scroll-smooth scrollbar-hidden flex flex-col justify-between" dir="rtl">
                    <div className="">
                        <div className="flex justify-between items-center">
                            <h1 className="font-bold text-2xl my-3 text-center text-slate-700">
                                فروشگاه نی‌نگار
                            </h1>
                            <div className="text-slate-800">
                                <ReceiptRoundedIcon />
                            </div>
                        </div>
                        <hr className="mb-4" />
                        <div className="flex justify-between mb-4">
                            <div className="text-gray-700 leading-7">
                                <div>
                                    {`تاریخ: ${new Intl.DateTimeFormat('fa-IR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }).format(new Date(Number(selectedOrder?.createdAt)))}`}
                                </div>
                                <div>{`سفارش: ${selectedOrder?._id}`}</div>
                                {selectedOrder?.paymentId &&
                                    <div>{`کد رهگیری پرداخت: ${selectedOrder?.paymentId ?? "نامشخص"}`}</div>
                                }
                                {selectedOrder?.submition !== "پیک" && selectedOrder?.postVerify && (
                                    <div>{`کد رهگیری پست: ${selectedOrder?.postVerify}`}</div>
                                )}
                            </div>
                            <div className="">
                                <ReceiptCopyButton receiptText={receiptText} />
                            </div>
                        </div>
                        <div className="mb-8">
                            <div className="text-gray-700 mb-2">{user?.name}</div>
                            <div className="text-gray-700 mb-2">{user?.address?.split("%%").join("-")}</div>
                            <div className="text-gray-700 bg-slate-200 border-slate-300 border-solid border-2 rounded-md w-fit px-2 py-1">{selectedOrder?.submition}</div>
                        </div>
                        <table className="w-full mb-8 px-8">
                            <thead>
                                <tr>
                                    <th className="px-3 py-1.5 text-right">نام محصول</th>
                                    <th className="px-3 py-1.5 text-right">قیمت</th>
                                    <th className="px-3 py-1.5 text-right">تعداد</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder?.products.map((product, index) => {
                                    const price = Number(product.price);
                                    const discount = Number(product.discount);
                                    const count = Number(product.count);
                                    const finalPrice = price * (100 - discount) / 100 * count;
                                    const isPackage = product.packageId ? true : false
                                    return (
                                        <tr key={index} className="border-t">
                                            <td className="px-3 py-1.5">{isPackage ? product.packageId.title : product.productId.title}</td>
                                            <td className="px-3 py-1.5 text-nowrap">
                                                {finalPrice.toLocaleString()}
                                                <span className="text-xs font-medium text-mist-500"> تومان</span>
                                            </td>
                                            <td className="px-3 py-1.5">{count}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <table className="bg-white border border-gray-200 rounded-lg mt-6">
                            <thead className="bg-gray-50 font-bold">
                                <tr>
                                    <td className="px-3 py-1.5 text-right">تخفیف{selectedOrder?.discountCode ? ` (کد: ${selectedOrder?.discountCode})` : ''}</td>
                                    <td className="px-3 py-1.5 text-right">هزینه ارسال</td>
                                    <td className="px-3 py-1.5 text-right">مبلغ نهایی</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-3 py-1.5">
                                        {selectedOrder?.discount.toLocaleString('fa-IR')}
                                        <span className="text-xs font-medium text-mist-500"> تومان</span>
                                    </td>
                                    <td className={`px-3 py-1.5 ${selectedOrder?.submition == "پیک" && "text-xs"}`}>
                                        {selectedOrder?.submition == "پست" ? selectedOrder.shippingCost.toLocaleString('fa-IR') : "دریافت هزینه در مقصد"}
                                        <span className={`text-xs font-medium text-mist-500 ${selectedOrder?.submition == "پیک" && "hidden"}`}> تومان</span>
                                    </td>
                                    <td className="px-3 py-1.5">
                                        {selectedOrder?.totalPrice.toLocaleString('fa-IR')}
                                        <span className="text-xs font-medium text-mist-500"> تومان</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="text-gray-700 mt-4">از سفارش شما سپاس‌گذاریم. ❤️</div>
                </div>
            </Modal>
        </>
    );
}

export default OrderListBox; 