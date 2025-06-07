"use client";
import { useState, useEffect, useCallback } from 'react';
import { IconButton } from '@mui/material';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import TxtBox from '@/lib/Components/InputBoxes/TxtBox';
import { setCookie } from 'cookies-next';

type ErrorType = {
    type: string;
    state: boolean;
    message?: string;
};

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bas = searchParams.get('bas') === 'true';

    // حالت‌های فرم
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        code: ''
    });

    const [errors, setErrors] = useState<ErrorType[]>([
        { type: "phone", state: false, message: "شماره همراه معتبر نیست" },
        { type: "name", state: false, message: "نام و نام خانوادگی الزامی است" },
        { type: "code", state: false, message: "کد یکبارمصرف الزامی است" }
    ]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sendPass, setSendPass] = useState(false);
    const [showNameField, setShowNameField] = useState(false);
    const [apiError, setApiError] = useState('');
    const [remainingTime, setRemainingTime] = useState(0);

    // اعتبارسنجی شماره همراه
    const validatePhone = (phone: string) => {
        return /^(\+98|0098|98|0)?9\d{9}$/.test(phone);
    };

    // تغییر مقادیر فرم
    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setApiError('');
        setErrors(prev => prev.map(err =>
            err.type === field ? { ...err, state: false } : err
        ));
    };

    // تایمر برای ارسال مجدد کد
    useEffect(() => {
        if (remainingTime > 0) {
            const timer = setTimeout(() => {
                setRemainingTime(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [remainingTime]);

    // ارسال کد تایید
    const sendVerificationCode = useCallback(async () => {
        try {
            setIsSubmitting(true);
            const response = await fetch('https://api.neynegar1.ir/users/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSendPass(true);
                setRemainingTime(120); // 2 دقیقه تایمر
                setApiError('');
            } else {
                setApiError(data.message || 'خطا در ارسال کد تایید');
            }
        } catch (error) {
            setApiError('خطا در ارتباط با سرور');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData]);

    // بررسی وجود کاربر
    const checkUserExists = useCallback(async () => {
        // اعتبارسنجی اولیه شماره تلفن
        if (!formData.phone || !validatePhone(formData.phone)) {
            setErrors(prev => prev.map(err =>
                err.type === "phone" ? { ...err, state: true } : err
            ));
            return;
        }

        try {
            setIsSubmitting(true);
            setApiError('');

            // 1. بررسی وجود کاربر
            const userCheckResponse = await fetch(
                `https://api.neynegar1.ir/users/isExist/${formData.phone}`
            );

            // بررسی وضعیت پاسخ
            if (!userCheckResponse.ok) {
                throw new Error(userCheckResponse.status === 422
                    ? 'شماره همراه نامعتبر است'
                    : 'خطا در بررسی کاربر');
            }

            const userData = await userCheckResponse.json();
            console.log('User check response:', userData);

            // 2. تصمیم‌گیری بر اساس پاسخ
            if (userData) { // فرض بر اینکه API یک فیلد exists برمی‌گرداند
                setFormData(prev => ({ ...prev, name: userData.name || '' }));

                // 3. ارسال کد تایید
                const smsResponse = await fetch('https://api.neynegar1.ir/users/sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: userData.name,
                        phone: formData.phone
                    })
                });

                if (!smsResponse.ok) {
                    const errorData = await smsResponse.json();
                    throw new Error(errorData.message || 'خطا در ارسال کد تایید');
                }

                setSendPass(true);
                setShowNameField(false);
                setRemainingTime(120);
            } else {
                setShowNameField(true);
            }
        } catch (error: any) {
            console.error('Error in user check:', error);
            setApiError(error.message || 'خطا در ارتباط با سرور');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.phone]);

    // اعتبارسنجی فرم
    const validateForm = useCallback(() => {
        let isValid = true;
        const newErrors = [...errors];

        // اعتبارسنجی شماره همراه
        if (!formData.phone || !validatePhone(formData.phone)) {
            const phoneError = newErrors.find(e => e.type === "phone");
            if (phoneError) phoneError.state = true;
            isValid = false;
        }

        // اعتبارسنجی نام (اگر نیاز باشد)
        if (showNameField && !formData.name.trim()) {
            const nameError = newErrors.find(e => e.type === "name");
            if (nameError) nameError.state = true;
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    }, [formData, errors, showNameField]);


    // عملیات ورود
    const handleLogin = useCallback(async () => {
        try {
            const response = await fetch(
                `https://api.neynegar1.ir/users/${showNameField ? "register" : "login"}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        phone: formData.phone
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setCookie('jwt', data.accessToken, {
                    maxAge: 60 * 60 * 24 * 90,
                    path: '/',
                });
                router.push(bas ? "/basket" : "/");
                router.refresh();
            } else {
                setApiError(data.message || 'خطا در ورود به سیستم');
            }
        } catch (error) {
            setApiError('خطا در ارتباط با سرور');
        }
    }, [formData, showNameField, bas, router]);

    // تایید کد یکبارمصرف
    const verifyCode = useCallback(async () => {
        try {
            setIsSubmitting(true);
            const response = await fetch('https://api.neynegar1.ir/users/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formData.phone,
                    code: formData.code
                })
            });

            const data = await response.json();

            if (data.state) {
                await handleLogin();
            } else {
                setApiError(data.msg || 'کد وارد شده نامعتبر است');
            }
        } catch (error) {
            setApiError('خطا در ارتباط با سرور');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.phone, formData.code, handleLogin]);

    // ارسال فرم
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        if (!sendPass) {
            if (showNameField) {
                await sendVerificationCode();
            } else {
                await checkUserExists();
            }
        } else {
            await verifyCode();
        }
    }, [validateForm, sendPass, showNameField, sendVerificationCode, checkUserExists, verifyCode]);

    // تغییر شماره همراه
    const handlePhoneChange = () => {
        setSendPass(false);
        setShowNameField(false);
        setFormData({ phone: '', name: '', code: '' });
        setApiError('');
        setRemainingTime(0);
    };

    // مدیریت کلید Enter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSubmit]);

    return (
        <>
            {/* بهبودهای سئو */}
            <Head>
                <title>ورود به حساب کاربری | فروشگاه اینترنتی نی نگار</title>
                <meta
                    name="description"
                    content="ورود یا ثبت نام در فروشگاه اینترنتی نی نگار. برای دسترسی به سبد خرید و سفارشات خود وارد شوید."
                />
                <meta name="keywords" content="ورود, ثبت نام, حساب کاربری, نی نگار, فروشگاه اینترنتی" />
                <meta property="og:title" content="ورود به حساب کاربری | نی نگار" />
                <meta property="og:description" content="ورود یا ثبت نام در فروشگاه اینترنتی نی نگار" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://neynegar1.ir/login" />
                <link rel="canonical" href="https://neynegar1.ir/login" />

                {/* اسکیما مارکاپ */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "ورود به حساب کاربری",
                        "description": "صفحه ورود به حساب کاربری فروشگاه اینترنتی نی نگار",
                        "url": "https://neynegar1.ir/login",
                        "potentialAction": {
                            "@type": "LoginAction",
                            "target": "https://api.neynegar1.ir/users/login",
                            "method": "POST"
                        }
                    })}
                </script>
            </Head>

            {/* ساختار اصلی صفحه */}
            <div
                className="flex justify-center items-center w-full min-h-screen bg-[url(../../public/Img/siah.webp)] bg-cover bg-center bg-fixed"
                itemScope
                itemType="https://schema.org/WebPage"
            >
                <main
                    className="container mx-auto px-4 py-8 flex justify-center items-center"
                    role="main"
                    aria-label="فرم ورود به حساب کاربری"
                >
                    <article
                        className="sm:h-[80vh] h-[60vh] sm:max-w-[25rem] w-[85vw] rounded-3xl overflow-hidden relative bg-dark-glassh backdrop-blur-sm shadow-xl"
                        itemScope
                        itemType="https://schema.org/LoginAction"
                    >
                        {/* دکمه بستن */}
                        <Link
                            href="/"
                            className="absolute top-5 right-4 z-20"
                            aria-label="بستن صفحه ورود"
                            prefetch={false}
                        >
                            <IconButton color="primary" aria-label="بستن">
                                <ClearRoundedIcon className="text-white" />
                            </IconButton>
                        </Link>

                        {/* محتوای فرم */}
                        <div className="w-full h-full py-8 px-8 flex flex-col justify-between">
                            {/* عنوان صفحه (مخفی برای موتورهای جستجو) */}
                            <h1 className="sr-only">ورود به حساب کاربری نی نگار</h1>
                            <h2 className="text-2xl font-bold text-white text-center mb-6" aria-hidden="true">
                                {showNameField ? 'تکمیل ثبت نام' : sendPass ? 'تایید کد یکبارمصرف' : 'ورود به حساب کاربری'}
                            </h2>

                            {/* فرم ورود */}
                            <form
                                className="flex flex-col gap-5"
                                dir="rtl"
                                itemScope
                                itemType="https://schema.org/LoginAction"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                            >
                                {/* فیلد شماره همراه */}
                                <div className="relative">
                                    <TxtBox
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(value) => handleChange('phone', value)}
                                        label="شماره همراه"
                                        error={errors.find(e => e.type === "phone")?.state}
                                        errorMessage={errors.find(e => e.type === "phone")?.message}
                                        disabled={sendPass}
                                        inputMode="numeric"
                                        autoComplete="tel"
                                    />

                                    {sendPass && (
                                        <button
                                            type="button"
                                            onClick={handlePhoneChange}
                                            className="text-xs px-3 py-2 rounded-md bg-slate-500/80 text-neutral-200 hover:bg-slate-600 transition absolute top-1/2 -translate-y-1/2 left-[10%]"
                                            disabled={isSubmitting}
                                            aria-label="تغییر شماره همراه"
                                        >
                                            تغییر شماره
                                        </button>
                                    )}
                                </div>

                                {/* فیلد نام (در صورت نیاز) */}
                                {showNameField && (
                                    <TxtBox
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(value) => handleChange('name', value)}
                                        label="نام و نام‌خانوادگی"
                                        error={errors.find(e => e.type === "name")?.state}
                                        errorMessage={errors.find(e => e.type === "name")?.message}
                                        autoComplete="name"
                                    />
                                )}

                                {/* فیلد کد یکبارمصرف (در صورت نیاز) */}
                                {sendPass && (
                                    <div className="relative">
                                        <TxtBox
                                            id="code"
                                            type="number"
                                            value={formData.code}
                                            onChange={(value) => handleChange('code', value)}
                                            label="کد یکبارمصرف"
                                            error={errors.find(e => e.type === "code")?.state || !!apiError}
                                            errorMessage={errors.find(e => e.type === "code")?.message}
                                            inputMode="numeric"
                                        />

                                        <button
                                            type="submit"
                                            disabled={isSubmitting || remainingTime > 0}
                                            className={`text-xs px-8 py-2 rounded-md ${apiError
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-slate-600 text-neutral-200 hover:bg-slate-700'
                                                } transition absolute top-1/2 -translate-y-1/2 left-[10%]`}
                                            aria-label="تایید کد یکبارمصرف"
                                        >
                                            {isSubmitting ? 'در حال بررسی...' : 'تایید'}
                                        </button>
                                    </div>
                                )}

                                {/* نمایش خطاهای API */}
                                {apiError && (
                                    <p className="text-xs text-rose-300 text-center mt-2" role="alert">
                                        {apiError}
                                    </p>
                                )}

                                {/* دکمه ارسال کد */}
                                {!sendPass && (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || remainingTime > 0}
                                        className="px-4 py-4 w-full transition-all bg-slate-800 hover:bg-slate-900 rounded-lg text-white border-b-4 border-slate-700 active:border-slate-600 active:translate-y-1 disabled:opacity-70"
                                        aria-label={showNameField ? 'ارسال کد تایید' : 'بررسی شماره همراه'}
                                    >
                                        {isSubmitting ? 'در حال بررسی...' :
                                            showNameField ? 'ارسال کد تایید' : 'ادامه'}
                                    </button>
                                )}

                                {/* تایمر برای ارسال مجدد کد */}
                                {remainingTime > 0 && (
                                    <p className="text-xs text-center text-gray-300">
                                        امکان ارسال مجدد کد پس از {remainingTime} ثانیه
                                    </p>
                                )}
                            </form>
                        </div>
                    </article>
                </main>
            </div>
        </>
    );
}