"use client"
import { IconButton } from '@mui/material';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import { Bounce, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';

function ImgBtn({ id }: { id: string }) {
    const jwt = getCookie('jwt');

    const router = useRouter();

    const updateUser = async (body: object) => {
        if (!jwt) return;

        try {
            const response = await fetch(`https://api.neynegar1.ir/users/update-user`, {
                method: "PUT",
                headers: {
                    'authorization': jwt as string,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (!data.state) {
                console.error(data.msg);
                notify(data.msg, false);
            }
            return data;
        } catch (error) {
            console.error("Error updating user:", error);
            notify("خطا در بروزرسانی اطلاعات کاربر", false);
        }
    };

    const notify = (txt: string, status: boolean) => {
        toast[status ? 'success' : 'error'](txt, {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    };

    const commentScrollHandler = () => {
        router.push(`#commentScroll`);
    };

    const shareHandler = () => {
        navigator.clipboard.writeText(`https://neynegar1.ir/product/${id}`);
        notify("لینک این محصول در حافظه شما کپی شد.", true);
    };

    const favoriteHandler = async () => {
        if (jwt) {
            await updateUser({
                favorite: [{ productId: id }]
            });
            notify("این محصول به لیست علاقه‌مندی‌های شما اضافه شد.", true);
        } else {
            notify("لطفا ابتدا وارد حساب کاربری خود شوید.", false);
        }
    };

    const notifHandler = async () => {
        if (jwt) {
            await updateUser({ status: "notifUser" });
            notify("اعلان محصولات برای شما فعال شد.", true);
        } else {
            notify("لطفا ابتدا وارد حساب کاربری خود شوید.", false);
        }
    };

    return (
        <div className="absolute top-10 right-1 flex flex-col gap-2">
            <div className="hover:[&>p]:block relative group">
                <IconButton
                    onClick={favoriteHandler}
                    aria-label="افزودن به علاقه‌مندی‌ها"
                >
                    <FavoriteRoundedIcon />
                </IconButton>
                <p className="absolute top-1/2 -translate-y-1/2 right-12 hidden group-hover:block text-nowrap py-1 px-2 text-white bg-black shadow-md rounded-lg">
                    اضافه به علاقه‌مندی‌ها
                </p>
            </div>
            <div className="hover:[&>p]:block relative group">
                <IconButton
                    onClick={notifHandler}
                    aria-label="اطلاع‌رسانی محصول"
                >
                    <NotificationsActiveRoundedIcon />
                </IconButton>
                <p className="absolute top-1/2 -translate-y-1/2 right-12 hidden group-hover:block text-nowrap py-1 px-2 text-white bg-black shadow-md rounded-lg">
                    اطلاع‌رسانی شگفت‌انگیز‌ها
                </p>
            </div>
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