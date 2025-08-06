"use client"
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import { notify } from '@/lib/utils/notify';

function CopyArticleId({ id }: { id: string }) {

    const shareHandler = () => {
        navigator.clipboard.writeText(`https://neynegar1.ir/product/${id}`);
        notify("لینک این محصول در حافظه شما کپی شد.", "success");
    };

    return (
        <div className="lg:col-start-7 lg:col-end-10 lg:row-start-1 col-start-1 h-fit w-full relative bg-slate-200 rounded-xl pt-9 pb-4 px-6">
            <div className="flex items-center border-white border-b border-solid pb-6 text-lg text-slate-900 gap-3">
                <div className="">
                    <ShareRoundedIcon />
                </div>
                <p className="">
                    اشتراک‌گذاری مطلب
                </p>
            </div>
            <button
                onClick={shareHandler}
                className="flex w-full items-center justify-between cursor-pointer mt-6 mb-2 py-1 px-2 rounded-lg text-lg relative gap-3 text-slate-800 bg-slate-400">
                <span className="">
                    <InsertLinkRoundedIcon />
                </span>
                <p className="line-clamp-1 overflow-y-scroll text-xs" dir='ltr'>{`https://neynegar1.ir/article/${id}`}</p>
            </button>
        </div>
    );
}

export default CopyArticleId;