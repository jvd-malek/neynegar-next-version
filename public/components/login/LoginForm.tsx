"use client"

// next and react
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// utils
import { IsUserExists, sendVerificationCode, verifyCode } from '@/public/utils/LoginUtils';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { notify } from '@/public/utils/notify';
import { mutate } from 'swr';

// components and types
import { Input, handleChangeForm, handleClearForm, handleFormValidator } from '@/public/components/login/Input';
import { formType } from '@/public/types/input';

const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bas = searchParams.get('bas') === 'true';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sendPass, setSendPass] = useState(false);
    const [sendPassAgain, setSendPassAgain] = useState(false);
    const [showNameField, setShowNameField] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    // اعتبارسنجی اطلاعات فرم
    const validatePhone = (phone: string) => {
        return /^(\+98|0098|98|0)?9\d{9}$/.test(phone);
    };

    // حالت‌های فرم
    const [formData, setFormData] = useState<formType[]>([
        {
            name: "phone",
            type: "number",
            value: "",
            validateRule: validatePhone,
            error: false,
            errorMessage: "شماره همراه معتبر نیست"
        },
        {
            name: "name",
            type: "text",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: "نام و نام خانوادگی الزامی است"
        },
        {
            name: "code",
            type: "number",
            value: "",
            validateRule: null,
            error: false,
            errorMessage: "کد یکبارمصرف الزامی است"
        }
    ]);

    // تایمر برای ارسال مجدد کد
    useEffect(() => {
        if (remainingTime > 0) {
            const timer = setTimeout(() => {
                setRemainingTime(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (remainingTime === 0 && sendPass) {
            setSendPass(false)
            setSendPassAgain(true);
        }
    }, [remainingTime]);

    // ارسال فرم
    const handleSubmit = useCallback(async () => {
        if (!handleFormValidator(formData)) return;
        setIsSubmitting(true);
        try {
            if (!sendPass) {
                setSendPassAgain(false)
                if (!showNameField) {
                    const isUserExists = await IsUserExists(`${formData[0].value}`);
                    if (isUserExists) {
                        handleChangeForm(setFormData, isUserExists, formData[1].name)
                        await sendVerificationCode(isUserExists, `${formData[0].value}`);
                        setSendPass(true);
                        setRemainingTime(120); // 2 دقیقه تایمر
                    } else {
                        setShowNameField(true);
                    }
                } else {
                    await sendVerificationCode(`${formData[1].value}`.trim(), `${formData[0].value}`);
                    setSendPass(true);
                    setRemainingTime(120); // 2 دقیقه تایمر
                }

            } else {
                const basketCookie = getCookie('basket');
                const token = await verifyCode(`${formData[1].value}`.trim(), `${formData[0].value}`, `${formData[2].value}`, basketCookie as string);
                if (token) {
                    setCookie('jwt', token, {
                        maxAge: 60 * 60 * 24 * 90,
                        path: '/'
                    });
                    deleteCookie('basket');
                    mutate(["userByToken"])
                    router.push(bas ? '/basket' : '/');
                    notify("ورود با موفقیت انجام شد.", 'success');
                }
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [sendPass, showNameField, formData]);

    // تغییر شماره همراه
    const handlePhoneChange = () => {
        setSendPass(false);
        setShowNameField(false);
        handleClearForm(setFormData)
        setRemainingTime(0);
    };

    return (
        <div className="w-full h-full p-4 flex flex-col justify-between">

            <h1 className="sr-only">ورود به حساب کاربری نی نگار</h1>
            <h2 className="text-xl font-bold text-gray-700 text-center mb-6" aria-hidden="true">
                {showNameField ? 'تکمیل ثبت نام' : sendPass ? 'تایید کد یکبارمصرف' : 'ورود به حساب کاربری'}
            </h2>

            <form
                className="flex flex-col gap-3"
                dir="rtl"
                itemScope
                itemType="https://schema.org/LoginAction"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                {/* فیلد شماره همراه */}
                <div className="relative bg-black p-2 rounded-lg">
                    <Input
                        id={`${formData[0].value}`}
                        label="شماره همراه (با فرمت مثال وارد کنید)"
                        form={formData[0]}
                        setForm={setFormData}
                        placeholder='مثال: 09121234567'
                        disabled={isSubmitting || sendPass}
                        required
                    />
                    {sendPass && (
                        <button
                            type="button"
                            onClick={handlePhoneChange}
                            className="text-xs px-3 sm:py-2 py-1.5 rounded-md bg-slate-600/80 text-neutral-200 hover:bg-slate-600 transition absolute sm:top-14 top-12.5 -translate-y-1/2 left-[4%]"
                            disabled={isSubmitting}
                            aria-label="تغییر شماره همراه"
                        >
                            تغییر شماره
                        </button>
                    )}
                </div>

                {/* فیلد نام (در صورت نیاز) */}
                {showNameField && (
                    <div className="bg-black p-2 rounded-lg">
                        <Input
                            id={`${formData[1].value}`}
                            label="نام و نام‌خانوادگی"
                            form={formData[1]}
                            setForm={setFormData}
                            placeholder='مثال: جواد ملکی'
                            required
                        />
                    </div>
                )}

                {/* فیلد کد یکبارمصرف (در صورت نیاز) */}
                {sendPass && (
                    <div className="relative bg-black p-2 rounded-lg">
                        <Input
                            id={`${formData[2].value}`}
                            label="کد یکبارمصرف"
                            form={formData[2]}
                            setForm={setFormData}
                            disabled={isSubmitting}
                            required
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="text-xs px-3 sm:py-2 py-1.5 rounded-md bg-slate-600/80 text-neutral-200 hover:bg-slate-600 transition absolute sm:top-14 top-12.5 -translate-y-1/2 left-[4%]"
                            aria-label="تایید کد یکبارمصرف"
                        >
                            {isSubmitting ? 'در حال بررسی...' : 'تایید'}
                        </button>
                    </div>
                )}


                {/* دکمه ارسال کد */}
                {!sendPass && !sendPassAgain && (
                    <button
                        type="submit"
                        disabled={isSubmitting || remainingTime > 0}
                        className="px-4 py-4 w-full transition-all bg-black hover:bg-slate-900 rounded-lg text-white border-b-4 border-slate-700 active:border-gray-300 active:translate-y-1 disabled:opacity-70"
                        aria-label={showNameField ? 'ارسال کد تایید' : 'بررسی شماره همراه'}
                    >
                        {isSubmitting ? 'در حال بررسی...' :
                            showNameField ? 'ارسال کد تایید' : 'ادامه'}
                    </button>
                )}
                {sendPassAgain && (
                    <button
                        type="submit"
                        disabled={isSubmitting || remainingTime > 0}
                        className="px-4 py-4 w-full transition-all bg-black hover:bg-slate-900 rounded-lg text-white border-b-4 border-slate-700 active:border-gray-300 active:translate-y-1 disabled:opacity-70"
                        aria-label="ارسال مجدد کد"
                    >
                        ارسال مجدد کد
                    </button>
                )}

                {/* تایمر برای ارسال مجدد کد */}
                {remainingTime > 0 && (
                    <p className="text-xs text-center text-mist-700">
                        امکان ارسال مجدد کد پس از {remainingTime} ثانیه
                    </p>
                )}
            </form>
        </div>
    );
}

export default LoginForm;