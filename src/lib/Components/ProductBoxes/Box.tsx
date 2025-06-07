"use client"
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { Autoplay, Pagination } from 'swiper/modules';
import ProductBox from './ProductBox';
import { productCoverType, productSingleType } from '../../Types/product';
import useResizeObserver from "@/lib/CustomeHook/ResizeObserver"; // هوک ResizeObserver
import { useRef } from 'react';

type BoxType = {
    books?: productCoverType
    fav?: { productId: productSingleType; }[]
    discount?: boolean
}

function Box({ books = [], discount = false, fav = [] }: BoxType) {

    const bosRef = useRef<HTMLDivElement>(null);
    const parentWidth = useResizeObserver(bosRef);

    const getSlidesPerView = (width: number) => {
        if (width >= 854) return 4;
        if (width >= 644) return 3;
        if (width >= 434) return 2;
        return 1;
    };

    return (
        <>
            <div ref={bosRef} className={`mx-auto ${discount ? "bg-vije rounded-2xl" : ""} w-full `}>
                <div className={`${discount && "px-8 rounded-2xl"}`}>
                    <Swiper
                        slidesPerView={getSlidesPerView(parentWidth)}
                        spaceBetween={50}
                        pagination={{
                            clickable: true,
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        modules={[Pagination, Autoplay]}
                    >
                        {fav.length > 0 &&
                            fav.map(p => (
                                <SwiperSlide key={p.productId._id}>
                                    <ProductBox suggest={true} {...p.productId} />
                                </SwiperSlide>
                            ))
                        }
                        {books.length > 0 &&
                            books.map((i) => (
                                <SwiperSlide key={i._id}>
                                    <div className="pb-8">
                                        <ProductBox {...i} discountTimer={discount} />
                                    </div>
                                </SwiperSlide>
                            ))}
                    </Swiper>
                </div>
            </div>


        </>
    );
}

export default Box;