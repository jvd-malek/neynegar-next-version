"use client"

// next and react
import { useState, useCallback, useEffect } from 'react';
import { redirect } from 'next/navigation';

// utils
import { notify } from '@/public/utils/notify';
import { deleteCookie, setCookie } from 'cookies-next';
import { mutate } from 'swr';

// components and types
import { Input, handleFormValidator } from '@/public/components/login/Input';
import { formType } from '@/public/types/input';
import { userType } from '@/public/types/user';
import { fetcher, revalidateOneHour } from '@/public/utils/fetcher';

type postCost = {
    cost: number
    costPerKg: number
    type: string
}

type LoginFormProps = {
    account?: boolean
    user: userType
    provinces: { province: string, cities: string[] }[]
    shippingCost?: number
    totalWeight?: number
    postCost?: postCost[]
}

const LoginForm = ({ account = false, user, provinces = [], shippingCost = 0, postCost, totalWeight = 0 }: LoginFormProps) => {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [states, setStates] = useState<{ value: string, label: string }[]>([{ value: "", label: "--استان را انتخاب کنید--" }]);
    const [cities, setCities] = useState<{ value: string, label: string }[]>([{ value: "", label: "--استان را انتخاب کنید--" }]);
    const Address = user.address ? user.address.split("%%") : []
    const post = postCost?.filter(p => p.type == "پست")[0]

    const validatePhone = (phone: string) => {
        return /^(\+98|0098|98|0)?9\d{9}$/.test(phone);
    };

    // حالت‌های فرم
    const [formData, setFormData] = useState<formType[]>([
        {
            name: "name",
            type: "text",
            value: user.name ? user.name : "",
            validateRule: null,
            error: false,
            errorMessage: "نام و نام خانوادگی الزامی است"
        },
        {
            name: "phone",
            type: "number",
            value: user.phone ? String(user.phone) : "",
            validateRule: validatePhone,
            error: false,
            errorMessage: "شماره همراه معتبر نیست"
        },
        {
            name: "postCode",
            type: "number",
            value: user.postCode ? String(user.postCode) : "",
            validateRule: null,
            error: false,
            errorMessage: "کد‌پستی الزامی است"
        },
        {
            name: "state",
            type: "text",
            value: Address.length > 0 ? Address[0] : '',
            validateRule: null,
            error: false,
            errorMessage: "استان الزامی است"
        },
        {
            name: "city",
            type: "text",
            value: Address.length > 1 ? Address[1] : '',
            validateRule: null,
            error: false,
            errorMessage: "شهر الزامی است"
        },
        {
            name: "address",
            type: "text",
            value: Address.length > 2 ? Address[2] : '',
            validateRule: null,
            error: false,
            errorMessage: "آدرس الزامی است"
        },
        {
            name: "shipment",
            type: "radio",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: "انتخاب روش ارسال الزامی است"
        }
    ]);


    useEffect(() => {
        if (provinces.length > 0) {
            const validprovincesFormat = [{ value: "", label: "--انتخاب کنید--" }]
            validprovincesFormat.push(...provinces.map(p => ({ value: p.province, label: p.province })))
            setStates(validprovincesFormat)
        }
    }, [provinces])

    useEffect(() => {
        if (formData[3].value) {
            const province = provinces.filter(p => p.province == formData[3].value)
            const validCitiesFormat = [{ value: "", label: "--انتخاب کنید--" }]
            validCitiesFormat.push(...province[0].cities.map(c => ({ value: c, label: c })))
            setCities(validCitiesFormat)
        }
    }, [formData[3]])

    const handleSubmit = useCallback(async () => {
        if (!handleFormValidator(formData)) return;
        if (!account && `${formData[6].value}`.length == 0) {
            notify("لطفا روش ارسال را انتخاب نمایید.", 'error');
            return
        }

        setIsSubmitting(true);
        try {
            await updateInfoUser({
                name: `${formData[0].value}`.trim(),
                postCode: +formData[2].value,
                address: `${formData[3].value}%%${formData[4].value}%%${`${formData[5].value}`.trim()}`
            });

            notify("اطلاعات شما با موفقیت ذخیره شد.", 'success');
        } catch (error) {
            console.log(error);
            notify("عدم برقراری ارتباط با سرور", 'error');
        } finally {
            setIsSubmitting(false);
            if (!account && `${formData[6].value}`.length > 0) {

                let form = {
                    name: formData[0].value,
                    phone: formData[1].value,
                    postCode: formData[2].value,
                    state: formData[3].value,
                    city: formData[4].value,
                    address: formData[5].value,
                    shipment: formData[6].value,
                }

                setCookie("basketForm", form)
                redirect("/basket?activeLink=shipment")
            }
        }
    }, [formData]);

    const logoutHandler = async () => {
        await deleteCookie("jwt")
        notify("خروج از حساب با موفقیت انجام شد.", 'success');
        await mutate(["userByToken"])
        redirect("/")
    }

    const updateInfoUser = async (body: object) => {
        try {
            if (user?._id) {
                const mutation = `
                        mutation UpdateUser($id: ID!, $input: UserInput!) {
                            updateUser(id: $id, input: $input) {
                                _id
                                name
                                phone
                                address
                                postCode
                                status
                            }
                        }
                    `;

                const variables = {
                    id: user._id,
                    input: { ...body, status: user.status, phone: user.phone }
                };

                const res = await fetcher(mutation, variables);
                if (!res || !res.updateUser) {
                    throw new Error("خطا در ثبت اطلاعات");
                }

            }
        } catch (error) {
            notify("خطا در ثبت اطلاعات: " + (error instanceof Error ? error.message : 'خطای ناشناخته'), 'error');
            throw error;
        }
    }

    const a = 155000
    return (
        <div className="bg-white p-4 mt-6 rounded-lg">

            <form
                className="grid md:grid-cols-2 grid-cols-1  gap-4 justify-between"
                dir="rtl"
                itemScope
                itemType="https://schema.org/LoginAction"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >

                <div className="col-start-1 col-end-2 row-start-1">
                    <h2 className="font-bold text-lg">
                        اطلاعات گیرنده:
                    </h2>

                    <div className="flex flex-col gap-2 mt-4 w-full transition-all rounded-xl  pt-6 pb-6 h-full">
                        <div className="bg-black p-2 rounded-lg">
                            <Input
                                id={formData[0].name}
                                label="نام و نام‌خانوادگی"
                                form={formData[0]}
                                setForm={setFormData}
                                placeholder='مثال: جواد ملکی'
                                disabled={isSubmitting}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="bg-black p-2 rounded-lg">
                            <Input
                                id={formData[1].name}
                                label="شماره همراه (امکان تغییر شماره وجود ندارد)"
                                form={formData[1]}
                                setForm={setFormData}
                                placeholder='مثال: 09121234567'
                                disabled={true}
                            />
                        </div>
                        <div className="bg-black p-2 rounded-lg">
                            <Input
                                id={formData[2].name}
                                label="کد پستی"
                                form={formData[2]}
                                setForm={setFormData}
                                placeholder='مثال: 1647949663'
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-start-2 md:col-end-3 col-start-1 col-end-2 md:row-start-1 row-start-2">
                    <h2 className="font-bold text-lg">
                        آدرس گیرنده:
                    </h2>

                    <div className="flex flex-col gap-2 mt-4 w-full transition-all rounded-xl pt-6 pb-6 h-full">
                        <div className="bg-black p-2 rounded-lg">
                            <Input
                                id={formData[3].name}
                                label="استان"
                                form={formData[3]}
                                setForm={setFormData}
                                disabled={isSubmitting}
                                required
                                type='select'
                                options={states}
                            />
                        </div>
                        <div className="bg-black p-2 rounded-lg">
                            <Input
                                id={formData[4].name}
                                label="شهر"
                                form={formData[4]}
                                setForm={setFormData}
                                disabled={isSubmitting}
                                required
                                type='select'
                                options={cities}
                            />
                        </div>
                        <div className="bg-black p-2 rounded-lg">
                            <Input
                                id={formData[5].name}
                                label="آدرس"
                                form={formData[5]}
                                setForm={setFormData}
                                placeholder='مثال: نارمک، کوچه ...'
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>
                </div>

                {!account &&
                    <>
                        <div className="col-start-1 col-end-2 md:row-start-2 row-start-3">
                            <h2 className="font-bold text-lg">
                                روش ارسال:
                            </h2>

                            <div className="flex justify-between items-center gap-4 bg-mist-200 p-1 rounded mb-2 mt-6">
                                <div className="bg-black p-2 rounded w-30">
                                    <Input
                                        id='post'
                                        type='radio'
                                        label="ارسال با پست"
                                        form={formData[6]}
                                        setForm={setFormData}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <p className="text-xs font-semibold bg-black text-white p-2.5 rounded w-36 text-center">
                                    {shippingCost.toLocaleString('fa-IR')}
                                    <span className='pr-1'>تومان</span>
                                </p>
                            </div>

                            <div className="flex justify-between items-center gap-4 bg-mist-200 p-1 rounded">
                                <div className="bg-black p-2 rounded w-30">
                                    <Input
                                        id='bike'
                                        type='radio'
                                        label="ارسال با پیک"
                                        form={formData[6]}
                                        setForm={setFormData}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <p className="text-xs bg-black text-white p-2.5 rounded w-36 text-center">فقط برای ساکنین تهران</p>
                            </div>

                        </div>

                        <div className="md:col-start-2 md:col-end-3 col-start-1 col-end-2 md:row-start-2 row-start-4 mt-6 md:mt-0">
                            <h2 className="font-bold text-lg">
                                جزئیات هزینه پست:
                            </h2>

                            <table className="w-fit bg-white border border-gray-200 rounded-lg mt-6">
                                <thead className="bg-gray-50 font-bold text-sm">
                                    <tr>
                                        <td className="px-3 py-1.5 text-right">هزینه پایه</td>
                                        <td className="px-3 py-1.5 text-right">هزینه به ازای هر کیلو</td>
                                        <td className="px-3 py-1.5 text-right">وزن سفارش</td>
                                        <td className="px-3 py-1.5 text-right">هزینه نهایی</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-3 py-1.5">
                                            {post?.cost.toLocaleString('fa-IR')}
                                            <span className="text-xs font-medium text-mist-500"> تومان</span>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            {post?.costPerKg.toLocaleString('fa-IR')}
                                            <span className="text-xs font-medium text-mist-500"> تومان</span>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            {totalWeight?.toLocaleString('fa-IR')}
                                            <span className="text-xs font-medium text-mist-500"> گرم</span>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            {shippingCost.toLocaleString('fa-IR')}
                                            <span className="text-xs font-medium text-mist-500"> تومان</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                }

                {account &&
                    <button
                        aria-label="خروج از حساب کاربری"
                        disabled={isSubmitting}
                        className="md:col-start-2 md:col-end-3 col-start-1 col-end-2 md:row-start-2 row-start-3 cursor-pointer px-4 py-4 w-full transition-all active:border-white bg-red-600 border-red-800 hover:bg-red-700 rounded-lg text-white border-b-4 border-solid active:translate-y-1"
                        onClick={logoutHandler}
                    >
                        خروج از حساب
                    </button>
                }

                <button
                    type='submit'
                    disabled={isSubmitting}
                    aria-label="ارسال فرم اطلاعات کاربر"
                    className={`${account ? "row-start-4 md:row-start-2" : "md:row-start-3 row-start-5 mt-6"} font-bold cursor-pointer col-start-1 col-end-2  px-4 py-4 w-full transition-all bg-black hover:bg-slate-900 rounded-lg text-white border-b-4 border-slate-700 active:border-white active:translate-y-1 disabled:opacity-70`}
                >
                    ثبت اطلاعات
                </button>

            </form>
        </div>
    );
}

export default LoginForm;