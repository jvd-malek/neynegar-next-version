"use client"
import TxtBox from "@/lib/Components/InputBoxes/TxtBox";
import { userType } from "@/lib/Types/user";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { animateScroll } from "react-scroll";
import { Bounce, toast } from "react-toastify";

type ErrorType = {
    type: string;
    state: boolean;
    message?: string;
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

    // تغییر مقادیر فرم
    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => prev.map(err =>
            err.type === field ? { ...err, state: false } : err
        ));
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

        if (!formData.postCode.trim()) {
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
            let Address = data.user.address.split("%%")

            setFormData({
                phone: String(data.user.phone) ?? "",
                name: data.user.name ?? "",
                state: data.user.address ? Address[0] : '',
                city: data.user.address ? Address[1] : '',
                address: data.user.address ? Address[2] : '',
                postCode: String(data.user.postCode) ?? '',
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

    const infoHandler = () => {
        if (!validateForm()) return;

        updateInfoHandler()
        animateScroll.scrollTo(300, {
            duration: 300,
            smooth: 'easeInOutQuart'
        })
    }

    const updateInfoHandler = async () => {

        if (jwt) {
            await updateInfoUser({ name: formData.name.trim(), postCode: +formData.postCode.trim(), address: `${formData.state.trim()}%%${formData.city.trim()}%%${formData.address.trim()}` })
            toast.success("اطلاعات شما با موفقیت ذخیره شد.", {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });

            if (data.basket) {
                setCookie("basketForm", formData)
            }
        } else {
            router.push("/login?bas=true")
        }
    }

    const updateInfoUser = async (body: object) => {
        if (jwt) {
            await fetch(`https://api.neynegar1.ir/users/update-user`, {
                method: "PUT",
                headers: {
                    'authorization': jwt as string,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.state) {
                        console.log(data.msg)
                    }
                })
        }
        router.refresh()
    }

    const logoutHandler = async () => {
        deleteCookie("jwt")
        router.refresh()
    }

    return (
        <form
            className="grid md:grid-cols-2 grid-cols-1 gap-16 justify-between"
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
                        <TxtBox
                            id="name"
                            type="text"
                            label="نام"
                            error={errors.find(e => e.type === "name")?.state}
                            errorMessage={errors.find(e => e.type === "name")?.message}
                            value={formData.name}
                            onChange={(value) => handleChange('name', value)}
                            autoComplete='name'
                        />
                        <TxtBox
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(value) => handleChange('phone', value)}
                            label="شماره همراه"
                            error={errors.find(e => e.type === "phone")?.state}
                            errorMessage={errors.find(e => e.type === "phone")?.message}
                            inputMode="numeric"
                            autoComplete="tel"
                            readOnly
                        />
                        <TxtBox
                            id="postCode"
                            type="number"
                            value={formData.postCode}
                            onChange={(value) => handleChange('postCode', value)}
                            label="کد پستی"
                            error={errors.find(e => e.type === "postCode")?.state}
                            errorMessage={errors.find(e => e.type === "postCode")?.message}
                            inputMode="numeric"
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
                        <TxtBox
                            id="state"
                            type="text"
                            label="استان"
                            error={errors.find(e => e.type === "state")?.state}
                            errorMessage={errors.find(e => e.type === "state")?.message}
                            value={formData.state}
                            onChange={(value) => handleChange('state', value)}
                        />
                        <TxtBox
                            id="city"
                            type="text"
                            label="شهر"
                            error={errors.find(e => e.type === "city")?.state}
                            errorMessage={errors.find(e => e.type === "city")?.message}
                            value={formData.city}
                            onChange={(value) => handleChange('city', value)}
                        />
                        <TxtBox
                            id="address"
                            type="text"
                            label="آدرس"
                            error={errors.find(e => e.type === "address")?.state}
                            errorMessage={errors.find(e => e.type === "address")?.message}
                            value={formData.address}
                            onChange={(value) => handleChange('address', value)}
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
                                onChange={() => handleChange('shipment', "post")}
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
                                onChange={() => handleChange('shipment', "bike")}
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