"use client"
import { notify } from "@/public/utils/notify";

const CopyDiscountCode = ({ code }: { code: string }) => {

    const copyHandler = () => {
        navigator.clipboard.writeText(code);
        notify("کد تخفیف در حافظه شما کپی شد.", "success");
    };

    return (
        <button
            onClick={copyHandler}
            className="cursor-pointer text-white px-3 py-1.5 rounded text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-600">
            کپی کد
        </button>
    );
}

export default CopyDiscountCode;