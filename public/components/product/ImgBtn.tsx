"use client"

// next and react
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// mui components and icons
import IconButton from '@mui/material/IconButton';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';

// utils
import { fetcher } from '@/public/utils/fetcher';
import { notify } from '@/public/utils/notify';

// types
import { userType } from '@/public/types/user';


function ImgBtn({ id, user }: { id: string, user: userType | null }) {

    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);
    const [notifActive, setNotifActive] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) { 
            setNotifActive(user.status === 'notifUser');
            setIsFavorite(
                user.favorite?.some((favoriteProduct) => favoriteProduct.productId?._id === id)
            );
        }
    }, [user]);

    const commentScrollHandler = () => {
        router.push(`#commentScroll`);
    };

    const shareHandler = () => {
        navigator.clipboard.writeText(`https://neynegar1.ir/product/${id}`);
        notify("لینک این محصول در حافظه شما کپی شد.", 'success');
    };

    // --- toggle favorite ---
    const favoriteHandler = async () => {
        if (!user) {
            notify("لطفا ابتدا وارد حساب کاربری خود شوید.", 'error');
            return;
        }

        setLoading(true);
        const mutationAdd = `
            mutation($productId: ID!) { addToFavorite(productId: $productId) { _id } }
        `;
        const mutationRemove = `
            mutation($productId: ID!) { removeFromFavorite(productId: $productId) { _id } }
        `;
        const mutation = isFavorite ? mutationRemove : mutationAdd;
        const data = await fetcher(mutation, { productId: id });

        if (data) {
            setIsFavorite(!isFavorite);
            notify(
                isFavorite ? "این محصول از علاقه‌مندی‌های شما حذف شد." : "این محصول به لیست علاقه‌مندی‌های شما اضافه شد.",
                'success'
            );
        } else {
            notify("خطا در بروزرسانی علاقه‌مندی‌ها", 'error');
        }
        setLoading(false);
    };

    // --- toggle notif ---
    const notifHandler = async () => {
        if (!user) {
            notify("لطفا ابتدا وارد حساب کاربری خود شوید.", 'error');
            return;
        }
        setLoading(true);
        const mutation = `
            mutation($id: ID!, $input: UserInput!) { updateUser(id: $id, input: $input) { _id status } }
        `;
        const newStatus = notifActive ? "user" : "notifUser";
        const data = await fetcher(mutation, { id: user?._id, input: { status: newStatus, name: user?.name, phone: user?.phone } });
        if (data?.updateUser) {
            setNotifActive(!notifActive);
            notify(
                notifActive ? "اعلان محصولات برای شما غیرفعال شد." : "اعلان محصولات برای شما فعال شد.",
                'success'
            );
        } else {
            notify("خطا در بروزرسانی اعلان", 'error');
        }
        setLoading(false);
    };

    return (
        <div className="absolute top-10 right-1 flex flex-col gap-2 sm:gap-4 sm:right-2 sm:top-12 z-20">
            {/* علاقه‌مندی */}
            <div className="hover:[&>p]:block relative group">
                <IconButton
                    onClick={favoriteHandler}
                    aria-label="افزودن به علاقه‌مندی‌ها"
                    color={isFavorite ? 'error' : 'default'}
                    disabled={loading}
                >
                    <FavoriteRoundedIcon color={isFavorite ? 'error' : 'inherit'} />
                </IconButton>
                <p className="absolute top-1/2 -translate-y-1/2 right-12 hidden group-hover:block text-nowrap py-1 px-2 text-white bg-black shadow-md rounded-lg">
                    {isFavorite ? "حذف از علاقه‌مندی‌ها" : "اضافه به علاقه‌مندی‌ها"}
                </p>
            </div>
            {/* اعلان */}
            <div className="hover:[&>p]:block relative group">
                <IconButton
                    onClick={notifHandler}
                    aria-label="اطلاع‌رسانی محصول"
                    color={notifActive ? 'primary' : 'default'}
                    disabled={loading}
                >
                    <NotificationsActiveRoundedIcon color={notifActive ? 'primary' : 'inherit'} />
                </IconButton>
                <p className="absolute top-1/2 -translate-y-1/2 right-12 hidden group-hover:block text-nowrap py-1 px-2 text-white bg-black shadow-md rounded-lg">
                    {notifActive ? "غیرفعال‌سازی اعلان" : "اطلاع‌رسانی شگفت‌انگیز‌ها"}
                </p>
            </div>
            {/* اشتراک‌گذاری */}
            <div className="hover:[&>p]:block relative group">
                <IconButton
                    onClick={shareHandler}
                    aria-label="اشتراک‌گذاری محصول"
                >
                    <ShareRoundedIcon />
                </IconButton>
                <p className="absolute top-1/2 -translate-y-1/2 right-12 hidden group-hover:block text-nowrap py-1 px-2 text-white bg-black shadow-md rounded-lg">
                    اشتراک‌گذاری محصول
                </p>
            </div>
            {/* دیدگاه */}
            <div className="hover:[&>p]:block relative group">
                <IconButton
                    onClick={commentScrollHandler}
                    aria-label="ثبت دیدگاه"
                >
                    <CommentRoundedIcon />
                </IconButton>
                <p className="absolute top-1/2 -translate-y-1/2 right-12 hidden group-hover:block text-nowrap py-1 px-2 text-white bg-black shadow-md rounded-lg">
                    ثبت دیدگاه
                </p>
            </div>
        </div>
    );
}

export default ImgBtn;