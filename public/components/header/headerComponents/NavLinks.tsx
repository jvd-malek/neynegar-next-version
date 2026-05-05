// react and next
import Link from "next/link";
import { usePathname } from "next/navigation";

// icons
import LocalLibraryRoundedIcon from '@mui/icons-material/LocalLibraryRounded';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CircleNotificationsRoundedIcon from '@mui/icons-material/CircleNotificationsRounded';
import KeyboardArrowLeftRounded from "@mui/icons-material/KeyboardArrowLeftRounded";

// mui components
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

// utils
import { swrHandler } from "@/public/utils/swrFetcher";

// queries and types
import { linksType } from "@/public/types/links";
import { userType } from "@/public/types/user";
import { COUNT_ORDER_BY_STATUS, COUNT_TICKET_BY_STATUS } from "@/public/graphql/headerQueries";
import { GET_LINKS } from "@/public/graphql/linkQueries";

type NavLinksProps = {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    user: userType | undefined;
    unreadAlerts: number;
}

const accountLinks = [
    { id: 1, txt: 'خانه' },
    { id: 2, txt: 'سفارشات' },
    { id: 3, txt: 'پروفایل' },
    { id: 4, txt: 'نظرات' },
    { id: 5, txt: 'پرسش و پاسخ' },
    { id: 6, txt: 'اعلان‌ها' }
];

const CMSLinks = [
    { id: 1, txt: 'محصولات' },
    { id: 2, txt: 'ثبت محصول' },
    { id: 15, txt: 'ثبت پکیج' },
    { id: 3, txt: 'مقالات' },
    { id: 4, txt: 'ثبت مقاله' },
    { id: 5, txt: 'تیکت‌ها' },
    { id: 6, txt: 'سفارشات' },
    { id: 7, txt: 'کاربران' },
    { id: 8, txt: 'ثبت نویسنده' },
    { id: 9, txt: 'تخفیف‌ها' },
    { id: 10, txt: 'هزینه ارسال' },
    { id: 11, txt: "دوره‌ها" },
    { id: 12, txt: "کسری" },
    { id: 13, txt: "سفارشات آزاد" },
    { id: 14, txt: 'میزان فروش' }
];

const NavLinks = ({ isOpen, setOpen, user, unreadAlerts }: NavLinksProps) => {

    const path = usePathname();
    const isAdminOROwner = user?.status.includes("owner") || user?.status.includes("admin")
    const isAccountORCms = path.includes('account') || isAdminOROwner

    const { data: tickets } = swrHandler(COUNT_TICKET_BY_STATUS);
    const { data: orders } = swrHandler(COUNT_ORDER_BY_STATUS);
    const { data: linksData } = swrHandler(GET_LINKS);
    const links: linksType[] = linksData?.links || [];


    return (
        <SwipeableDrawer
            anchor="right"
            open={isOpen}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            ModalProps={{ keepMounted: false }}
            disableSwipeToOpen={false}
            PaperProps={{
                className: "w-72 font-bold text-lg",
                dir: "rtl",
            }}
            role="menu"
        >
            <div className="flex gap-5 flex-col w-full p-6 transition-all duration-200">

                <div className="border-b-2 pb-2 border-mist-300">
                    {user?.name ?
                        <div className="flex justify-between items-center gap-2">
                            <div className="max-w-45">
                                <p className="text-nowrap line-clamp-1">{user.name}</p>
                                <p className="text-sm text-mist-600 font-semibold">{user.phone}</p>
                            </div>
                            <Link
                                href={"/account?activeLink=اعلان‌ها"}
                                className="text-mist-600 text-3xl relative"
                            >
                                <CircleNotificationsRoundedIcon fontSize='inherit' />
                                {unreadAlerts > 0 &&
                                    <span className="absolute left-0 bg-red-600 text-xs rounded-full w-4 h-4 -top-1 flex justify-center items-center text-white">
                                        {unreadAlerts.toLocaleString('fa-IR')}
                                    </span>
                                }
                            </Link>
                        </div>
                        :
                        <p className="font-bold text-2xl text-cyan-700">
                            نی‌نگار
                            <span className="font-bold text-sm text-mist-600">هنر در دستان تو</span>
                        </p>
                    }
                </div>

                <ul className="flex justify-center items-center gap-4 mb-2">

                    <li className="py-2.5 px-3 hover:bg-slate-300 rounded-xl bg-mist-200 relative">
                        <Link
                            href={'/basket'}
                            onClick={() => setOpen(false)}
                        >
                            <LocalMallRoundedIcon />

                            {user && user.bascket.length > 0 && (
                                <p className="absolute text-white bg-red-500 rounded-full top-1 left-1 w-4 h-4 text-sm text-center -rotate-12">{user.bascket.length.toLocaleString('fa-IR')}</p>
                            )}
                        </Link>
                    </li>
                    <li className="py-2.5 px-3 hover:bg-slate-300 rounded-xl bg-mist-200">
                        <Link
                            href={user ? "/account" : "/login"}
                            onClick={() => setOpen(false)}
                        >
                            <PersonRoundedIcon />
                        </Link>
                    </li>
                    <li className="py-2.5 px-3 hover:bg-slate-300 rounded-xl bg-mist-200">
                        <Link
                            href={user ? "/account#course-list" : "/#section-courses"}
                            onClick={() => setOpen(false)}
                        >
                            <LocalLibraryRoundedIcon />
                        </Link>
                    </li>
                    <li className="py-2.5 px-3 hover:bg-slate-300 rounded-xl bg-mist-200">
                        <Link
                            href="/"
                            onClick={() => setOpen(false)}
                        >
                            <HomeRoundedIcon />
                        </Link>
                    </li>
                </ul>

                {isAccountORCms ?
                    (isAdminOROwner ? CMSLinks : accountLinks).map(link => (
                        <Link
                            key={link.id}
                            href={isAdminOROwner ? `/cms?activeLink=${link.txt}` : `/account?activeLink=${link.txt}`}
                            className={`flex justify-between items-center gap-1 py-2 px-4 transition-all rounded-xl relative bg-mist-200 hover:bg-slate-300`}

                        >
                            <span>
                                {link.txt}
                            </span>

                            <KeyboardArrowLeftRounded />
                            {link.txt == "تیکت‌ها" && tickets?.ticketsByStatus.length > 0 &&
                                <span className="absolute left-0 bg-red-600 text-xs rounded-full w-4 h-4 -top-1 flex justify-center items-center text-white">{tickets?.ticketsByStatus?.length}</span>
                            }
                            {link.txt == "سفارشات" && orders?.ordersByStatus.length > 0 &&
                                <span className="absolute left-0 bg-red-600 text-xs rounded-full w-4 h-4 -top-1 flex justify-center items-center text-white">{orders?.ordersByStatus?.length}</span>
                            }
                        </Link>
                    ))
                    :
                    links?.map((link) => (
                        <ul key={link._id} className="flex flex-col justify-center items-center gap-2">
                            <Link href={`/${link.path}`} key={link._id} className="w-full py-2 px-4 text-center transition-all rounded-xl relative bg-black hover:bg-mist-700 text-white">
                                {link.txt}
                            </Link>
                            {link.subLinks.length > 0 && link.subLinks.map((l, i) => (
                                <Link href={`/${l.path}`} key={link._id + i} className="flex w-[90%] justify-between items-center gap-1 py-2 px-4 transition-all rounded-xl relative bg-mist-200 hover:bg-slate-300">
                                    {l.link}
                                    <KeyboardArrowLeftRounded />
                                </Link>
                            ))}

                        </ul>
                    ))
                }
            </div>
        </SwipeableDrawer>
    );
}

export default NavLinks;