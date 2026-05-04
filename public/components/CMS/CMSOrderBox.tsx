'use client'

import PaginationBox from '@/public/components/pagination/PaginationBox'
import SearchBox from './SearchBox';
import { useState } from 'react';
import useSWR from 'swr';
import { orderType } from '@/public/types/order';
import { Modal } from '@mui/material';
import { fetcher } from '@/public/utils/fetcher';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import ReceiptCopyButton from '@/public/utils/receipt/ReceiptCopyButton';
import { generateReceiptText } from '@/public/utils/receipt/generateReceiptText';
import { GET_ORDERS } from '@/public/graphql/orderQueries';

interface CMSOrderBoxProps {
    type: string;
    page: {
        page: number;
        count: number;
        search: string;
    };
}

// GraphQL Queries
const UPDATE_ORDER_STATUS = `
    mutation UpdateOrderStatus($id: ID!, $status: String!) {
        updateOrderStatus(id: $id, status: $status) {
            _id
            status
        }
    }
`;

const UPDATE_TRACKING_CODE = `
    mutation UpdateTrackingCode($id: ID!, $postVerify: String!) {
        updateOrderPostVerify(id: $id, postVerify: $postVerify) {
            _id
            postVerify
        }
    }
`;

const DELETE_ORDER = `
    mutation DeleteOrder($id: ID!) {
        deleteOrder(id: $id)
    }
`;

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

function CMSOrderBox({ type, page }: CMSOrderBoxProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<orderType | null>(null);
    const [orderVisibility, setOrderVisibility] = useState<Record<string, boolean>>({});
    const [trackingCode, setTrackingCode] = useState('');
    const [editingTrackingCode, setEditingTrackingCode] = useState<string | null>(null);
    const [receipt, setReceipt] = useState(false);

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

    const variables = {
        page: page.page,
        limit: page.count,
        search: page.search,
    };

    const { data, error, isLoading, mutate } = useSWR(
        [GET_ORDERS, variables],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    const products = getProductDataFromOrder(selectedOrder)
    const receiptData = getReceiptDataFromOrder(selectedOrder)
    const formData = {
        name: selectedOrder?.userId?.name || "",
        address: selectedOrder?.userId?.address?.split("%%")[2] || "",
        state: selectedOrder?.userId?.address?.split("%%")[0] || "",
        city: selectedOrder?.userId?.address?.split("%%")[1] || "",
        shipment: selectedOrder?.submition || "",
        discountCode: selectedOrder?.discountCode || "",
        phone: `${selectedOrder?.userId?.phone}` || "",
        postCode: `${selectedOrder?.userId?.postCode}` || "",
    }

    const receiptText = selectedOrder ? generateReceiptText(products, receiptData, formData) : "";

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            setIsSaving(true);
            await fetcher(UPDATE_ORDER_STATUS, {
                id: orderId,
                status: newStatus
            });
            await mutate();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('خطا در بروزرسانی وضعیت سفارش');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateTrackingCode = async (orderId: string) => {
        try {
            setIsSaving(true);
            await fetcher(UPDATE_TRACKING_CODE, {
                id: orderId,
                postVerify: trackingCode
            });
            await mutate();
            setEditingTrackingCode(null);
            setTrackingCode('');
        } catch (error) {
            console.error('Error updating tracking code:', error);
            alert('خطا در بروزرسانی کد رهگیری');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        try {
            setIsSaving(true);
            await fetcher(DELETE_ORDER, { id: orderId });
            await mutate();
            setDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('خطا در حذف سفارش');
        } finally {
            setIsSaving(false);
        }
    };

    if (error) {
        return (
            <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
                <div className="flex justify-center items-center h-40">
                    <p className="text-red-500">خطا در دریافت اطلاعات</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20">
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
            </div>
        );
    }

    const orders = data?.orders;

    return (
        <>
            <div className={`bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-2 row-start-3 pt-20`}>
                <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    {type}
                </h3>

                <div className="flex justify-center absolute top-4 left-3 items-center gap-2 pl-2 text-white bg-black w-40 rounded-lg shadow-md overflow-hidden">
                    <SearchBox search={page.search} />
                </div>

                {(orders && orders.orders.length > 0) ? orders.orders.map((order: orderType) => (
                    <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3 text-xs sm:text-sm" key={order._id}>
                        <div className="flex md:flex-row flex-col justify-between items-center gap-2">
                            <div>
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
                            <div className={`flex items-center gap-2 text-xs sm:text-sm justify-between`}>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                    className={`px-3 py-1.5 border rounded-lg ${(order.status == "در انتظار تایید" || order.status == 'در حال آماده‌سازی') && "bg-lime-100"} ${(order.status == "پرداخت نشده" || order.status == "لغو شد") && "bg-rose-100"}`}
                                    disabled={isSaving}
                                >
                                    <option value="پرداخت نشده">پرداخت نشده</option>
                                    <option value="در انتظار تایید">در انتظار تایید</option>
                                    <option value='در حال آماده‌سازی'>در حال آماده‌سازی</option>
                                    <option value="ارسال شد">ارسال شد</option>
                                    <option value="تحویل داده‌شد">تحویل داده‌شد</option>
                                    <option value="لغو شد">لغو شد</option>
                                </select>

                                <button
                                    onClick={() => toggleOrderDetails(order._id)}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs sm:text-sm"
                                >
                                    {orderVisibility[order._id] ? 'بستن جزئیات' : 'نمایش جزئیات'}
                                </button>

                                <button
                                    onClick={() => receiptHandler(order)}
                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs sm:text-sm"
                                >
                                    فاکتور
                                </button>
                            </div>
                        </div>

                        {orderVisibility[order._id] && (
                            <div className="mt-4 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">اطلاعات مشتری</h3>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p>نام: {order.userId?.name || 'نامشخص'}</p>
                                            <p>تلفن: {order.userId?.phone || 'نامشخص'}</p>
                                            <p>آدرس: {order.userId?.address || 'نامشخص'}</p>
                                            <p>کد پستی: {order.userId?.postCode || 'نامشخص'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">اطلاعات سفارش</h3>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p>نحوه ارسال: {order.submition}</p>
                                            <p>قیمت کل: {order.totalPrice?.toLocaleString() || '0'} ریال</p>
                                            <p>وزن کل: {order.totalWeight?.toLocaleString() + " گرم" || 'نامشخص'}</p>
                                            {order.submition == "پست" &&
                                                <p>هزینه ارسال: {order.shippingCost?.toLocaleString() || '0'} تومان</p>
                                            }
                                            <p>تخفیف: {order.discount?.toLocaleString() || '0'} تومان</p>
                                            {order?.discountCode &&
                                                <p>کد تخفیف: {order?.discountCode}</p>
                                            }
                                            <p>شناسه پرداخت: {order.paymentId || 'نامشخص'}</p>
                                            <p>کد رهگیری: {order.postVerify || 'نامشخص'}</p>
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


                        <div className="flex md:justify-end justify-center gap-2 mt-4">
                            {
                                (order.status === "ارسال شد" || order.status === "تحویل داده‌شد") && (
                                    editingTrackingCode === order._id ?
                                        (
                                            <div className="flex md:flex-row w-full flex-col gap-2">
                                                <input
                                                    type="text"
                                                    value={trackingCode}
                                                    onChange={(e) => setTrackingCode(e.target.value)}
                                                    placeholder="کد رهگیری"
                                                    className="px-3 py-1.5 border rounded-lg text-sm"
                                                    disabled={isSaving}
                                                />
                                                <button
                                                    onClick={() => handleUpdateTrackingCode(order._id)}
                                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingTrackingCode(null);
                                                        setTrackingCode('');
                                                    }}
                                                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                                    disabled={isSaving}
                                                >
                                                    انصراف
                                                </button>
                                            </div>
                                        ) :
                                        (
                                            <button
                                                onClick={() => {
                                                    setEditingTrackingCode(order._id);
                                                    setTrackingCode(order.postVerify || '');
                                                }}
                                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600"
                                            >
                                                {order.postVerify ? 'ویرایش کد رهگیری' : 'افزودن کد رهگیری'}
                                            </button>
                                        )
                                )}
                            <button
                                className="bg-red-500 cursor-pointer w-full text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setDeleteModalOpen(true);
                                }}
                                disabled={isSaving}
                            >
                                حذف سفارش
                            </button>
                        </div>
                    </div>
                )) :
                    <p className="mt-5 bg-white shadow-cs py-1.5 px-3 rounded-xl text-center text-sm">سفارشی یافت نشد 😥</p>
                }

                {/* Pagination */}
                {orders && orders.totalPages > 1 && (
                    <div className="mt-4">
                        <PaginationBox
                            count={orders.totalPages}
                            currentPage={orders.currentPage}
                        />
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedOrder(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <h3 className="text-lg font-bold mb-4">حذف سفارش</h3>
                        <p className="mb-6">
                            آیا از حذف سفارش شماره "{selectedOrder?._id}" اطمینان دارید؟
                            این عملیات غیرقابل بازگشت است.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder?._id || '')}
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                {isSaving ? 'در حال حذف...' : 'حذف'}
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setSelectedOrder(null);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </Modal>

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
                                        }).format(new Date(Number(selectedOrder?.createdAt)))}`}                                        </div>
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
                                <div className="text-gray-700">{selectedOrder?.userId?.name}</div>
                                <div className="text-gray-700">{`تلفن: ${selectedOrder?.userId?.phone}`}</div>
                                <div className="text-gray-700">{`کد پستی: ${selectedOrder?.userId?.postCode}`}</div>
                                <div className="text-gray-700 mb-2">{selectedOrder?.userId?.address?.split("%%").join("-")}</div>
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
            </div>
        </>
    );
}

export default CMSOrderBox;