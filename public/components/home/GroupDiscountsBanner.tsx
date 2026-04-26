"use client";

// next and react
import { useMemo } from 'react';
import Link from 'next/link';

// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// components
import DiscountTimer from '@/public/components/product-boxes/DiscountTimer';

// types and icons
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';
import { GroupDiscountsType } from '@/public/types/product';


export default function GroupDiscountsBanner({ groupDiscounts }: { groupDiscounts: GroupDiscountsType[] }) {
    if (!groupDiscounts || groupDiscounts.length === 0) return null;

    // Memoize autoplay config for better performance
    const autoplayConfig = useMemo(() => ({
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    }), []);

    return (
        <Swiper
            direction="vertical"
            slidesPerView={1}
            spaceBetween={16}
            autoplay={autoplayConfig}
            modules={[Autoplay]}
            className="mb-12 md:h-17 h-26 bg-linear-to-l from-red-100 to-red-200 border border-red-200 rounded-lg shadow"
        >
            {groupDiscounts.map((discount: GroupDiscountsType) => (
                discount.isActive &&
                <SwiperSlide key={discount._id}>
                    <div className="w-full h-full p-4 mx-auto flex md:flex-row flex-col justify-between items-center">
                        <div className="md:text-lg font-bold text-red-700 text-center line-clamp-1">{discount.title}</div>
                        <div className="flex justify-center items-center gap-10">
                            <DiscountTimer endDate={Number(discount.endDate)} page />
                            <Link
                                href={{
                                    pathname: `/category/${discount.majorCat}/${discount?.minorCat}`,
                                    query: discount.brand ? { cat: discount.brand } : undefined
                                }}
                                className="flex items-center gap-1 text-red-700 hover:text-red-900 transition-colors duration-200 group"
                            >
                                <span className="text-sm font-medium">مشاهده</span>
                                <KeyboardBackspaceRoundedIcon
                                    className=" text-lg transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse"
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
} 