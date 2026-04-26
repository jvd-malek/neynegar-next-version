import { paginatedCommentsType } from "@/public/types/comment";
import CommentBox from "@/public/components/comment/CommentBox";
import PaginationBox from "@/public/components/pagination/PaginationBox";

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
        <>
            {displayComments.map((comment: any) => (
                <div key={comment._id} className="">
                    <CommentBox account={true} {...comment} />
                </div>
            ))}

            {/* Pagination - فقط در حالت غیر demo */}
            {!demo && comments && comments.totalPages > 1 && (
                <PaginationBox
                    count={comments.totalPages}
                    currentPage={comments.currentPage}
                />
            )}
        </>
    );
}

export default CommentListBox;