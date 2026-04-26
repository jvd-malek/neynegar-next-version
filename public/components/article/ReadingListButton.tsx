'use client';

// next and react
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// icons
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';

// utils
import { getCookie } from 'cookies-next';
import { notify } from '@/public/utils/notify';
import { fetcher } from '@/public/utils/fetcher';

interface ReadingListButtonProps {
    articleId: string;
    isInReadingList: boolean;
    userId?: string;
}

export default function ReadingListButton({ articleId, isInReadingList, userId }: ReadingListButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [inReadingList, setInReadingList] = useState(isInReadingList);
    const router = useRouter();
    const jwt = getCookie('jwt');

    const handleReadingListToggle = async () => {
        if (isLoading) return;
        setIsLoading(true);

        if (!jwt) {
            notify("لطفا ابتدا وارد حساب کاربری خود شوید.", 'error');
            setIsLoading(false);
            return;
        }

        if (!userId) {
            notify("خطا در شناسایی کاربر.", 'error');
            setIsLoading(false);
            return;
        }

        try {
            const mutation = inReadingList ? 'removeFromReadingList' : 'addToReadingList';
            const message = inReadingList ? 'مقاله از لیست مطالعه حذف شد' : 'مقاله به لیست مطالعه اضافه شد';

            await fetcher(`
                        mutation ${mutation}($userId: ID!, $articleId: ID!) {
                            ${mutation}(userId: $userId, articleId: $articleId) {
                                _id
                                readingList {
                                    articleId {
                                        _id
                                    }
                                }
                            }
                        }
                    `,
                {
                    userId,
                    articleId
                }
            )

            setInReadingList(!inReadingList);
            notify(message, 'success');
            router.refresh();
        } catch (error) {
            console.error('Error toggling reading list:', error);
            const errorMessage = error instanceof Error ? error.message : 'خطا در عملیات';
            notify(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleReadingListToggle}
            disabled={isLoading}
            className={`
                flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-200
                ${isLoading && 'opacity-50 cursor-wait'}
                ${inReadingList
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-mist-100 text-mist-700 hover:bg-slate-200 active:bg-slate-200'
                }
            `}
            aria-label={inReadingList ? 'حذف از لیست مطالعه' : 'افزودن به لیست مطالعه'}
        >
            {inReadingList ? (
                <BookmarkIcon className="w-5 h-5" />
            ) : (
                <BookmarkBorderIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
                {inReadingList ? 'حذف از لیست مطالعه' : 'افزودن به لیست مطالعه'}
            </span>
        </button>
    );
} 