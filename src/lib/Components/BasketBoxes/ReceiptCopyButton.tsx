'use client';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { notify } from '@/lib/utils/notify';

export default function ReceiptCopyButton({ receiptText }: { receiptText: string }) {


    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(receiptText);
            notify('متن رسید با موفقیت کپی شد', 'success');
        } catch (err) {
            console.error('Failed to copy receipt:', err);
            notify('خطا در کپی کردن رسید', 'error');
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