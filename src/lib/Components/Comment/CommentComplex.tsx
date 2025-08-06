"use client"
import { useEffect, useState } from "react";
import CommentBox from "./CommentBox";
import CommentInput from "./CommentInput";
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';
import {  paginatedCommentsType } from "@/lib/Types/comment";
import { useRouter } from "next/navigation";
import { getCookie } from 'cookies-next';
import PaginationBox from "../Pagination/PaginationBox";

interface CommentComplexProps {
    ban: boolean;
    article?: boolean;
    commentsData: paginatedCommentsType;
    id: string;
}

function CommentComplex({ ban, commentsData, id, article = false }: CommentComplexProps) {
    const { comments, totalPages, currentPage } = commentsData;

    const jwt = getCookie('jwt');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            setReplyComment({ _id: replyId, user: com[0].userId.name });
        }
    }, [replyId, comments]);

    return (
        <>
            {/* Comment input */}
            {isAuthenticated && (
                <div
                    id="commentScroll"
                    className={`${article ? "col-start-1 lg:col-end-2 col-end-3 row-start-1 row-end-2" : "lg:col-start-2 col-start-1 col-end-3 lg:row-start-1 row-start-2 row-end-3 lg:row-end-2"} relative flex flex-col justify-around items-center bg-slate-200 rounded-xl pt-10 pb-4 px-4`}
                >
                    <CommentInput
                        replyComment={replyComment}
                        setReplyComment={setReplyComment}
                        setReplyId={setReplyId}
                        productId={id}
                    />
                </div>
            )}

            {/* Comments list */}
            <div
                id="commentBoxScroll"
                className={!article ? `relative bg-slate-200 rounded-xl pt-10 pb-4 px-4 ${isAuthenticated ?
                    "col-start-1 col-end-3 row-start-3 lg:row-start-2 lg:row-end-3 row-end-4" :
                    "lg:col-start-2 col-start-1 col-end-3 lg:row-start-1 row-start-2 row-end-3 lg:row-end-2"
                    }` :
                    `relative bg-slate-200 rounded-xl pt-10 pb-4 px-4 ${!isAuthenticated ?
                        "col-start-1 col-end-3 row-start-3 lg:row-start-2 lg:row-end-3 row-end-4" :
                        "lg:col-start-2 col-start-1 col-end-3 lg:row-start-1 row-start-2 row-end-3 lg:row-end-2"
                    }`
                }
            >
                <h2 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    نظرات
                </h2>
                {comments.length > 0 ? (
                    <>
                        {comments.reverse().map(c => (
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
                        <PaginationBox 
                            count={totalPages} 
                            currentPage={currentPage} 
                        />
                    </>
                ) : (
                    <p className="mt-12 text-center flex items-center gap-2 mb-4 justify-center">
                        {`هنوز دیدگاهی درباره این `}
                        {article ? "مقاله" : "محصول"}
                        {` ثبت نشده است.`}
                        <SentimentDissatisfiedTwoToneIcon />
                    </p>
                )}
            </div>
        </>
    );
}

export default CommentComplex;