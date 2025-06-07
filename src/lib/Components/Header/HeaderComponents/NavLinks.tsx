import { memo, useCallback } from "react";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import IconButton from '@mui/material/IconButton';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Link from "next/link";
import { useState } from "react";
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { linksType } from "../../../Types/links";
import { userType } from '../../../Types/user';
import { redirect } from 'next/navigation'
import { animateScroll } from "react-scroll";
type NavLinksProps = {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    links: linksType[];
    user: userType | undefined;
}

const NavLinks = memo(({ isOpen, setOpen, links, user }: NavLinksProps) => {
    const [search, setSearch] = useState('');

    const scrollTop = useCallback(() => {
        animateScroll.scrollToTop( {
            duration: 300,
            smooth: 'easeInOutQuart'
        })
        setOpen(false);
    }, [setOpen]);

    const searchHandler = useCallback(() => {
        if (search.trim().length > 0) {
            scrollTop();
            setSearch("");
            redirect(`/category/search/${search.trim()}`);
        }
    }, [redirect, scrollTop, search]);

    return (
        <SwipeableDrawer
            anchor='bottom'
            open={isOpen}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            ModalProps={{ keepMounted: false }}
            disableSwipeToOpen={false}
            className="block lg:hidden"
        >
            <div className="h-[65vh] w-full bg-gray-200 text-center font-[Baloo]">
                <div className="relative z-10 bg-gray-200 text-white">
                    <ul className="flex gap-4 text-center flex-col lg:hidden w-full p-6 transition-all duration-200 h-full">
                        <div className="flex gap-4">
                            <li className="p-[0.08rem] rounded-xl bg-black">
                                <div className="w-full rounded-xl" onClick={searchHandler}>
                                    <IconButton sx={{ color: 'white' }} >
                                        <SearchRoundedIcon />
                                    </IconButton>
                                </div>
                            </li>
                            <li className="w-full p-[0.08rem] rounded-xl ">
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-black rounded-xl outline-none px-4 py-[0.55rem] placeholder:text-slate-300" placeholder="جستجو محصولات" />
                            </li>
                        </div>

                        <div className="mb-5 flex gap-4 transition-all">

                            <li className="p-[0.08rem] rounded-xl bg-black relative">
                                <Link href={'/basket'} onClick={scrollTop} className="w-full rounded-xl flex items-center gap-8">
                                    <IconButton sx={{ color: 'white' }}>
                                        <LocalMallRoundedIcon />
                                    </IconButton>
                                    {user && user.bascket.length > 0 && (
                                        <p className="absolute text-white bg-red-500 rounded-full top-1 left-1 w-4 h-4 text-sm text-center -rotate-12">{user.bascket.length.toLocaleString('fa-IR')}</p>
                                    )}
                                </Link>
                            </li>
                            <li className="p-[0.08rem] rounded-xl bg-black">
                                <Link href={user ? (user?.status == "owner" || user?.status == "admin" ? '/cms' : "/account") : "/login"} onClick={scrollTop} className="w-full rounded-xl flex items-center">
                                    <IconButton sx={{ color: 'white' }}>
                                        <PersonRoundedIcon />
                                    </IconButton>
                                </Link>
                            </li>
                        </div>

                        {links?.map((li) => (
                            <li key={li._id}>
                                <div className="w-full mt-5 mb-4">
                                    <Link href={`/${li.path}`} onClick={scrollTop}>
                                        <div className="w-full rounded-xl bg-black py-3 cursor-pointer font-semibold">
                                            {li.txt}
                                        </div>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {li.subLinks.length > 0 && li.subLinks.map((l, i) => (
                                        <Link href={`/${l.path}`} onClick={scrollTop} key={i + 10}>
                                            <div className="w-full whitespace-nowrap rounded-lg py-1.5 bg-dark-glassh dark:gr2dark">
                                                {l.link}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </SwipeableDrawer>
    );
});

export default NavLinks;