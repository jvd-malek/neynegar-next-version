import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import CircleNotificationsRoundedIcon from '@mui/icons-material/CircleNotificationsRounded';
import CommentInput from '@/lib/Components/Comment/CommentInput';
import { userType } from '@/lib/Types/user';
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';
import { paginatedTicketsType, ticketType } from '@/lib/Types/ticket';
import moment from "jalali-moment"
import Box from '@/lib/Components/ProductBoxes/Box';
import Link from 'next/link';
import { paginatedCommentsType } from '@/lib/Types/comment';
import { paginatedOrdersType } from '@/lib/Types/order';
import OrderListBox from '@/lib/Components/OrderListBox';
import ReadingListBox from '@/lib/Components/ReadingListBox';
import TxtInputs from './TxtInputs';
import CommentListBox from '@/lib/Components/Account/CommentListBox';
import TicketListBox from '@/lib/Components/Account/TicketListBox';
import CourseListBox from '@/lib/Components/Account/CourseListBox';

type AccountChildType = {
    type: string,
    user: userType,
    comments: paginatedCommentsType,
    tickets: paginatedTicketsType,
    orders: paginatedOrdersType
}


function AccountChild({ type, user, orders, comments, tickets }: AccountChildType) {
    const discounts = user?.discount || undefined

    return (
        <>

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

                    <div className="space-y-16">
                        <section>
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3">
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
                        </section>

                        <ReadingListBox readingList={user.readingList} />

                        <section>
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3">
                                <p className=" text-lg">
                                    دوره‌های من
                                </p>
                                <Link
                                    href='?activeLink=دوره‌های من'
                                    className="flex items-center gap-x-1.5 cursor-pointer">
                                    مشاهده همه
                                    <span className="text-slate-700">
                                        <KeyboardBackspaceRoundedIcon />
                                    </span>
                                </Link>
                            </div>

                            <div className="mt-10 w-full">
                                <CourseListBox courseProgress={user.courseProgress} demo />
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3">
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
                        </section>

                        <section>
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3">
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
                                <OrderListBox orders={orders} user={user} demo />
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3">
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
                            <div className="mt-10 w-full">
                                <CommentListBox comments={comments} user={user} demo />
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-center border-solid border-b border-slate-400 pb-3">
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
                            <div className="mt-10 w-full">
                                <TicketListBox tickets={tickets} user={user} demo />
                            </div>
                        </section>

                    </div>

                </div>
            }

            {
                type === 'سفارشات' &&
                <div className="mt-24 w-full">
                    <OrderListBox orders={orders} user={user} />
                </div>
            }

            {
                type === 'جزییات حساب' &&
                <div className='mt-24 w-full'>
                    <TxtInputs data={{ user }} account />
                </div>
            }

            {
                type === "دوره‌های من" &&
                <div className="mt-24 w-full">
                    <CourseListBox courseProgress={user.courseProgress} />
                </div>
            }

            {
                type === 'نظرات' &&
                <div className="mt-24 w-full">
                    <CommentListBox comments={comments} user={user} />
                </div>
            }

            {
                type === 'پرسش و پاسخ' &&
                <div className="mt-24 w-full">
                    <CommentInput ticket={true} />
                    <TicketListBox tickets={tickets} user={user} />
                </div>
            }
        </>
    );
}

export default AccountChild;