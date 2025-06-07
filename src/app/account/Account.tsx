import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import CircleNotificationsRoundedIcon from '@mui/icons-material/CircleNotificationsRounded';
import CommentBox from "@/lib/Components/Comment/CommentBox";
import CommentInput from '@/lib/Components/Comment/CommentInput';
import { userType } from '@/lib/Types/user';
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';
import { ticketType } from '@/lib/Types/ticket';
import moment from "jalali-moment"
import Box from '@/lib/Components/ProductBoxes/Box';
import AccountProductBox from '@/lib/Components/ProductBoxes/AccountProductBox';
import Link from 'next/link';
import TxtInputs from './TxtInputs';
import { commentType } from '@/lib/Types/comment';
import { orderType } from '@/lib/Types/order';
import { Bounce, ToastContainer } from 'react-toastify';

type AccountChildType = {
    type: string,
    user: userType,
    comments: commentType[],
    tickets: ticketType[],
    orders: orderType[]
}


function AccountChild({ type, user, orders, comments, tickets }: AccountChildType) {
    const discounts = user?.discount || undefined

    return (
        <>
            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                limit={2}
                hideProgressBar={false}
                newestOnTop
                closeOnClick={false}
                rtl={true}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
            />

            {
                type !== "خانه" &&
                <h3 className="absolute top-4 -right-2 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                    {type}
                </h3>
            }

            {
                type === 'خانه' &&

                <div className="w-full">
                    <div className="flex justify-between items-center">
                        <h2 className=" text-xl">
                            {`
                                ${user?.name} عزیز؛ خوش اومدی 🙌
                                `}
                        </h2>
                        <div className=" text-slate-500 text-6xl">
                            <CircleNotificationsRoundedIcon fontSize='inherit' />
                        </div>
                    </div>

                    <div className="">

                        <div className="">
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 mt-16 pb-3">
                                <p className=" text-lg">
                                    مورد علاقه های من
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-8 justify-center">
                                {(user && user.favorite.length > 0) ?
                                    <div className="w-full mt-10">
                                        <Box fav={user.favorite} />
                                    </div>
                                    :
                                    <p className="text-center mb-2 mt-14">
                                        هنوز محصولی به لیست مورد علاقه خود اضافه نکرده‌اید.
                                        <span><SentimentDissatisfiedTwoToneIcon /></span>
                                    </p>
                                }
                            </div>
                        </div>

                        <div className="">
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 mt-16 pb-3">
                                <p className=" text-lg">
                                    تخفیف‌های فعال من
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-8 justify-center">
                                {
                                    discounts?.length > 0 ?
                                        discounts.reverse().map((d: any) => (
                                            <div key={d.date} className={`bg-white mt-7 shadow-cs py-4 px-6 rounded-xl w-full flex justify-between items-center sm:flex-row flex-col`}>
                                                <p className="">{`کد تخفیف: ${d.code}`}</p>
                                                <p className="">{`تخفیف: ${d.discount.toLocaleString("FA-IR")}`}</p>
                                                {d.date < Date.now() ?
                                                    <p className="">منقضی شد</p> :
                                                    <p className="">{`تاریخ انقضا: ${moment(d.date).locale('fa').format('YYYY/MM/DD')}`}</p>
                                                }
                                            </div>
                                        )) :
                                        <p className="bg-white mt-7 shadow-cs py-4 px-6 rounded-xl w-full flex justify-between items-center sm:flex-row flex-col">
                                            تخفیفی برای شما فعال نشده است.
                                        </p>
                                }
                            </div>
                        </div>

                        <div className="mt-16">
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 mt-16 pb-3">
                                <p className=" text-lg">
                                    سفارشات اخیر
                                </p>
                                <Link
                                    href='?activeLink=سفارشات'
                                    className="flex items-center gap-x-1.5 cursor-pointer">
                                    مشاهده همه
                                    <span className="text-slate-700">
                                        <KeyboardBackspaceRoundedIcon />
                                    </span>
                                </Link>
                            </div>
                            <div className="mt-10 w-full">
                                <AccountProductBox orders={orders} demo user={user} />
                            </div>
                        </div>

                        <div className="">
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 mt-16 pb-3">
                                <p className=" text-lg">
                                    نظرات اخیر
                                </p>
                                <Link
                                    href='?activeLink=نظرات'
                                    className="flex items-center gap-x-1.5 cursor-pointer">
                                    مشاهده همه
                                    <span className="text-slate-700">
                                        <KeyboardBackspaceRoundedIcon />
                                    </span>
                                </Link>
                            </div>
                            {
                                comments?.length > 0 ?
                                    comments.reverse().slice(0, 2).map((c: any) => (
                                        <div className="" key={c._id}>
                                            <CommentBox account={true} {...c} />
                                        </div>
                                    )) :
                                    <p className="bg-white mt-7 shadow-cs py-4 px-6 rounded-xl w-full flex justify-between items-center sm:flex-row flex-col">هنوز نظری به اشتراک نگذاشته‌اید.</p>
                            }
                        </div>

                        <div className="">
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 mt-16 pb-3">
                                <p className=" text-lg">
                                    سوالات اخیر
                                </p>
                                <Link
                                    href='?activeLink=تیکت‌ها'
                                    className="flex items-center gap-x-1.5 cursor-pointer">
                                    مشاهده همه
                                    <span className="text-slate-700">
                                        <KeyboardBackspaceRoundedIcon />
                                    </span>
                                </Link>
                            </div>
                            {
                                tickets && tickets.length > 0 ?
                                    tickets.reverse().slice(0, 2).map((c: ticketType) => (
                                        <div className="" key={c._id}>
                                            <CommentBox ticket={true} {...c} />
                                        </div>
                                    )) :
                                    <p className="bg-white mt-7 shadow-cs py-4 px-6 rounded-xl w-full flex justify-between items-center sm:flex-row flex-col">هنوز سوالی ثبت نکرده‌اید.</p>
                            }
                        </div>
                    </div>

                </div>
            }

            {
                type === 'سفارشات' &&
                <div className="mt-24 pb-8">
                    <AccountProductBox orders={orders} user={user} />
                </div>
            }

            {
                type === 'جزییات حساب' &&
                <div className='mt-24 w-full'>
                    <TxtInputs data={{ user }} account />
                </div>
            }

            {
                type === 'نظرات' &&
                <div className="mt-24">
                    {
                        comments?.length > 0 ?
                            comments.reverse().map((c: any) => (
                                <div className="" key={c._id}>
                                    <CommentBox account={true} {...c} />
                                </div>
                            )) :
                            <p className="mt-7 bg-white shadow-cs py-4 px-6 rounded-xl w-full">هنوز نظری به اشتراک نگذاشته‌اید.</p>
                    }
                </div>
            }

            {
                type === 'پرسش و پاسخ' &&
                <div className="mt-24">
                    <CommentInput ticket={true} />
                    <p className=" text-lg border-solid border-b border-slate-400 my-10 pb-3">
                        سوالات شما
                    </p>
                    {
                        tickets && tickets.length > 0 ?
                            tickets.reverse().map((c: ticketType) => (
                                <div className="" key={c._id}>
                                    <CommentBox ticket={true} {...c} />
                                </div>
                            )) :
                            <p className="mt-7 bg-white shadow-cs py-4 px-6 rounded-xl w-full">هنوز سوالی ثبت نکرده‌اید.</p>
                    }
                </div>
            }
        </>
    );
}

export default AccountChild;