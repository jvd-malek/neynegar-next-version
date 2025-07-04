'use client';

import { useState } from 'react';
import { orderType } from '@/lib/Types/order';
import { Modal } from '@mui/material';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

interface OrderListBoxProps {
    orders: orderType[];
    user?: {
        name: string;
        address: string;
    };
}

function OrderListBox({ orders, user }: OrderListBoxProps) {
    const [receipt, setReceipt] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<orderType | null>(null);
    const [orderVisibility, setOrderVisibility] = useState<Record<string, boolean>>({});

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

    return (
        <>
            {orders?.length > 0 ? (
                orders.map((order) => (
                    <div key={order._id} className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3 text-xs sm:text-sm">
                        <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                            <div>
                                <h2 className="md:text-lg text-shadow">سفارش {order._id.slice(0, 5)}</h2>
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
                                            <p>نحوه ارسال: {order.submition}</p>
                                            <p>قیمت کل: {order.totalPrice?.toLocaleString() || '0'} ریال</p>
                                            <p>تخفیف: {order.discount?.toLocaleString() || '0'} تومان</p>
                                            <p>شناسه پرداخت: {order.paymentId || 'نامشخص'}</p>
                                            {order.submition !== "پیک موتوری" && (
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
                                                                    src={`https://api.neynegar1.ir/imgs/${product.productId.cover}`}
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
                ))
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
                        <h1 className="font-bold text-2xl my-3 text-center text-slate-700">فروشگاه نی‌نگار</h1>
                        <hr className="mb-4" />
                        <div className="flex justify-between mb-4">
                            <div className="text-gray-700 leading-7">
                                <div>{`تاریخ: ${new Date(Number(selectedOrder?.createdAt)).toLocaleDateString('fa-IR')}`}</div>
                                <div>{`سفارش: ${selectedOrder?._id.slice(0, 5)}`}</div>
                                <div>{`کد رهگیری پرداخت: ${selectedOrder?.paymentId}`}</div>
                                {selectedOrder?.submition !== "پیک موتوری" && (
                                    <div>{`کد رهگیری پست: ${selectedOrder?.postVerify}`}</div>
                                )}
                            </div>
                            <div className="text-slate-800">
                                <ReceiptRoundedIcon />
                            </div>
                        </div>
                        <div className="mb-8">
                            <div className="text-gray-700 mb-4">{user?.name}</div>
                            <div className="text-gray-700 mb-2">{user?.address}</div>
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