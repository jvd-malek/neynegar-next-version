'use client';

import { useState, useEffect } from 'react';
import { orderType, paginatedOrdersType } from '@/lib/Types/order';
import { Modal } from '@mui/material';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import PaginationBox from './Pagination/PaginationBox';
import { generateReceiptText } from './BasketBoxes/ReceiptUtils';
import ReceiptCopyButton from './BasketBoxes/ReceiptCopyButton';
import { fetcher } from '../fetcher';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/utils/notify';

interface OrderListBoxProps {
    orders: paginatedOrdersType;
    user?: {
        name: string;
        address: string;
    };
    demo?: boolean
}

function getReceiptDataFromOrder(order: orderType) {
    // فرض: totalPrice در order به ریال است و discount به تومان
    // اگر shippingCost داری، استفاده کن، وگرنه ۰
    const totalDiscount = order.discount || 0;
    const subtotal = order.totalPrice / 10 + totalDiscount || 0;
    const shippingCost = (order as any).shippingCost || 0; // اگر shippingCost در order هست
    const total = order.totalPrice / 10;
    const grandTotal = total + shippingCost;
    return { subtotal, totalDiscount, total, shippingCost, grandTotal };
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
                        if (data?.verifyOrderPayment?.status && data.verifyOrderPayment.status !== "پرداخت نشده") {
                            notify("سفارش شما پرداختش تایید شد.", 'success');
                            router.refresh();
                        }
                    })
                    // .catch(err => {
                    //     notify("خطا در تایید پرداخت سفارش", 'error');
                    // });
                }
            });
        }
    }, [orders, demo]);

    // محدود کردن سفارشات در حالت demo
    const displayOrders = demo ? orders.orders.slice(0, 3) : orders.orders;

    const receiptText = selectedOrder
        ? generateReceiptText(
            selectedOrder.products,
            getReceiptDataFromOrder(selectedOrder),
            {
                name: user?.name || "",
                address: user?.address?.split("%%")[2] || "",
                state: user?.address?.split("%%")[0] || "",
                city: user?.address?.split("%%")[1] || "",
                shipment: selectedOrder.submition || "",
            }
        )
        : "";

    return (
        <>
            {/* Header - فقط در حالت غیر demo */}
            {!demo && (
                <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3 mb-6">
                    <p className="text-lg">سفارشات من</p>
                    <span className="text-sm text-gray-600">
                        {orders?.total || 0} سفارش
                    </span>
                </div>
            )}

            {displayOrders.length > 0 ? (
                <>
                    {displayOrders.map((order) => (
                        <div key={order._id} className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3 text-xs sm:text-sm">
                            <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                                <div>
                                    <h2 className="md:text-lg text-shadow">سفارش {order._id}</h2>
                                    <p className="text-sm text-gray-600">تاریخ: {order.createdAt ? new Date(Number(order.createdAt)).toLocaleDateString('fa-IR') : 'نامشخص'}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm justify-between">
                                    <button
                                        onClick={() => toggleOrderDetails(order._id)}
                                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        {orderVisibility[order._id] ? 'بستن جزئیات' : 'نمایش جزئیات'}
                                    </button>
                                    <button
                                        onClick={() => receiptHandler(order)}
                                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
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
                                                        return (
                                                            <tr key={index} className="border-t">
                                                                <td className="px-3 py-1.5">
                                                                    <img
                                                                        src={`https://api.neynegar1.ir/uploads/${product.productId.cover}`}
                                                                        alt={product.productId.title}
                                                                        className="w-20 h-20 object-cover rounded"
                                                                    />
                                                                </td>
                                                                <td className="px-3 py-1.5">{product.productId.title}</td>
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
                </>
            ) : (
                <p className="mt-5 bg-white shadow-cs py-1.5 px-3 rounded-xl text-center text-sm">سفارشی یافت نشد 😥</p>
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
                                <div>{`تاریخ: ${new Date(Number(selectedOrder?.createdAt)).toLocaleDateString('fa-IR')}`}</div>
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
                                    <th className="text-right font-bold text-gray-700">محصول</th>
                                    <th className="text-left font-bold text-gray-700">قیمت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder?.products.map((p, index) => (
                                    <tr key={index}>
                                        <td className="text-right text-gray-700">{`${p.productId.title}(${p.count.toLocaleString('fa-IR')})`}</td>
                                        <td className="text-left text-gray-700">{p.price ? p.price.toLocaleString('fa-IR') : p.productId.price[p.productId.price.length - 1].price.toLocaleString('fa-IR')}
                                            <span className="text-xs font-mono"> تومان</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="text-right font-bold text-gray-700">تخفیف</td>
                                    <td className="text-left font-bold text-gray-700">{selectedOrder?.discount.toLocaleString('fa-IR')}
                                        <span className="text-xs font-mono"> تومان</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-right font-bold text-gray-700">جمع کل</td>
                                    <td className="text-left font-bold text-gray-700">{`${selectedOrder?.totalPrice && ((selectedOrder.totalPrice / 10).toLocaleString('fa-IR'))} `}
                                        <span className="text-xs font-mono">تومان</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="text-gray-700">از سفارش شما سپاس‌گذاریم. ❤️</div>
                </div>
            </Modal>
        </>
    );
}

export default OrderListBox; 