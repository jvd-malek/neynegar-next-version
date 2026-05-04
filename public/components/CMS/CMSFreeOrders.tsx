'use client';

import { useState, useEffect } from 'react';
import { fetcher } from '@/public/utils/fetcher';
import useSWR from 'swr';
import Image from 'next/image';

interface Product {
    _id: string;
    title: string;
    cover: string;
    price: { price: number }[];
    discount: { discount: number }[];
    count: number;
    showCount: number;
    weight: number;
}

interface OrderProduct {
    productId: Product;
    price: number;
    discount: number;
    count: number;
}

interface FreeOrder {
    _id: string;
    products: OrderProduct[];
    totalPrice: number;
    status: string;
    userId: {
        _id: string;
        name: string;
        phone: string;
        address: string;
        postCode: number;
    };
    createdAt: string;
}

const GET_PRODUCTS = `
    query GetProducts($page: Int, $limit: Int, $search: String) {
        products(page: $page, limit: $limit, search: $search) {
            products {
                _id
                title
                cover
                price {
                    price
                }
                discount {
                    discount
                }
                count
                showCount
                weight
            }
        }
    }
`;

const GET_FREE_ORDERS = `
    query GetFreeOrders($page: Int, $limit: Int, $search: String) {
        freeOrders(page: $page, limit: $limit, search: $search) {
            orders {
                _id
                products {
                    productId {
                        _id
                        title
                        cover
                    }
                    price
                    discount
                    count
                }
                totalPrice
                status
                userId {
                    _id
                    name
                    phone
                    address
                    postCode
                }
                createdAt
            }
            totalPages
            currentPage
            total
        }
    }
`;

const CREATE_FREE_ORDER = `
    mutation CreateFreeOrder($input: FreeOrderInput!) {
        createFreeOrder(input: $input) {
            _id
            totalPrice
            status
        }
    }
`;

const GET_USER_BY_PHONE = `
    query GetUserByPhone($phone: String!) {
        userByPhone(phone: $phone) {
            _id
            name
            phone
            address
            postCode
        }
    }
`;

function CMSFreeOrders() {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: '',
        postCode: 0,
        submition: 'پست'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [orderSearch, setOrderSearch] = useState('');
    const [userFound, setUserFound] = useState(false);

    // Fetch products for search
    const variables = {
        page: 1,
        limit: 10,
        search: search
    };

    const { data: productsData, error: productsError } = useSWR(
        search ? [GET_PRODUCTS, variables] : null,
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000
        }
    );

    // Fetch free orders
    const orderVariables = {
        page: currentPage,
        limit: 10,
        search: orderSearch
    };

    const { data: ordersData, error: ordersError, mutate: mutateOrders } = useSWR(
        [GET_FREE_ORDERS, orderVariables],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000
        }
    );

    useEffect(() => {
        if (productsData) {
            setProducts(productsData.products?.products || []);
        }
    }, [productsData]);

    // Fetch user info when phone number changes
    const { data: userData } = useSWR(
        customerInfo.phone && customerInfo.phone.length >= 10 ? [GET_USER_BY_PHONE, { phone: customerInfo.phone }] : null,
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000
        }
    );

    // Update customer info when user data is found
    useEffect(() => {
        if (userData?.userByPhone && customerInfo.phone.length == 11) {
            const user = userData.userByPhone;
            setCustomerInfo(prev => ({
                ...prev,
                name: user.name || prev.name,
                address: user.address || prev.address,
                postCode: user.postCode ? user.postCode : prev.postCode
            }));
            setUserFound(true);
        } else {
            setUserFound(false);
        }
    }, [userData, customerInfo.phone]);

    const handleProductSelect = (product: Product) => {
        const existingProduct = selectedProducts.find(p => p.productId._id === product._id);

        if (existingProduct) {
            // Update count if product already exists
            setSelectedProducts(prev =>
                prev.map(p =>
                    p.productId._id === product._id
                        ? { ...p, count: p.count + 1 }
                        : p
                )
            );
        } else {
            // Add new product
            const currentPrice = product.price[product.price.length - 1]?.price || 0;
            const currentDiscount = product.discount[product.discount.length - 1]?.discount || 0;

            setSelectedProducts(prev => [...prev, {
                productId: product,
                price: currentPrice,
                discount: currentDiscount,
                count: 1
            }]);
        }

        setIsOpen(false);
        setSearch('');
    };

    const removeProduct = (productId: string) => {
        setSelectedProducts(prev => prev.filter(p => p.productId._id !== productId));
    };

    const updateProductCount = (productId: string, count: number) => {
        if (count <= 0) {
            removeProduct(productId);
            return;
        }

        setSelectedProducts(prev =>
            prev.map(p =>
                p.productId._id === productId
                    ? { ...p, count }
                    : p
            )
        );
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, item) => {
            const itemPrice = item.price * (1 - item.discount / 100);
            return total + (itemPrice * item.count);
        }, 0);
    };

    const handleCreateOrder = async () => {
        if (!customerInfo.name || !customerInfo.phone || selectedProducts.length === 0) {
            alert('لطفاً اطلاعات مشتری و محصولات را تکمیل کنید');
            return;
        }

        try {
            const input = {
                products: selectedProducts.map(item => ({
                    productId: item.productId._id,
                    price: item.price,
                    discount: item.discount,
                    count: item.count
                })),
                submition: customerInfo.submition,
                totalPrice: calculateTotal(),
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                customerAddress: customerInfo.address,
                customerPostCode: customerInfo.postCode ? customerInfo.postCode : 0,
                status: 'در انتظار تایید'
            };

            await fetcher(CREATE_FREE_ORDER, { input });

            // Reset form
            setSelectedProducts([]);
            setCustomerInfo({
                name: '',
                phone: '',
                address: '',
                postCode: 0,
                submition: 'پست'
            });

            // Refresh orders list
            mutateOrders();

            alert('سفارش آزاد با موفقیت ایجاد شد');
        } catch (error) {
            console.error('Error creating free order:', error);
            alert('خطا در ایجاد سفارش آزاد');
        }
    };

    const formatPrice = (price: number, discount?: number) => {
        if (discount && discount > 0) {
            const discountedPrice = price * (1 - discount / 100);
            return (
                <div className="flex flex-col text-xs">
                    <span className="line-through text-gray-500">{price.toLocaleString('fa-IR')} تومان</span>
                    <span className="text-green-600 font-bold">{discountedPrice.toLocaleString('fa-IR')} تومان</span>
                </div>
            );
        }
        return <span className="text-xs">{price?.toLocaleString('fa-IR')} تومان</span>;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold mb-4">سفارشات آزاد</h2>

            {/* Create New Free Order */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-md font-semibold mb-4">ایجاد سفارش آزاد جدید</h3>

                {/* User Found Notification */}
                {userFound && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">کاربر قبلاً در سیستم وجود دارد. اطلاعات قبلی بارگذاری شد.</span>
                        </div>
                    </div>
                )}

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">نام مشتری *</label>
                        <input
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            placeholder="نام مشتری"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">شماره تلفن *</label>
                        <input
                            type="text"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            placeholder="شماره تلفن"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">آدرس</label>
                        <input
                            type="text"
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            placeholder="آدرس"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">کد پستی</label>
                        <input
                            type="text"
                            value={customerInfo.postCode}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, postCode: +e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                            placeholder="کد پستی"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">نحوه ارسال</label>
                        <select
                            value={customerInfo.submition}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, submition: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="پست">پست</option>
                            <option value="پیک">پیک</option>
                        </select>
                    </div>
                </div>

                {/* Product Search */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">جستجوی محصول</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="جستجو در محصولات..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />

                        {isOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
                                {productsError && (
                                    <div className="p-2 text-center text-red-500">خطا در دریافت اطلاعات</div>
                                )}

                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <button
                                            key={product._id}
                                            onClick={() => handleProductSelect(product)}
                                            className="w-full p-3 text-right hover:bg-gray-100 border-b border-gray-200 last:border-b-0 text-sm flex items-center gap-3 transition-colors duration-200"
                                        >
                                            <div className="shrink-0">
                                                <Image
                                                    src={`https://api.neynegar1.ir/uploads/${product.cover}`}
                                                    alt={product.title}
                                                    width={50}
                                                    height={50}
                                                    className="rounded-lg object-cover w-12 h-12"
                                                />
                                            </div>

                                            <div className="flex-1 text-right">
                                                <div className="font-medium text-gray-900 line-clamp-2">
                                                    {product.title}
                                                </div>

                                                <div className="text-xs text-gray-600 mt-1">
                                                    {formatPrice(product.price[product.price.length - 1]?.price || 0, product.discount[product.discount.length - 1]?.discount)}
                                                </div>

                                                <div className="text-xs text-gray-500 mt-1">
                                                    موجودی: {product.showCount}
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))
                                ) : search && !productsError ? (
                                    <div className="p-2 text-center text-gray-500">محصولی یافت نشد</div>
                                ) : null}
                            </div>
                        )}

                        {/* Click outside to close */}
                        {isOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsOpen(false)}
                            />
                        )}
                    </div>
                </div>

                {/* Selected Products */}
                {selectedProducts.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">محصولات انتخاب شده:</h4>
                        <div className="space-y-2">
                            {selectedProducts.map((item) => (
                                <div key={item.productId._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={`https://api.neynegar1.ir/uploads/${item.productId.cover}`}
                                            alt={item.productId.title}
                                            width={40}
                                            height={40}
                                            className="rounded object-cover w-10 h-10"
                                        />
                                        <div>
                                            <div className="text-sm font-medium">{item.productId.title}</div>
                                            <div className="text-xs text-gray-600">
                                                {formatPrice(item.price, item.discount)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateProductCount(item.productId._id, item.count - 1)}
                                            className="w-6 h-6 bg-red-500 text-white rounded text-xs"
                                        >
                                            -
                                        </button>
                                        <span className="text-sm font-medium w-8 text-center">{item.count}</span>
                                        <button
                                            onClick={() => updateProductCount(item.productId._id, item.count + 1)}
                                            className="w-6 h-6 bg-green-500 text-white rounded text-xs"
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => removeProduct(item.productId._id)}
                                            className="w-6 h-6 bg-red-600 text-white rounded text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-right">
                            <div className="text-lg font-bold">
                                مجموع: {calculateTotal().toLocaleString('fa-IR')} تومان
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleCreateOrder}
                    disabled={selectedProducts.length === 0 || !customerInfo.name || !customerInfo.phone}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    ایجاد سفارش آزاد
                </button>
            </div>

            {/* Free Orders List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-semibold">لیست سفارشات آزاد</h3>
                    <input
                        type="text"
                        placeholder="جستجو در سفارشات..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm w-64"
                    />
                </div>

                {ordersError && (
                    <div className="text-center text-red-500 py-4">خطا در دریافت سفارشات</div>
                )}

                {ordersData?.freeOrders?.orders?.length > 0 ? (
                    <div className="space-y-4">
                        {ordersData.freeOrders.orders.map((order: FreeOrder) => (
                            <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-medium">مشتری: {order.userId.name}</div>
                                        <div className="text-sm text-gray-600">تلفن: {order.userId.phone}</div>
                                        <div className="text-sm text-gray-600">
                                            {`تاریخ: ${new Intl.DateTimeFormat('fa-IR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }).format(new Date(Number(order.createdAt)))}`}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-lg">{order.totalPrice.toLocaleString('fa-IR')} تومان</div>
                                        <div className="text-sm text-gray-600">وضعیت: {order.status}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium">محصولات:</div>
                                    {order.products.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-gray-50 p-2 rounded text-sm">
                                            <Image
                                                src={`https://api.neynegar1.ir/uploads/${item.productId.cover}`}
                                                alt={item.productId.title}
                                                width={30}
                                                height={30}
                                                className="rounded object-cover w-8 h-8"
                                            />
                                            <div className="flex-1">
                                                <div>{item.productId.title}</div>
                                                <div className="text-xs text-gray-600">
                                                    تعداد: {item.count} | قیمت: {item.price.toLocaleString('fa-IR')} ریال
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">هیچ سفارش آزادی یافت نشد</div>
                )}
            </div>
        </div>
    );
}

export default CMSFreeOrders;