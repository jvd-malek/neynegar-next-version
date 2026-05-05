"use client"

// next and swr
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// mui components
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import AppBar from "@mui/material/AppBar";

// mui icons
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MoreVertIcon from '@mui/icons-material/MoreVert';

// components and images
import Logo from "@/public/images/Logo-removebg.webp";
import NavLinks from "@/public/components/header/headerComponents/NavLinks";
import SearchBar from "@/public/components/header/headerComponents/SearchBar";

// types and utils
import { GET_USER_BY_TOKEN, GET_UNREAD_ALERT_COUNT } from "@/public/graphql/userQueries";
import { getCookie } from "cookies-next";
import useSWR from "swr";
import { fetcher } from "@/public/utils/fetcher";

const Header = () => {

  const basket = getCookie('basket')
  const [open, setOpen] = useState(false);

  const toggle = (value: boolean) => () => {
    setOpen(value);
  };

  const { data: userData } = useSWR(
    ["userByToken"],
    () => fetcher(GET_USER_BY_TOKEN),
  );

  const { data: alertData } = useSWR(
    userData?.userByToken ? ["unreadAlertCount"] : null,
    () => fetcher(GET_UNREAD_ALERT_COUNT),
  );
  const unreadAlerts = alertData?.unreadAlertCount || 0;


  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      dir="rtl"
      className="pt-2 container mx-auto px-3"
    >
      <Toolbar className="flex justify-between backdrop-blur-xs bg-white/60 shadow border border-mist-200 rounded-xl"
      >

        {/* Right group: menu + search + basket + auth */}
        <div className="flex items-center gap-2">

          <IconButton
            onClick={toggle(true)}
            aria-label="باز کردن منو"
          >
            <MoreVertIcon className="text-black" />
          </IconButton>

          <NavLinks
            isOpen={open}
            setOpen={setOpen}
            user={userData?.userByToken}
            unreadAlerts={unreadAlerts}
          />

          <div className="hidden md:block min-w-65 lg:min-w-64">
            <SearchBar />
          </div>

          <div className="md:hidden">
            <SearchBar compact />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/basket"
              className="relative"
            >
              <IconButton>
                <ShoppingCartOutlinedIcon fontSize="small" className="text-black" />
              </IconButton>
              {((userData?.userByToken.bascket.length > 0) || (basket && JSON.parse(basket as string).length > 0)) && (
                <p className="absolute text-white bg-red-500 rounded-full top-0 left-1 w-4 h-4 text-sm text-center -rotate-12">
                  {userData?.userByToken.bascket.length.toLocaleString('fa-IR')}
                  {basket && JSON.parse(basket as string).length.toLocaleString('fa-IR')}
                </p>
              )}
            </Link>

            {userData ? (
              <Link
                href="/account"
              >
                <IconButton>
                  <AccountCircleOutlinedIcon fontSize="small" className="text-black" />
                </IconButton>
              </Link>
            ) : (
              <Link
                href="/login"
              >
                <IconButton>
                  <LoginOutlinedIcon fontSize="small" className="text-black" />
                </IconButton>
              </Link>
            )}
          </div>
        </div>

        {/* left group: logo */}
        <Link href="/">
          <Image src={Logo} alt="لوگو نی‌نگار" loading="eager" quality={75} width={50} height={50} />
        </Link>

      </Toolbar>
    </AppBar>
  );
}

export default Header;