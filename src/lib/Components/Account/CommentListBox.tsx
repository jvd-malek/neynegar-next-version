import { commentType, paginatedCommentsType } from "@/lib/Types/comment";
import CommentBox from "../Comment/CommentBox";
import PaginationBox from "../Pagination/PaginationBox";

interface CommentListBoxProps {
    comments: paginatedCommentsType;
    user?: {
        name: string;
        address: string;
    };
    demo?: boolean;
}

function CommentListBox({ comments, user, demo = false }: CommentListBoxProps) {
    // محدود کردن نظرات در حالت demo
    const displayComments = demo ? comments.comments.slice(0, 2) : comments.comments;

    return (
        <div className="w-full">
            {/* Header - فقط در حالت غیر demo */}
            {!demo && (
                <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3 mb-6">
                    <p className="text-lg">نظرات من</p>
                    <span className="text-sm text-gray-600">
                        {comments?.total || 0} نظر
                    </span>
                </div>
            )}
            
            {displayComments && displayComments.length > 0 ? (
                <div className="space-y-4">
                    {displayComments.map((comment: any) => (
                        <div key={comment._id} className="">
                            <CommentBox account={true} {...comment} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white shadow-cs py-8 px-6 rounded-xl w-full text-center">
                    <p className="text-gray-600 mb-2">
                        هنوز نظری به اشتراک نگذاشته‌اید.
                    </p>
                    <p className="text-sm text-gray-500">
                        نظرات شما به دیگران کمک می‌کند تا محصولات بهتری انتخاب کنند.
                    </p>
                </div>
            )}
            
            {/* Pagination - فقط در حالت غیر demo */}
            {!demo && comments && comments.totalPages > 1 && (
                <PaginationBox 
                    count={comments.totalPages}
                    currentPage={comments.currentPage}
                />
            )}
        </div>
    );
}

export default CommentListBox;