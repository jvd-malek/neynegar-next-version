import Link from "next/link";
import IconButton from '@mui/material/IconButton';
import AccountCircleTwoToneIcon from '@mui/icons-material/AccountCircleTwoTone';
import LocalMallOutlined from '@mui/icons-material/LocalMallOutlined';
import { linksType } from "../../../Types/links";
import { userType } from "../../../Types/user";
import { getCookie } from "cookies-next";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import { usePathname } from "next/navigation";

type NavbarProps = {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    links: linksType[];
    user: userType | undefined;
    setFocusSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar = ({ isOpen, setOpen, links, user, setFocusSearch }: NavbarProps) => {
    const basket = getCookie('basket')
    const path = usePathname()
    
    const handleClick = () => {
        setOpen(!isOpen);
    };

    return (
        <>
            <div className={`py-2 sm:container w-[93vw] lg:py-3 px-4 text-xl fixed lg:top-2 top-3 transition-all -translate-x-1/2 left-1/2 rounded-xl z-50 bg-glassh h-fit`}>
                <div className="flex justify-between items-center">
                    <div onClick={() => { setOpen(true); setFocusSearch(true) }} className='text-gray-600 w-full lg:hidden'>
                        جستجو ...
                    </div>
                    <div className='flex gap-2 items-center lg:hidden'>
                        <Link href={'/basket'} className="relative">
                            <LocalMallRoundedIcon fontSize="small" />
                            {((user && user.bascket.length > 0) || (basket && JSON.parse(basket as string).length > 0)) && (
                                <p className="absolute text-white bg-red-500 rounded-full top-0 -left-1 w-3 h-3 text-xs text-center -rotate-12">
                                    {user && user.bascket.length.toLocaleString('fa-IR')}
                                    {basket && JSON.parse(basket as string).length.toLocaleString('fa-IR')}
                                </p>
                            )}
                        </Link>
                        <span onClick={() => setOpen(true)}>
                            <MoreVertIcon />
                        </span>
                    </div>
                    <div className="items-center gap-10 hidden lg:flex">
                        <div className=" text-4xl font-[Soofee] ml-10 relative">
                            <Link href={'/'}>
                                <span className="">نی‌</span>
                                <span className="absolute -left-12">نگار</span>
                            </Link>
                        </div>
                        <ul className="flex gap-8 items-center">
                            {links?.map(item => (
                                <li key={item._id} className="text-shadow cursor-pointer group relative">
                                    <Link href={`/${item.path}`} prefetch>{item.txt}</Link>
                                    {item.subLinks?.length > 0 &&
                                        <div className={`hidden group-hover:block absolute z-[9999]`}>
                                            <div className={`bg-white/90 p-2 text-black flex flex-col scrollable-section gap-1 mt-8 max-h-60 overflow-y-auto border border-gray-300 rounded-md shadow-lg`}>
                                                {item.subLinks.map((l, i) => (
                                                    <Link href={`/${l.path}`} className="text-shadow whitespace-nowrap px-2 py-1 hover:bg-gray-200/90 cursor-pointer rounded-md" key={i} prefetch>
                                                        {l.link}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative h-full text-lg xl:text-lg hidden lg:flex">
                        <div className="flex flex-row-reverse gap-3 justify-center items-center">
                            {user && user.name.length > 0 ? (
                                <Link href={(user.status == "owner" || user.status == "admin") ? '/cms' : "/account"} className="h-full hidden w-fit py-1.5 px-4 lg:flex justify-center items-center bg-black hover:bg-slate-900 text-white rounded-lg line-clamp-1 text-lg whitespace-nowrap">
                                    {user?.name.trim().split(" ").slice(0, 3).join(" ")}
                                </Link>
                            ) : (
                                <Link href={'/login'} prefetch className="h-full w-fit gap-4  xl:w-28 hidden lg:flex items-center justify-center py-1.5 bg-black hover:bg-gray-900 text-white rounded-lg px-5">
                                    ورود
                                    <AccountCircleTwoToneIcon />
                                </Link>
                            )}
                            <Link href={'/basket'} className="relative lg:bg-black rounded-lg lg:hover:bg-slate-900">
                                <div className=" lg:hidden">
                                    <IconButton sx={{ color: "black" }}>
                                        <LocalMallOutlined fontSize="medium" />
                                    </IconButton>
                                </div>
                                <div className="hidden lg:block">
                                    <IconButton sx={{ color: "white" }}>
                                        <LocalMallOutlined />
                                    </IconButton>
                                </div>
                                {((user && user.bascket.length > 0) || (basket && JSON.parse(basket as string).length > 0)) && (
                                    <p className="absolute text-white bg-red-500 rounded-full top-0 left-1 w-4 h-4 text-sm text-center -rotate-12">
                                        {user && user.bascket.length.toLocaleString('fa-IR')}
                                        {basket && JSON.parse(basket as string).length.toLocaleString('fa-IR')}
                                    </p>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}

export default Navbar;