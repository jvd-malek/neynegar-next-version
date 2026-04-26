import Rating from '@mui/material/Rating';
import IconButton from "@mui/material/IconButton";
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import ReplyBox from './ReplyBox';
import { commentType } from "@/public/types/comment";
import Image from 'next/image';
import Link from 'next/link';

type CommentBoxProps = commentType & {
    account?: boolean;
    ticket?: boolean;
    commentScrollHandler?: () => void;
    setReplyId?: React.Dispatch<React.SetStateAction<string>>;
};

const getUserStatus = (status: string): string => {
    switch (status) {
        case "owner": return "مدیر";
        case "admin": return "ادمین";
        default: return "کاربر";
    }
};

function CommentBox({
    account = false,
    ticket = false,
    txt,
    replies = [],
    response,
    status,
    star,
    commentScrollHandler,
    createdAt,
    userId,
    setReplyId,
    _id,
    productId,
    articleId
}: CommentBoxProps) {

    const handleReply = () => {
        if (!account && commentScrollHandler && setReplyId) {
            setReplyId(_id);
            commentScrollHandler();
        }
    };

    const userStatus = getUserStatus(userId.status);

    return (
        <div className={`${account || ticket ? 'mt-10 bg-white' : 'mt-16 bg-mist-100'} mb-6 py-4 px-6 rounded-xl`}>
            {/* Header section */}
            <div className="flex justify-between items-center w-full pb-4 border-b border-slate-400">
                <div className="flex items-center gap-4">
                    {userId.img ? (
                        <Image
                            src={`https://api.neynegar1.ir/uploads/${userId.img}`}
                            alt={userId.name}
                            width={account ? 80 : 64}
                            height={account ? 80 : 64}
                            className={`rounded-${account ? 'md' : 'full'}`}
                        />
                    ) : (
                        <AccountCircleTwoToneIcon className="text-slate-500" sx={{ fontSize: '4rem' }} />
                    )}

                    <div>
                        {!account ? (
                            <>
                                <p className={ticket ? 'hidden' : 'block'}>
                                    {userId.name} <span className="font-bold">| {userStatus}</span>
                                </p>
                                <p className={ticket ? 'block' : 'hidden'}>پرسش شما</p>
                            </>
                        ) : (
                            <p className='flex flex-col md:flex-row gap-1 md:items-center items-start'>
                                {`دیدگاه شما در مورد: `}
                                <Link
                                    href={productId ? `/product/${productId._id}` : `/article/${articleId?._id}`}
                                    className='text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-all duration-200 font-medium bg-blue-100 hover:bg-blue-200 px-1.5 py-0.5 my-0.5 rounded-md'
                                >
                                    {`${productId ? productId.title : articleId?.title}`}
                                </Link>
                            </p>
                        )}
                        <p className="text-sm text-slate-500 leading-6">
                            {new Date(Number(createdAt)).toLocaleString('fa-IR')}
                        </p>
                        {ticket && (
                            <div className="sm:hidden">{status}</div>
                        )}
                    </div>
                </div>

                {!ticket && !account && (
                    <div className="bg-slate-300 rounded-full hover:bg-slate-300 transition-colors">
                        <IconButton onClick={handleReply} aria-label="reply">
                            <ReplyRoundedIcon />
                        </IconButton>
                    </div>
                )}

                {ticket && (
                    <div className="hidden sm:block">{status}</div>
                )}
            </div>

            {/* Content section */}
            <div className="flex flex-col gap-4 w-full mt-4">
                <p className="whitespace-pre-line">{txt}</p>

                {!ticket && (
                    <div className="w-fit" dir="ltr">
                        <Rating
                            value={star}
                            precision={0.5}
                            readOnly
                            emptyIcon={<StarBorderRoundedIcon fontSize="inherit" />}
                            icon={<StarRoundedIcon fontSize="inherit" />}
                        />
                    </div>
                )}
            </div>

            {/* Response section */}
            {response ? (
                <div className="bg-slate-100 mt-6 p-4 rounded-xl">
                    <p>{response}</p>
                </div>
            ) : replies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {replies.map(reply => (
                        <ReplyBox key={`${reply._id}-${reply.createdAt}`} {...reply} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommentBox;