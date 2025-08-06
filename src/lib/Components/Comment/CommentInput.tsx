"use client"
import { useState } from 'react';
import { Rating, CircularProgress } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { fetcher } from '@/lib/fetcher';
import { notify } from '@/lib/utils/notify';

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
    productId?: string;
    articleId?: string;
    commentBoxScroll?: React.RefObject<HTMLDivElement>;
};

export default function CommentInput({
    ticket = false,
    replyComment,
    setReplyComment,
    setReplyId,
    productId,
    articleId,
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

                const response = await fetcher(`
                          mutation CreateTicket($input: TicketInput!) {
                            createTicket(input: $input) {
                              _id
                              title
                              txt
                              status
                              response
                              createdAt
                              userId {
                                _id
                              }
                            }
                          }
                        `,
                    {
                        input: {
                            title,
                            txt: text
                        }
                    }
                );

                if (response.errors) {
                    showError("خطا در ارسال تیکت: " + (response.errors.message || ""));
                    return;
                }

                resetForm();
                router.refresh();
            } else if (replyComment) {
                if (!text.trim()) {
                    showError("لطفا متن پاسخ را وارد کنید.");
                    return;
                }

                const response = await fetch('https://api.neynegar1.ir/graphql', {
                    method: "POST",
                    headers: {
                        'authorization': jwt as string,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                          mutation AddReply($commentId: ID!, $input: ReplyInput!) {
                            addReply(commentId: $commentId, input: $input) {
                              _id
                              txt
                              star
                              status
                              like
                              replies {
                                txt
                                like
                              }
                            }
                          }
                        `,
                        variables: {
                            commentId: replyComment._id,
                            input: {
                                txt: text
                            }
                        }
                    })
                });

                const data = await response.json();
                if (data.errors) {
                    console.error("err ==>", data.errors);
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

                // ... existing code ...
                const response = await fetch('https://api.neynegar1.ir/graphql', {
                    method: "POST",
                    headers: {
                        'authorization': jwt as string,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `
                          mutation CreateComment($input: CommentInput!) {
                            createComment(input: $input) {
                              _id
                              txt
                              star
                              status
                              like
                              productId { _id }
                              articleId { _id }
                              userId { _id }
                              createdAt
                              updatedAt
                              replies {
                                txt
                                userId { _id }
                                like
                              }
                            }
                          }
                        `,
                        variables: {
                            input: {
                                txt: text,
                                star: rating,
                                productId,
                            }
                        }
                    })
                });

                const data = await response.json();
                if (data.errors) {
                    console.error("err ==>", data.errors);
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
        <div className="space-y-6">
            {!ticket && (
                <>
                    <h3 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                        ثبت دیدگاه
                    </h3>

                    {!replyComment && (
                        <div className="mt-10 bg-white p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
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
                                <p className="hidden sm:block min-w-[100px]">
                                    {ratingLabels[hoverRating !== -1 ? hoverRating : rating]}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}

            {replyComment && (
                <div className="mt-10 bg-white p-4 rounded-xl">
                    <p>پاسخ به: {replyComment.user}</p>
                    <button
                        className="w-full mt-4 py-2.5 rounded-lg bg-black text-white border-b-4 border-slate-700 hover:bg-slate-900 active:translate-y-1 transition-all"
                        onClick={resetForm}
                        disabled={isSubmitting}
                    >
                        ثبت نظر جدید
                    </button>
                </div>
            )}

            {ticket && (
                <div className="bg-white p-4 rounded-xl space-y-2">
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

            <div className="bg-white p-4 rounded-xl space-y-2">
                <label htmlFor="commentsBody">
                    {ticket ? "سوال شما" : 'محتوا دیدگاه'}
                </label>
                <textarea
                    id="commentsBody"
                    rows={4}
                    className="w-full p-2 rounded bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder={ticket ? "مثال: آیا کتاب سرو سایه را ..." : 'مثال: محصول کیفیت مطلوب را ...'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            <button
                className={`w-full py-2.5 rounded-lg text-white border-b-4 border-slate-700 hover:bg-slate-900 active:translate-y-1 active:border-slate-200 transition-all flex justify-center items-center gap-2 ${isSubmitting ? 'bg-gray-600 cursor-wait' : 'bg-black cursor-pointer'
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
                    ticket ? 'ثبت تیکت' : "ثبت دیدگاه"
                )}
            </button>
        </div>
    );
}