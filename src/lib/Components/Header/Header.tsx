"use client"
import { useState } from 'react';
import Navbar from "./HeaderComponents/Navbar";
import NavLinks from "./HeaderComponents/NavLinks";
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import SearchBox from './HeaderComponents/SearchBox';
import { linksType } from '@/lib/Types/links';
import { fetcher } from '@/lib/fetcher';

function Header() {
  const [isOpen, setOpen] = useState(false);
  const loc = usePathname();

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
    (query) => fetcher(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true
    }
  );

  const links: linksType[] = linksData?.links || [];
  
  const query = `query {
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
    }`
  // مدیریت وضعیت کاربر
  const { data: userData, error: userError } = useSWR(
    ["userByToken"]
    ,
    () => fetcher(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      keepPreviousData: true
    }
  );

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