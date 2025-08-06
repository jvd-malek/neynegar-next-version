'use client';

import PaginationBox from '@/lib/Components/Pagination/PaginationBox'
import SearchBox from './SearchBox';
import ProductInput from './ProductInput';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { userType } from '@/lib/Types/user';
import { Modal } from '@mui/material';
import { fetcher } from '@/lib/fetcher';

interface CMSUserBoxProps {
    type: string;
    page: {
        page: number;
        count: number;
        search: string;
    };
}

// GraphQL Queries and Mutations
const GET_USERS = `
    query GetUsers($page: Int!, $limit: Int!, $search: String) {
        users(page: $page, limit: $limit, search: $search) {
            users {
                _id
                status
                name
                phone
                address
                postCode
                totalBuy
                bascket {
                    productId {
                        cover
                        _id
                        title
                        showCount
                    }
                    count
                }
                favorite {
                    productId {
                        cover
                        _id
                        title
                    }
                }
                discount {
                    code
                    date
                    discount
                }
            }
            totalPages
            currentPage
            total
        }
    }
`;

const UPDATE_USER = `
    mutation UpdateUser($id: ID!, $input: UserInput!) {
        updateUser(id: $id, input: $input) {
            _id
            status
            name
            phone
            address
            postCode
            totalBuy
        }
    }
`;

const ADD_TO_BASKET = `
    mutation AddToBasket($productId: ID!, $count: Int!) {
        addToBasket(productId: $productId, count: $count) {
            _id
            bascket {
                productId {
                    _id
                }
                count
            }
        }
    }
`;

const REMOVE_FROM_BASKET = `
    mutation RemoveFromBasket($productId: ID!) {
        removeFromBasket(productId: $productId) {
            _id
            bascket {
                productId {
                    _id
                }
                count
            }
        }
    }
`;

const UPDATE_BASKET_COUNT = `
    mutation UpdateBasketCount($userId: ID!, $productId: ID!, $count: Int!) {
        updateBasketCount(userId: $userId, productId: $productId, count: $count) {
            _id
            bascket {
                productId {
                    _id
                }
                count
            }
        }
    }
`;

const ADD_TO_FAVORITE = `
    mutation AddToFavorite($productId: ID!) {
        addToFavorite(productId: $productId) {
            _id
            favorite {
                productId {
                    _id
                }
            }
        }
    }
`;

const REMOVE_FROM_FAVORITE = `
    mutation RemoveFromFavorite($productId: ID!) {
        removeFromFavorite(productId: $productId) {
            _id
            favorite {
                productId {
                    _id
                }
            }
        }
    }
`;

const ADD_DISCOUNT = `
    mutation AddDiscount($userId: ID!, $code: String!, $discount: Int!, $date: Float!) {
        addDiscount(userId: $userId, code: $code, discount: $discount, date: $date) {
            _id
            discount {
                code
                discount
                date
            }
        }
    }
`;

const REMOVE_DISCOUNT = `
    mutation RemoveDiscount($userId: ID!, $code: String!) {
        removeDiscount(userId: $userId, code: $code) {
            _id
            discount {
                code
                discount
                date
            }
        }
    }
`;

const DELETE_USER = `
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id)
    }
`;

function CMSUserBox({ type, page }: CMSUserBoxProps) {
    const [editingUsers, setEditingUsers] = useState<Record<string, any>>({});
    const [initialValues, setInitialValues] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<userType | null>(null);
    const [userVisibility, setUserVisibility] = useState<Record<string, { basket: boolean; favorites: boolean; discounts: boolean }>>({});
    const [newProductId, setNewProductId] = useState('');
    const [newDiscount, setNewDiscount] = useState({ code: '', discount: '', date: '' });

    const toggleUserSection = (userId: string, section: 'basket' | 'favorites' | 'discounts') => {
        setUserVisibility(prev => ({
            ...prev,
            [userId]: {
                basket: section === 'basket' ? !prev[userId]?.basket : false,
                favorites: section === 'favorites' ? !prev[userId]?.favorites : false,
                discounts: section === 'discounts' ? !prev[userId]?.discounts : false
            }
        }));
    };

    const variables = {
        page: page.page,
        limit: page.count,
        search: page.search,
    };

    const { data, error, isLoading, mutate } = useSWR(
        [GET_USERS, variables],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000,
            keepPreviousData: true
        }
    );

    useEffect(() => {
        if (data?.users?.users) {
            const newInitialValues: Record<string, any> = {};
            data.users.users.forEach((user: userType) => {
                newInitialValues[user._id] = {
                    status: user.status,
                    name: user.name,
                    phone: user.phone,
                    address: user.address || '',
                    postCode: user.postCode || "",
                };
            });
            setInitialValues(newInitialValues);
        }
    }, [data]);

    const handleFieldChange = (userId: string, field: string, value: any) => {
        setErrors(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: ''
            }
        }));

        setEditingUsers(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    const validateUser = (userId: string): boolean => {
        const user = editingUsers[userId];
        if (!user) return false;

        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!user.name?.trim()) {
            newErrors.name = 'نام کاربر الزامی است';
            isValid = false;
        }

        setErrors(prev => ({
            ...prev,
            [userId]: newErrors
        }));

        return isValid;
    };

    const handleSaveChanges = async (userId: string) => {
        try {
            if (!validateUser(userId)) {
                const userErrors = errors[userId];
                if (userErrors) {
                    const errorMessages = Object.entries(userErrors)
                        .filter(([_, message]) => message)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join('\n');

                    alert('لطفاً خطاهای زیر را برطرف کنید:\n' + errorMessages);
                }
                return;
            }

            setIsSaving(true);
            const currentUser = data?.users?.users?.find((u: userType) => u._id === userId);
            const editedUser = editingUsers[userId];

            if (!currentUser || !editedUser) {
                console.log('User not found');
                return;
            }

            const input = {
                status: editedUser.status ?? currentUser.status,
                name: editedUser.name ?? currentUser.name,
                phone: currentUser.phone,
                address: editedUser.address ?? currentUser.address,
                postCode: editedUser.postCode ?? currentUser.postCode,
            };

            const response = await fetcher(UPDATE_USER, {
                id: userId,
                input
            });

            if (response.errors) {
                console.error('Server error:', response.errors);
                throw new Error(response.errors[0].message);
            }

            setEditingUsers(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });

            setErrors(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });

            await mutate();

            console.log('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('خطا در ذخیره اطلاعات: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            setIsSaving(true);
            await fetcher(DELETE_USER, { id: userId });
            await mutate();
            setDeleteModalOpen(false);
            console.log('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('خطا در حذف کاربر: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddToBasket = async (userId: string) => {
        try {
            if (!newProductId) {
                alert('لطفا آیدی محصول را وارد کنید');
                return;
            }
            await fetcher(ADD_TO_BASKET, {
                productId: newProductId,
                count: 1
            });
            setNewProductId('');
            await mutate();
        } catch (error) {
            console.error('Error adding to basket:', error);
            alert('خطا در اضافه کردن به سبد خرید');
        }
    };

    const handleUpdateBasketCount = async (userId: string, productId: string, count: number, showCount: number) => {
        try {
            if (count < 1) {
                alert('تعداد محصول نمی‌تواند کمتر از 1 باشد');
                console.log('تعداد محصول نمی‌تواند کمتر از 1 باشد');
                return;
            }
            if (count > showCount) {
                alert(`تعداد محصول نمی‌تواند بیشتر از ${showCount} باشد`);
                console.log(`تعداد محصول نمی‌تواند بیشتر از ${showCount} باشد`);
                return;
            }

            await fetcher(UPDATE_BASKET_COUNT, {
                userId,
                productId,
                count
            });
            await mutate();
        } catch (error) {
            console.error('Error updating basket count:', error);
            alert('خطا در بروزرسانی تعداد');
        }
    };

    const handleRemoveFromBasket = async (userId: string, productId: string) => {
        try {
            await fetcher(REMOVE_FROM_BASKET, {
                productId
            });
            await mutate();
        } catch (error) {
            console.error('Error removing from basket:', error);
            alert('خطا در حذف از سبد خرید');
        }
    };

    const handleAddToFavorite = async (userId: string) => {
        try {
            if (!newProductId) {
                alert('لطفا آیدی محصول را وارد کنید');
                return;
            }
            await fetcher(ADD_TO_FAVORITE, {
                productId: newProductId
            });
            setNewProductId('');
            await mutate();
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('خطا در اضافه کردن به علاقه‌مندی‌ها');
        }
    };

    const handleRemoveFromFavorite = async (userId: string, productId: string) => {
        try {
            await fetcher(REMOVE_FROM_FAVORITE, {
                productId
            });
            await mutate();
        } catch (error) {
            console.error('Error removing from favorites:', error);
            alert('خطا در حذف از علاقه‌مندی‌ها');
        }
    };

    const handleAddDiscount = async (userId: string) => {
        try {
            if (!newDiscount.code || !newDiscount.discount || !newDiscount.date) {
                alert('لطفا تمام فیلدهای تخفیف را پر کنید');
                return;
            }

            const daysInMilliseconds = parseInt(newDiscount.date) * 24 * 60 * 60 * 1000;
            const expiryDate = Date.now() + daysInMilliseconds;

            await fetcher(ADD_DISCOUNT, {
                userId,
                code: newDiscount.code,
                discount: parseInt(newDiscount.discount),
                date: expiryDate
            });

            setNewDiscount({ code: '', discount: '', date: '' });
            await mutate();
        } catch (error) {
            console.error('Error adding discount:', error);
            alert('خطا در اضافه کردن تخفیف');
        }
    };

    const handleRemoveDiscount = async (userId: string, code: string) => {
        try {
            await fetcher(REMOVE_DISCOUNT, {
                userId,
                code
            });
            await mutate();
        } catch (error) {
            console.error('Error removing discount:', error);
            alert('خطا در حذف تخفیف');
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

    const users = data?.users;

    return (
        <>
            <div className={`bg-slate-200 relative rounded-xl p-4 lg:col-start-2 col-end-5 col-start-1 lg:row-start-1 row-start-2 pt-20 text-xs sm:text-sm`}>
                <h3 className="absolute top-4 -right-6 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    {type}
                </h3>

                <div className="flex justify-center absolute top-4 left-3 items-center gap-2 pl-2 text-white bg-black w-40 rounded-lg shadow-md overflow-hidden">
                    <SearchBox search={page.search} />
                </div>

                {(users && users.users.length > 0) ? users.users.map((user: userType) => {
                    const isEditing = !!editingUsers[user._id];
                    const userErrors = errors[user._id] || {};
                    const hasErrors = Object.values(userErrors).some(error => error);
                    const initialUserValues = initialValues[user._id];

                    return (
                        <div className="mt-5 bg-white shadow-cs py-2 px-4 rounded-xl flex flex-col gap-3" key={user._id}>
                            <div className="flex justify-between items-center gap-2">
                                <h2 className="md:text-lg text-shadow">{user.name}</h2>
                            </div>
                            <div className="overflow-x-auto scrollable-section relative">
                                <div className="flex gap-4 pb-4 w-max">
                                    <ProductInput
                                        label="نام"
                                        value={editingUsers[user._id]?.name ?? initialUserValues?.name}
                                        onChange={(value) => handleFieldChange(user._id, 'name', value)}
                                        onFocus={() => { }}
                                        error={userErrors.name}
                                    />

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="text-xs sm:text-sm text-gray-700 text-shadow">شماره تلفن</label>
                                        <div className="rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 border-gray-300">
                                            {initialUserValues?.phone}
                                        </div>
                                    </div>

                                    <ProductInput
                                        label="آدرس"
                                        value={editingUsers[user._id]?.address ?? initialUserValues?.address}
                                        onChange={(value) => handleFieldChange(user._id, 'address', value)}
                                        onFocus={() => { }}
                                    />

                                    <ProductInput
                                        label="کد پستی"
                                        type="number"
                                        value={editingUsers[user._id]?.postCode ?? initialUserValues?.postCode}
                                        onChange={(value) => handleFieldChange(user._id, 'postCode', value)}
                                        onFocus={() => { }}
                                    />

                                    <ProductInput
                                        label="وضعیت"
                                        type="select"
                                        value={editingUsers[user._id]?.status ?? initialUserValues?.status}
                                        onChange={(value) => handleFieldChange(user._id, 'status', value)}
                                        onFocus={() => { }}
                                        options={[
                                            { value: 'user', label: 'user' },
                                            { value: 'banUser', label: 'banUser' },
                                            { value: 'notifUser', label: 'notifUser' },
                                            { value: 'admin', label: 'admin' },
                                            { value: 'owner', label: 'owner' }
                                        ]}
                                    />

                                    <div className="flex flex-col gap-1 w-20 sm:w-46">
                                        <label className="text-xs sm:text-sm text-gray-700 text-shadow">مجموع خرید</label>
                                        <div className="rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 border-gray-300">
                                            {user.totalBuy?.toLocaleString()} تومان
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => toggleUserSection(user._id, 'basket')}
                                    className={`px-3 py-1.5 rounded text-white ${userVisibility[user._id]?.basket ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                                >
                                    {userVisibility[user._id]?.basket ? 'بستن سبد خرید' : 'نمایش سبد خرید'}
                                </button>
                                <button
                                    onClick={() => toggleUserSection(user._id, 'favorites')}
                                    className={`px-3 py-1.5 rounded text-white ${userVisibility[user._id]?.favorites ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                                >
                                    {userVisibility[user._id]?.favorites ? 'بستن علاقه‌مندی‌ها' : 'نمایش علاقه‌مندی‌ها'}
                                </button>
                                <button
                                    onClick={() => toggleUserSection(user._id, 'discounts')}
                                    className={`px-3 py-1.5 rounded text-white ${userVisibility[user._id]?.discounts ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
                                >
                                    {userVisibility[user._id]?.discounts ? 'بستن تخفیف‌ها' : 'نمایش تخفیف‌ها'}
                                </button>
                            </div>

                            {/* Basket Items Section */}
                            {userVisibility[user._id]?.basket && (
                                <div className="mt-4 text-xs md:text-sm">
                                    <h3 className="text-lg font-semibold mb-2">سبد خرید</h3>
                                    <div className="mb-4 flex gap-2">
                                        <input
                                            type="text"
                                            value={newProductId}
                                            onChange={(e) => setNewProductId(e.target.value)}
                                            placeholder="آیدی محصول"
                                            className="px-3 py-1.5 border rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleAddToBasket(user._id)}
                                            className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            اضافه به سبد خرید
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full bg-white border border-gray-400 rounded-2xl">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-1.5 text-right">تصویر</th>
                                                    <th className="px-3 py-1.5 text-right">نام محصول</th>
                                                    <th className="px-3 py-1.5 text-right">تعداد</th>
                                                    <th className="px-3 py-1.5 text-right">عملیات</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {user.bascket?.map((item, index) => (
                                                    <tr key={index} className="border-t border-gray-400">
                                                        <td className="px-3 py-1.5">
                                                            <img
                                                                src={`https://api.neynegar1.ir/uploads/${item.productId.cover}`}
                                                                alt={item.productId.title}
                                                                className="w-16 h-16 object-cover rounded"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-1.5">{item.productId.title}</td>
                                                        <td className="pl-4 py-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateBasketCount(user._id, item.productId._id, item.count - 1, item.productId.showCount)}
                                                                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-slate-400"
                                                                    disabled={item.count <= 1}
                                                                >
                                                                    -
                                                                </button>
                                                                <span>{item.count}</span>
                                                                <button
                                                                    onClick={() => handleUpdateBasketCount(user._id, item.productId._id, item.count + 1, item.productId.showCount)}
                                                                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-slate-400"
                                                                    disabled={item.count >= item.productId.showCount}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-1.5">
                                                            <button
                                                                onClick={() => handleRemoveFromBasket(user._id, item.productId._id)}
                                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                            >
                                                                حذف
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!user.bascket || user.bascket.length < 1) && (
                                                    <tr>
                                                        <td colSpan={4} className="px-3 py-1.5 text-center text-gray-500">
                                                            سبد خرید خالی است
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Favorite Items Section */}
                            {userVisibility[user._id]?.favorites && (
                                <div className="mt-4 text-xs md:text-sm">
                                    <h3 className="text-lg font-semibold mb-2">محصولات مورد علاقه</h3>
                                    <div className="mb-4 flex gap-2">
                                        <input
                                            type="text"
                                            value={newProductId}
                                            onChange={(e) => setNewProductId(e.target.value)}
                                            placeholder="آیدی محصول"
                                            className="px-3 py-1.5 border rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleAddToFavorite(user._id)}
                                            className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                                        >
                                            اضافه به علاقه‌مندی‌ها
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {user.favorite?.map((item, index) => (
                                            <div key={index} className="border rounded-lg p-2 relative">
                                                <button
                                                    onClick={() => handleRemoveFromFavorite(user._id, item.productId._id)}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                                <img
                                                    src={`https://api.neynegar1.ir/uploads/${item.productId.cover}`}
                                                    alt={item.productId.title}
                                                    className="w-full h-32 object-cover rounded mb-2"
                                                />
                                                <p className="text-sm text-center">{item.productId.title}</p>
                                            </div>
                                        ))}
                                        {(!user.favorite || user.favorite.length < 1) && (
                                            <div className="col-span-full text-center text-gray-500 py-4">
                                                محصول مورد علاقه‌ای وجود ندارد
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Discounts Section */}
                            {userVisibility[user._id]?.discounts && (
                                <div className="mt-4 text-xs md:text-sm">
                                    <h3 className="text-lg font-semibold mb-2">تخفیف‌ها</h3>
                                    <div className="mb-4 flex flex-col md:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={newDiscount.code}
                                            onChange={(e) => setNewDiscount(prev => ({ ...prev, code: e.target.value }))}
                                            placeholder="کد تخفیف"
                                            className="px-3 py-1.5 border rounded-lg"
                                        />
                                        <input
                                            type="number"
                                            value={newDiscount.discount}
                                            onChange={(e) => setNewDiscount(prev => ({ ...prev, discount: e.target.value }))}
                                            placeholder="درصد تخفیف"
                                            className="px-3 py-1.5 border rounded-lg"
                                        />
                                        <input
                                            type="number"
                                            value={newDiscount.date}
                                            onChange={(e) => setNewDiscount(prev => ({ ...prev, date: e.target.value }))}
                                            placeholder="تعداد روز اعتبار"
                                            min="1"
                                            className="px-3 py-1.5 border rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleAddDiscount(user._id)}
                                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                        >
                                            اضافه کردن تخفیف
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border rounded-lg">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-1.5 text-right">کد تخفیف</th>
                                                    <th className="px-3 py-1.5 text-right">میزان تخفیف</th>
                                                    <th className="px-3 py-1.5 text-right">تاریخ</th>
                                                    <th className="px-3 py-1.5 text-right">عملیات</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {user.discount?.map((discount, index) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="px-3 py-1.5">{discount.code}</td>
                                                        <td className="px-3 py-1.5">{discount.discount}%</td>
                                                        <td className="px-3 py-1.5">{new Date(discount.date).toLocaleDateString('fa-IR')}</td>
                                                        <td className="px-3 py-1.5">
                                                            <button
                                                                onClick={() => handleRemoveDiscount(user._id, discount.code)}
                                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                            >
                                                                حذف
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!user.discount || user.discount.length < 1) && (
                                                    <tr>
                                                        <td colSpan={4} className="px-3 py-1.5 text-center text-gray-500">
                                                            تخفیفی وجود ندارد
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {hasErrors && (
                                <div className="mt-2 p-32 bg-red-50 border border-red-200 rounded-lg text-xs md:text-sm">
                                    <h4 className="text-red-600 font-medium mb-2">خطاهای موجود:</h4>
                                    <ul className="list-disc list-inside text-red-500 text-sm">
                                        {Object.entries(userErrors)
                                            .filter(([_, message]) => message)
                                            .map(([field, message]) => (
                                                <li key={field}>{message}</li>
                                            ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex md:justify-end justify-center gap-2 mt-4 text-xs md:text-sm">
                                {isEditing && (
                                    <button
                                        className={`px-3 py-1.5 rounded text-white ${hasErrors
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                        onClick={() => handleSaveChanges(user._id)}
                                        disabled={isSaving || hasErrors}
                                    >
                                        {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                                    </button>
                                )}
                                <button
                                    className="bg-red-500 cursor-pointer text-white px-3 py-1.5 rounded hover:bg-red-600"
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setDeleteModalOpen(true);
                                    }}
                                    disabled={isSaving}
                                >
                                    حذف کاربر
                                </button>
                            </div>
                        </div>
                    );
                }) :
                    <p className="mt-5 bg-white shadow-cs py-1.5 px-3 rounded-xl text-center text-xs md:text-sm">کاربری یافت نشد 😥</p>
                }

                {/* Pagination */}
                {users && users.totalPages > 1 && (
                    <div className="mt-4">
                        <PaginationBox
                            count={users.totalPages}
                            currentPage={users.currentPage}
                        />
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    open={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setSelectedUser(null);
                    }}
                >
                    <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border rounded-lg shadow-lg px-6 py-8 max-w-md mx-auto absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <h3 className="text-lg font-bold mb-4">حذف کاربر</h3>
                        <p className="mb-6">
                            آیا از حذف کاربر "{selectedUser?.name}" اطمینان دارید؟
                            این عملیات غیرقابل بازگشت است.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => handleDeleteUser(selectedUser?._id || '')}
                                disabled={isSaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                {isSaving ? 'در حال حذف...' : 'حذف'}
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setSelectedUser(null);
                                }}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                انصراف
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
}

export default CMSUserBox;