"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import DiscountTimer from '@/lib/Components/ProductBoxes/DiscountTimer';
import Link from 'next/link';
import KeyboardBackspaceRoundedIcon from '@mui/icons-material/KeyboardBackspaceRounded';

export default function GroupDiscountsBanner({ groupDiscounts }: { groupDiscounts: any[] }) {
    if (!groupDiscounts || groupDiscounts.length === 0) return null;

    return (
        <Swiper
            direction="vertical"
            slidesPerView={1}
            spaceBetween={16}
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            modules={[Autoplay]}
            className="w-full mb-2 mt-4 md:h-17 h-36 bg-gradient-to-l from-red-100 to-red-300 border border-red-300 rounded-xl shadow"
        >
            {groupDiscounts.map((gd: any) => (
                <SwiperSlide key={gd._id}>
                    <div className="w-full h-full p-4 mx-auto flex md:flex-row flex-col justify-between items-center gap-4">
                        <div className="md:text-lg font-bold text-red-700 text-center mb-2 line-clamp-2">{gd.title}</div>
                        <div className="flex justify-center items-center gap-10">
                            <DiscountTimer endDate={Number(gd.endDate)} discount />
                            <Link
                                href={{
                                    pathname: `/category/${gd.majorCat}/${gd?.minorCat}`,
                                    query: gd.brand ? { cat: gd.brand } : undefined
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