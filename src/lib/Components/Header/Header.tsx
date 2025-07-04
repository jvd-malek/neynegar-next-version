"use client"
import { useState, useEffect } from 'react';
import Navbar from "./HeaderComponents/Navbar";
import NavLinks from "./HeaderComponents/NavLinks";
import { usePathname } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { getCookie, deleteCookie } from 'cookies-next';
import SearchBox from './HeaderComponents/SearchBox';
import { linksType } from '@/lib/Types/links';
import { fetcher } from '@/lib/fetcher';

function Header() {
  const [isOpen, setOpen] = useState(false);
  const loc = usePathname();
  const jwt = getCookie('jwt');
  const basket = getCookie('basket');

  // Fetch لینک‌های منو
  const { data: linksData } = useSWR(
    `query {
      links {
        _id
        txt
        path
        sort
        subLinks {
          link
          path
          brand
        }
      }
    }`,
    (query) => fetcher(query, {}),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true
    }
  );

  const links: linksType[] = linksData?.links || [];
  
  // مدیریت وضعیت کاربر
  const { data: userData, error: userError } = useSWR(
    `query {
      userByToken {
        _id
        name
        phone
        status
        bascket {
          productId {
            _id
          }
          count
        }
      }
    }`,
    (query) => fetcher(query, {}),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true
    }
  );

  // ارسال سبد خرید به سرور با useSWRMutation
  const sendBasket = async () => {
    if (!basket || !jwt) return;

    await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': jwt as string
      },
      body: JSON.stringify({
        query: `mutation {
          updateUserBasket(basket: ${JSON.stringify(JSON.parse(basket as string))}) {
            _id
            basket {
              product
              count
            }
          }
        }`
      })
    });
    deleteCookie('basket');
    mutate('user-data'); // تازه‌سازی داده‌های کاربر
  };

  // اثرات جانبی
  // useEffect(() => {
  //   if (!userData?.userByToken || userError) {
  //     deleteCookie('jwt');
  //   }

  //   if (basket && jwt) {
  //     sendBasket();
  //   }
  // }, [userData, userError, basket, jwt]);

  if (loc.includes('login')) {
    return null;
  }

  return (
    <div className="font-[Baloo]">
      <Navbar
        isOpen={isOpen}
        setOpen={setOpen}
        links={links}
        user={userData?.userByToken}
      />
      <NavLinks
        isOpen={isOpen}
        setOpen={setOpen}
        links={links}
        user={userData?.userByToken}
      />
      <SearchBox links={links} />
    </div>
  );
}

export default Header;