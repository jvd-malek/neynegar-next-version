"use client"
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { animateScroll } from "react-scroll";
import ProductInput from "@/lib/Components/CMS/ProductInput";
import { fetcher } from "@/lib/fetcher";
import { notify } from '@/lib/utils/notify';
import { mutate } from "swr";

type ErrorType = {
    type: string;
    state: boolean;
    message: string;
};

function TxtInputs({ data, account }: { data: any, account?: boolean }) {
    const jwt = getCookie('jwt');
    const router = useRouter()
    const [errors, setErrors] = useState<ErrorType[]>([
        { type: "phone", state: false, message: "شماره همراه معتبر نیست" },
        { type: "name", state: false, message: "نام و نام خانوادگی الزامی است" },
        { type: "postCode", state: false, message: "کد‌پستی الزامی است" },
        { type: "state", state: false, message: "استان الزامی است" },
        { type: "city", state: false, message: "شهر الزامی است" },
        { type: "address", state: false, message: "آدرس الزامی است" },
        { type: "shipment", state: false, message: "انتخاب روش ارسال الزامی است" },
    ]);

    // حالت‌های فرم
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        state: '',
        city: '',
        address: '',
        postCode: '',
        shipment: '',
    });
    
    const [provinces, setProvinces] = useState<{ province: string, cities: string[] }[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    // تغییر مقادیر فرم
    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        if (value == "") {
            setErrors(prev => prev.map(err =>
                err.type === field ? { ...err, state: true } : err
            ));
        }
        setErrors(prev => prev.map(err =>
            err.type === field ? { ...err, state: false } : err
        ));
        if (field === "state") {
            const selectedProvince = provinces.find(p => p.province === value);
            setCities(selectedProvince ? selectedProvince.cities : []);
            setFormData(prev => ({ ...prev, city: "" }));
        }
    };

    // اعتبارسنجی فرم
    const validateForm = useCallback(() => {
        let isValid = true;
        const newErrors = [...errors];

        // اعتبارسنجی شماره همراه
        if (!formData.phone) {
            const phoneError = newErrors.find(e => e.type === "phone");
            if (phoneError) phoneError.state = true;
            isValid = false;
        }

        // اعتبارسنجی نام (اگر نیاز باشد)
        if (!formData.name.trim()) {
            const nameError = newErrors.find(e => e.type === "name");
            if (nameError) nameError.state = true;
            isValid = false;
        }

        if (!formData.city.trim()) {
            const cityError = newErrors.find(e => e.type === "city");
            if (cityError) cityError.state = true;
            isValid = false;
        }

        if (!formData.state.trim()) {
            const stateError = newErrors.find(e => e.type === "state");
            if (stateError) stateError.state = true;
            isValid = false;
        }

        if (!formData.address.trim()) {
            const addressError = newErrors.find(e => e.type === "address");
            if (addressError) addressError.state = true;
            isValid = false;
        }
        
        if (!formData.postCode) {
            const postCodeError = newErrors.find(e => e.type === "postCode");
            if (postCodeError) postCodeError.state = true;
            isValid = false;
        }

        if (!formData.shipment.trim() && !account) {
            const shipmentError = newErrors.find(e => e.type === "shipment");
            if (shipmentError) shipmentError.state = true;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData, errors]);

    useEffect(() => {
        if (data.user) {
            let Address = data.user.address?.split("%%")

            setFormData({
                phone: String(data.user.phone) ?? "",
                name: data.user.name ?? "",
                state: data.user.address ? Address[0] : '',
                city: data.user.address ? Address[1] : '',
                address: data.user.address ? Address[2] : '',
                postCode: data.user.postCode ? String(data.user.postCode) : '',
                shipment: '',
            })
        }
    }, [])

    useEffect(() => {
        if (formData.name && formData.address && formData.city && formData.phone && formData.postCode && formData.state && formData.shipment) {
            setCookie("basketForm", formData)
            router.refresh()
        }
    }, [formData])

    useEffect(() => {
        fetcher(`
            query {
                provinces {
                    province
                    cities
                }
            }
        `)
            .then(data => setProvinces(data.provinces))
            .catch(err => console.error(err));
    }, []);

    const infoHandler = () => {
        const valid = validateForm();
        if (!valid) {
            errors.map(e => e.state && notify(e.message, 'error'));
        } else {
            updateInfoHandler();
            animateScroll.scrollTo(300, {
                duration: 300,
                smooth: 'easeInOutQuart'
            });
        }
    }

    const updateInfoHandler = async () => {
        if (jwt) {
            try {
                await updateInfoUser({ name: formData.name.trim(), postCode: +formData.postCode, address: `${formData.state}%%${formData.city}%%${formData.address.trim()}` });
                notify("اطلاعات شما با موفقیت ذخیره شد.", 'success');
                if (!account) router.push("?activeLink=shipment")
            } catch (error) {
                notify("عدم برقراری ارتباط با سرور", 'error');
            }
            if (data.basket) {
                setCookie("basketForm", formData)
            }
        } else {
            router.push("/login?bas=true")
        }
    }

    const updateInfoUser = async (body: object) => {
        try {

            if (jwt && data.user && data.user._id) {
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
                    id: data.user._id,
                    input: { ...body, status: data.user.status, phone: data.user.phone }
                };
                const res = await fetcher(mutation, variables);
                if (!res || !res.updateUser) {
                    throw new Error("خطا در ثبت اطلاعات");
                }
            }
            router.refresh();
        } catch (error) {
            notify("خطا در ثبت اطلاعات: " + (error instanceof Error ? error.message : 'خطای ناشناخته'), 'error');
            throw error;
        }
    }

    const logoutHandler = async () => {
        await deleteCookie("jwt")
        notify("خروج از حساب با موفقیت انجام شد.", 'success');
        await mutate(["userByToken"])
        router.push("/")
    }

    return (
        <form
            className="grid md:grid-cols-2 grid-cols-1 md:gap-16 gap-4 justify-between"
            onSubmit={(e) => {
                e.preventDefault();
                infoHandler()
            }}>

            <div className="col-start-1 col-end-2 row-start-1">
                <h2 className="text-slate-700 text-lg">
                    اطلاعات گیرنده:
                </h2>

                <div className="flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-2 mt-4 w-full transition-all rounded-xl  pt-6 pb-6 h-full">
                        <ProductInput
                            form
                            label="نام"
                            value={formData.name}
                            type="text"
                            onChange={value => handleChange('name', value as string)}
                            error={errors.find(e => e.type === "name")?.state ? errors.find(e => e.type === "name")?.message : undefined}
                        />
                        <ProductInput
                            form
                            label="شماره همراه"
                            value={formData.phone}
                            type="text"
                            onChange={value => handleChange('phone', value as string)}
                            error={errors.find(e => e.type === "phone")?.state ? errors.find(e => e.type === "phone")?.message : undefined}
                            disabled
                        />
                        <ProductInput
                            form
                            label="کد پستی"
                            value={formData.postCode}
                            type="number"
                            onChange={value => handleChange('postCode', value as string)}
                            error={errors.find(e => e.type === "postCode")?.state ? errors.find(e => e.type === "postCode")?.message : undefined}
                        />
                    </div>
                </div>
            </div>

            <div className="md:col-start-2 md:col-end-3 col-start-1 col-end-2 md:row-start-1 row-start-2">
                <h2 className="text-slate-700 text-lg">
                    آدرس گیرنده:
                </h2>

                <div className="flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-2 mt-4 w-full transition-all rounded-xl pt-6 pb-6 h-full">
                        <ProductInput
                            form
                            label="استان"
                            value={formData.state}
                            type="select"
                            options={provinces.map(p => ({ value: p.province, label: p.province }))}
                            onChange={value => handleChange('state', value as string)}
                            error={errors.find(e => e.type === "state")?.state ? errors.find(e => e.type === "state")?.message : undefined}
                        />
                        <ProductInput
                            form
                            label="شهر"
                            value={formData.city}
                            type="select"
                            options={cities.map(c => ({ value: c, label: c }))}
                            onChange={value => handleChange('city', value as string)}
                            error={errors.find(e => e.type === "city")?.state ? errors.find(e => e.type === "city")?.message : undefined}
                            disabled={!formData.state}
                        />
                        <ProductInput
                            form
                            label="آدرس"
                            value={formData.address}
                            type="text"
                            onChange={value => handleChange('address', value as string)}
                            error={errors.find(e => e.type === "address")?.state ? errors.find(e => e.type === "address")?.message : undefined}
                        />
                    </div>
                </div>
            </div>

            {data.basket &&
                <div className="col-start-1 col-end-2 md:row-start-2 row-start-3">
                    <h2 className="text-slate-700 text-lg mb-6">
                        روش ارسال:
                    </h2>

                    <div className="flex justify-between items-center gap-4 bg-slate-400 text-neutral-800 p-4 rounded-lg mb-2">
                        <div className="flex justify-start items-center gap-6">
                            <input
                                type="radio"
                                id="post"
                                name="delivery"
                                className="cursor-pointer"
                                onChange={() => handleChange('shipment', "پست")}
                            />
                            <label htmlFor="post" className="cursor-pointer">ارسال با پست</label>
                        </div>
                        <p className="text-xs font-semibold bg-slate-300 py-1 px-3 rounded-md">{data.shippingCost.toLocaleString('fa-IR')}</p>
                    </div>

                    <div className="flex justify-between items-center gap-4 bg-slate-400 text-neutral-800 p-4 rounded-lg">
                        <div className="flex justify-start items-center gap-6">
                            <input
                                type="radio"
                                id="courier"
                                name="delivery"
                                className="cursor-pointer"
                                disabled={formData.city != "تهران"}
                                onChange={() => handleChange('shipment', "پیک")}
                            />
                            <label htmlFor="courier" className="cursor-pointer">ارسال با پیک</label>
                        </div>
                        <p className="text-xs bg-slate-300 py-1 px-3 rounded-md">فقط برای ساکنین تهران</p>
                    </div>

                </div>
            }

            {!data.basket &&
                <button className={`md:col-start-2 md:col-end-3 col-start-1 col-end-2 md:row-start-2 row-start-3 transition-all duration-75 active:border-slate-200 bg-red-600 border-red-800 hover:bg-red-700 py-2.5 w-full rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                    onClick={logoutHandler}
                >خروج از حساب</button>
            }

            <button className={`col-start-1 col-end-2 ${data.basket ? "md:row-start-3 row-start-4" : "row-start-4 md:row-start-2"} transition-all duration-75 active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2.5 w-full rounded-lg text-white border-b-4 border-solid active:translate-y-1`}
                type='submit'
            >ثبت اطلاعات</button>


        </form>
    );
}

export default TxtInputs;