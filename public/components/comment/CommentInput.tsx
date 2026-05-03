"use client"
import { useState } from 'react';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/public/utils/fetcher';
import { notify } from '@/public/utils/notify';
import { ADD_REPLY, CREATE_COMMENT, CREATE_TICKET } from '@/public/graphql/commentQueries';

const ratingLabels: Record<number, string> = {
    0.5: 'ضعیف',
    1: '+ ضعیف',
    1.5: 'متوسط',
    2: '+ متوسط',
    2.5: 'خوب',
    3: '+ خوب',
    3.5: 'خیلی‌خوب',
    4: '+ خیلی‌خوب',
    4.5: 'عالی',
    5: '+ عالی',
};

type CommentInputProps = {
    ticket?: boolean;
    replyComment?: { _id: string; user: string } | null;
    setReplyComment?: React.Dispatch<React.SetStateAction<{ _id: string; user: string } | null>>;
    setReplyId?: React.Dispatch<React.SetStateAction<string>>;
    targetId?: string;
    targetType?: "Product" | "Article" | "Package" | "Course";
    commentBoxScroll?: React.RefObject<HTMLDivElement | null>;
};

export default function CommentInput({
    ticket = false,
    replyComment,
    setReplyComment,
    setReplyId,
    targetId,
    targetType = "Product",
    commentBoxScroll
}: CommentInputProps) {
    const jwt = getCookie('jwt');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(-1);
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter()

    const resetForm = () => {
        setText("");
        setTitle("");
        setRating(5);
        setReplyId?.("");
        setReplyComment?.(null);
    };

    const showError = (message: string) => {
        notify(message, 'error');
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        if (!jwt) {
            showError("لطفا ابتدا وارد حساب کاربری خود شوید.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (ticket) {
                if (!title.trim() || !text.trim()) {
                    showError("لطفا عنوان و متن پرسش را پر کنید.");
                    return;
                }

                const response = await fetcher(CREATE_TICKET,
                    {
                        input: {
                            title,
                            txt: text
                        }
                    }
                );

                if (!response) {
                    showError("خطا در ارسال تیکت");
                    return;
                }

                resetForm();
                router.refresh();
            } else if (replyComment) {
                if (!text.trim()) {
                    showError("لطفا متن پاسخ را وارد کنید.");
                    return;
                }

                const response = await fetcher(ADD_REPLY,
                        {
                            commentId: replyComment._id,
                            input: {
                                txt: text
                            }
                        }
                );

                if (!response) {
                    showError("خطا در ارسال پاسخ");
                    return;
                }

                resetForm();
                commentBoxScroll?.current?.scrollIntoView({ behavior: "smooth" });
                router.refresh()
            } else {
                if (!text.trim()) {
                    showError("لطفا متن دیدگاه را وارد کنید.");
                    return;
                }

                if (!targetId || !targetType) {
                    showError("خطا: اطلاعات هدف مشخص نیست.");
                    return;
                }

                const response = await fetcher(CREATE_COMMENT,
                    {
                        input: {
                            txt: text,
                            star: rating,
                            target: {
                                type: targetType,
                                id: targetId
                            }
                        }
                    }
                )

                if (!response) {
                    showError("خطا در ثبت دیدگاه");
                    return;
                }

                resetForm();
                commentBoxScroll?.current?.scrollIntoView({ behavior: "smooth" });
                router.refresh()
            }
        } catch (error) {
            console.error("Error submitting:", error);
            showError("خطا در ارسال. لطفا دوباره تلاش کنید.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            {!ticket && (
                <>
                    <h3 className="text-lg font-bold">
                        {replyComment ? 'ثبت پاسخ' : 'ثبت دیدگاه'}
                    </h3>

                    {!replyComment && (
                        <div className="mt-10 bg-mist-100 p-4 rounded-lg flex flex-wrap justify-between items-center gap-4">
                            <p>امتیاز دهید!</p>
                            <div className="flex items-center gap-4 w-full sm:w-auto" dir='ltr'>
                                <Rating
                                    value={rating}
                                    precision={0.5}
                                    onChange={(_, newValue) => newValue && setRating(newValue)}
                                    onChangeActive={(_, newHover) => setHoverRating(newHover)}
                                    emptyIcon={<StarBorderRoundedIcon fontSize="inherit" />}
                                    icon={<StarRoundedIcon fontSize="inherit" />}
                                />
                                <p className="hidden sm:block min-w-25">
                                    {ratingLabels[hoverRating !== -1 ? hoverRating : rating]}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {replyComment && (
                <div className="mt-10 bg-mist-100 p-4 rounded-lg">
                    <p>پاسخ به: {replyComment.user}</p>
                    <button
                        className="w-full mt-4 py-2.5 rounded-lg bg-black text-white border-b-4 border-slate-700 hover:bg-slate-900 active:translate-y-1 transition-all"
                        onClick={resetForm}
                        disabled={isSubmitting}
                    >
                        انصراف
                    </button>
                </div>
            )}

            {ticket && (
                <div className="bg-mist-100 p-4 rounded-lg my-4">
                    <label htmlFor="commentsTitle">عنوان پرسش</label>
                    <input
                        id="commentsTitle"
                        type="text"
                        className="w-full p-2 rounded bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="مثال: کیفیت محصول"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
            )}

            <div className="bg-mist-100 p-4 rounded-lg my-4">
                <label htmlFor="commentsBody">
                    {ticket ? "سوال شما" : replyComment ? 'متن پاسخ' : 'محتوا دیدگاه'}
                </label>
                <textarea
                    id="commentsBody"
                    rows={4}
                    className="w-full p-2 rounded bg-mist-100 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder={ticket ? "مثال: آیا کتاب سرو سایه را ..." : 'مثال: محصول کیفیت مطلوب را ...'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            <button
                className={`w-full py-2.5 font-semibold rounded-lg text-white border-b-4 border-slate-700 hover:bg-slate-900 active:translate-y-1 active:border-white transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-600 cursor-wait' : 'bg-black cursor-pointer'
                    }`}
                onClick={handleSubmit}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <CircularProgress size={20} color="inherit" />
                        <span>در حال ارسال...</span>
                    </>
                ) : (
                    ticket ? 'ثبت تیکت' : replyComment ? 'ثبت پاسخ' : 'ثبت دیدگاه'
                )}
            </button>
        </div>
    );
}