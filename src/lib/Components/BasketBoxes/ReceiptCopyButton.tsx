'use client';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { Bounce, toast } from 'react-toastify';

export default function ReceiptCopyButton({ receiptText }: { receiptText: string }) {


    const notify = (txt: string, status: boolean) => {
        if (status) {
            toast.success(txt, {
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
        } else {
            toast.error(txt, {
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
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(receiptText);
            notify('متن رسید با موفقیت کپی شد', true);
        } catch (err) {
            console.error('Failed to copy receipt:', err);
            notify('خطا در کپی کردن رسید', false);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="
        flex items-center gap-2
        px-4 py-1
        text-sm font-medium cursor-pointer
        transition-all duration-75 bg-black hover:bg-slate-900 w-fit rounded-md text-white
      "
        >
            <ContentCopyRoundedIcon fontSize='small' />
            <span>کپی رسید</span>
        </button>
    );
}