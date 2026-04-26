// components
import HomeHeader from "@/public/components/home/HomeHeader";
import CommentListBox from "@/public/components/account/CommentListBox";

// type
import { userType } from "@/public/types/user";
import { paginatedCommentsType } from "@/public/types/comment";

type CommentSectionProps = {
    comments: paginatedCommentsType | null,
    user: userType
    demo?: boolean
}


const CommentSection = ({ comments, user, demo = false }: CommentSectionProps) => {
    return (
        <section>
            {demo ?
                <div className="bg-white rounded-lg px-2 py-4 w-full mt-10">
                    <HomeHeader
                        title="نظرات اخیر"
                        link="?activeLink=نظرات"
                        ariaLabel="نظرات اخیر"
                    />
                </div> :
                <div className="bg-white rounded-lg px-2 py-4 w-full mt-6">
                    <HomeHeader
                        title="نظرات"
                        showAll={false}
                    />
                </div>
            }
            <div className="w-full">
                {comments && comments.comments?.length > 0 ?
                    <CommentListBox comments={comments} user={user} demo={demo} />
                    :
                    <div className="text-center bg-white rounded-lg p-6 w-full mt-4 space-y-4">
                        <p className="font-semibold">
                            هنوز نظری به اشتراک نگذاشته‌اید.
                        </p>
                        <p className="text-sm text-mist-700">
                            نظرات شما به دیگران کمک می‌کند تا محصولات بهتری انتخاب کنند.
                        </p>
                    </div>
                }
            </div>
        </section>
    );
}

export default CommentSection;