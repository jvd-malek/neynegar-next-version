"use client"
import Link from "next/link";
import PhoneEnabledRoundedIcon from '@mui/icons-material/PhoneEnabledRounded';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useState, useEffect } from "react";

// جداسازی Modal به یک کامپوننت جداگانه
const ContactModal = ({ isOpen, setOpen }: { isOpen: boolean, setOpen: any }) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setOpen(false);
            setIsClosing(false);
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleBackdropClick}
        >
            <div className={`bg-white p-6 rounded-lg w-[90%] max-w-md transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                <h2 className="text-xl font-bold mb-4">اطلاعات تماس</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <span className="col-start-1 row-start-1">تلفن:</span>
                    <Link
                        href="tel:02133334434"
                        className="bg-black px-1 rounded-md flex gap-1 justify-between items-center col-start-2 row-start-1 text-white"
                        dir="ltr"
                        aria-label="شماره تلفن"
                    >
                        021 33334434
                        <PhoneEnabledRoundedIcon />
                    </Link>
                    <span className="col-start-1 row-start-2">موبایل:</span>
                    <Link
                        href="tel:09934242315"
                        className="bg-black px-1 rounded-md flex gap-1 justify-between items-center col-start-2 row-start-2 text-white"
                        dir="ltr"
                        aria-label="شماره موبایل"
                    >
                        +98 9934242315
                        <PhoneAndroidIcon />
                    </Link>
                    <span className="col-start-1 row-start-3">آدرس:</span>
                    <span className="col-start-2 row-start-3 bg-black px-1 rounded-md flex gap-1 justify-between items-center text-white">
                        تهران، نارمک، نبوت
                    </span>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        aria-label="بستن پنجره تماس"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
};

function ContactBtn() {
    const [isOpen, setOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="transition-all flex justify-center items-center duration-75 active:border-slate-200 bg-black border-slate-700 hover:bg-slate-900 py-2.5 w-full rounded-lg text-white border-b-4 border-solid active:translate-y-1 mt-4"
                aria-label="تماس با ما"
            >
                تماس با ما
            </button>
            {/* Contact modal */}
            < ContactModal isOpen={isOpen} setOpen={setOpen} />
        </>
    );
}

export default ContactBtn;