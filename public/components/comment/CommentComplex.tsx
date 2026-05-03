"use client"
import { useEffect, useState, useRef } from "react";
import CommentBox from "./CommentBox";
import CommentInput from "./CommentInput";
import { paginatedCommentsType } from "@/public/types/comment";
import { useRouter } from "next/navigation";
import { getCookie } from 'cookies-next';
import PaginationBox from "@/public/components/pagination/PaginationBox";
import Link from "next/link";
import KeyboardBackspaceRounded from "@mui/icons-material/KeyboardBackspaceRounded";

interface CommentComplexProps {
    ban: boolean;
    commentsData: paginatedCommentsType;
    id: string;
    targetType: "Product" | "Article" | "Package" | "Course";
}

function CommentComplex({ ban, commentsData, id, targetType }: CommentComplexProps) {
    const { comments, totalPages, currentPage } = commentsData;

    const jwt = getCookie('jwt');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const commentBoxScrollRef = useRef<HTMLDivElement>(null); // اضافه کردن ref

    useEffect(() => {
        setIsAuthenticated(!!jwt && !ban);
    }, [jwt, ban]);

    const [replyId, setReplyId] = useState("");
    const [replyComment, setReplyComment] = useState<{ _id: string, user: string } | null>(null)
    const router = useRouter();

    const commentScrollHandler = () => {
        router.push(`#commentScroll`);
    };

    useEffect(() => {
        if (comments && replyId.length > 0) {
            const com = comments.filter(c => c._id === replyId);
            if (com.length > 0) {
                setReplyComment({ _id: replyId, user: com[0].userId.name });
            }
        }
    }, [replyId, comments]);

    // متن مناسب برای هر نوع هدف
    const getTargetText = () => {
        switch (targetType) {
            case "Article": return "مقاله";
            case "Package": return "پکیج";
            case "Course": return "دوره";
            default: return "محصول";
        }
    };

    return (
        <>
            {/* Comment input */}
            {isAuthenticated && (
                <div
                    id="commentScroll"
                    className={`col-start-1 h-fit lg:col-end-2 col-end-3 row-start-1 row-end-2 relative flex flex-col justify-around items-center bg-white rounded-lg`}
                >
                    <CommentInput
                        replyComment={replyComment}
                        setReplyComment={setReplyComment}
                        setReplyId={setReplyId}
                        targetId={id}
                        targetType={targetType}
                        commentBoxScroll={commentBoxScrollRef}
                    />
                </div>
            )}

            {/* Comments list */}
            <div
                id="commentBoxScroll"
                ref={commentBoxScrollRef}
                className={`bg-white rounded-lg p-6 h-fit
                    ${!isAuthenticated ?
                        "col-start-1 col-end-3 row-start-3 lg:row-start-2" :
                        "lg:col-start-2 col-start-1 col-end-3 lg:row-start-1 row-start-2 lg:row-end-2"}
                        `}
            >
                <h2 className="text-lg font-bold">
                    نظرات
                </h2>

                {!isAuthenticated &&
                    <Link
                        href="/login"
                        className="group font-semibold mt-6 p-2 w-full bg-cyan-100 text-cyan-700 rounded-md flex justify-between items-center gap-x-4 gap-y-2 flex-wrap"
                        role="button"
                        tabIndex={0}
                    >
                        <p>
                            برای ثبت نظر ابتدا باید وارد حساب کاربری خود شوید
                        </p>
                        <div className="flex items-center gap-1 mr-auto">
                            <span className="text-sm underline">ورود</span>
                            <KeyboardBackspaceRounded
                                fontSize='inherit'
                                className="text-sm transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse"
                                aria-hidden="true"
                            />
                        </div>
                    </Link>
                }

                {comments.length > 0 ? (
                    <>
                        {[...comments].reverse().map(c => (
                            <div key={c._id}>
                                <CommentBox
                                    account={false}
                                    ticket={false}
                                    {...c}
                                    commentScrollHandler={commentScrollHandler}
                                    setReplyId={setReplyId}
                                />
                            </div>
                        ))}
                        {totalPages > 1 &&
                            <PaginationBox
                                count={totalPages}
                                currentPage={currentPage}
                            />
                        }
                    </>
                ) : (
                    <div className="mt-6 flex flex-col items-center gap-2  justify-center w-full p-8 border border-mist-200 rounded-lg">
                        <p className="">
                            هنوز هیچ دیدگاهی ثبت نشده!
                        </p>
                        <p className="text-sm text-mist-700">
                            اولین نفری باش که به این
                            {` ${getTargetText()} `}
                            نظر میدی.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default CommentComplex;