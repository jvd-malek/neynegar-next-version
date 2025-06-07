"use client"
import { Pagination, Stack } from "@mui/material";
import { animateScroll } from "react-scroll";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

type PaginationBoxType = {
  basket?: boolean;
  count: number;
  currentPage: number;
};

export default function PaginationBox({ 
  basket = false, 
  count, 
  currentPage 
}: PaginationBoxType) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handlePageChange = useCallback((_: unknown, value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', value.toString());
    
    // اسکرول به موقعیت مورد نظر
    animateScroll.scrollTo(0, {
      duration: 300,
      smooth: 'easeInOutQuart'
    });
    
    // آپدیت URL بدون ریلود صفحه
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  return (
    <div className={`p-1 transition-all bg-gray-100 ${basket ? 'mt-4' : 'mt-20'} rounded-md w-fit mx-auto`} dir="ltr">
      <Stack spacing={2}>
        <Pagination
          count={count}
          variant="outlined"
          shape="rounded"
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#4b5563',
              '&.Mui-selected': {
                backgroundColor: '#4f46e5',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4338ca'
                }
              }
            }
          }}
        />
      </Stack>
    </div>
  );
}