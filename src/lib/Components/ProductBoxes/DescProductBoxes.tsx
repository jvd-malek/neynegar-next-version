"use client"
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards } from 'swiper/modules';
import Link from "next/link";
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-cards';
import { KeyboardBackspaceRounded } from "@mui/icons-material";

// Import images with better naming
const productImages = {
    books: [
        { src: require('@/../../public/Img/book1.webp'), alt: "کتاب آموزش خوشنویسی شماره ۱" },
        { src: require('@/../../public/Img/book2.webp'), alt: "کتاب آموزش خوشنویسی شماره ۲" },
        { src: require('@/../../public/Img/book3.webp'), alt: "کتاب آموزش خوشنویسی شماره ۳" },
        { src: require('@/../../public/Img/book4.webp'), alt: "کتاب آموزش خوشنویسی شماره ۴" },
        { src: require('@/../../public/Img/book5.webp'), alt: "کتاب آموزش خوشنویسی شماره ۵" },
        { src: require('@/../../public/Img/book6.webp'), alt: "کتاب آموزش خوشنویسی شماره ۶" },
    ],
    inks: [
        { src: require('@/../../public/Img/color1.webp'), alt: "مرکب خوشنویسی مشکی" },
        { src: require('@/../../public/Img/color2.webp'), alt: "مرکب خوشنویسی رنگی" },
    ],
    paper: { src: require('@/../../public/Img/paper.webp'), alt: "کاغذ مخصوص خوشنویسی" },
    knives: [
        { src: require('@/../../public/Img/knife2.webp'), alt: "قلم‌تراش مدرن" },
        { src: require('@/../../public/Img/knife1.webp'), alt: "قلم‌تراش سنتی" },
    ]
};

// تعریف interface برای props
interface ProductBoxProps {
    title: string;
    link: string;
    images: Array<{ src: string; alt: string }> | { src: string; alt: string };
    type?: 'slider' | 'double' | 'single';
    knife?: boolean;
}

const ProductBox: React.FC<ProductBoxProps> = ({
    title,
    link,
    images,
    type = 'single',
    knife = false
}) => {
    return (
        <div 
            className="bg-[url(../../public/Img/vije4.webp)] transition-all bg-no-repeat bg-cover md:h-56 h-52 md:w-42 w-38 px-1.5 py-2 rounded-xl flex justify-center items-center"
            role="article"
            aria-label={`باکس محصول ${title}`}
        >
            <div className="
      bg-gray-100/35 backdrop-blur-[0.5px] hover:bg-gray-100/80
      p-2 rounded-xl
      md:h-54 h-50 flex flex-col
      transition-all duration-300
      shadow-sm hover:shadow-md active:shadow-md
      md:w-40 w-36
      relative
    ">
                {/* Product Image */}
                {type === 'slider' && Array.isArray(images) ? (
                    <div className="absolute left-1/2 -translate-x-1/2 md:-top-12 -top-14">
                        <Swiper
                            effect={'cards'}
                            modules={[Autoplay, EffectCards]}
                            grabCursor={true}
                            className="w-26"
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            loop={true}
                        >
                            {images.map((img, i) => (
                                <SwiperSlide key={i}>
                                    <div className="relative w-26 h-[140px]">
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            className="object-contain"
                                        //   sizes="(max-width: 768px) 112px, 160px"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                ) : type === 'double' && Array.isArray(images) ? (
                    <>
                        <div className={`absolute left-1/2 ${knife ? "-translate-x-[35%] -top-15 md:w-46 w-44 md:h-46 h-44" : "w-32 -translate-x-[35%] h-32 -top-8"}`}>
                            <Image
                                src={images[0].src}
                                alt={images[0].alt}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100px, 150px"
                            />
                        </div>
                        <div className={`absolute left-1/2 ${knife ? "-translate-x-[80%] -top-8 md:w-38 w-36 md:h-38 h-36" : "w-32 -translate-x-[65%] h-32 md:-top-8 -top-10"}`}>
                            <Image
                                src={images[1].src}
                                alt={images[1].alt}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100px, 150px"
                            />
                        </div>
                    </>
                ) : (
                    <div className="absolute left-1/2 -translate-x-3/7 md:-top-20 -top-16 md:w-54 w-48 md:h-54 h-46">
                        <Image
                            src={(images as { src: any; alt: string }).src}
                            alt={(images as { src: any; alt: string }).alt}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100px, 150px"
                        />
                    </div>
                )}

                {/* Product Info */}
                <div className="mt-auto text-center bg-white p-1 w-full h-[50%] flex justify-center items-center flex-col rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {title}
                    </h3>
                    <Link
                        href={link}
                        className="
            inline-flex items-center gap-1
            text-gray-600 hover:text-gray-900 active:text-gray-900
            md:text-sm text-base font-medium
            transition-colors group z-50
          "
                        aria-label={`مشاهده همه ${title}`}
                    >
                        مشاهده همه
                        <KeyboardBackspaceRounded
                            fontSize="inherit"
                            className="
                      transform group-hover:-translate-x-1 active:-translate-x-1
                      transition-transform duration-700 
                    "
                            aria-hidden="true"
                        />
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default function DescProductBoxes() {
    return (
        <div className="flex flex-wrap w-full justify-center items-center md:gap-y-16 gap-y-12 md:gap-x-12 gap-x-8 overflow-x-clip">
            <ProductBox
                title="کتاب‌های خوشنویسی"
                link="/category/کتاب/خوشنویسی"
                images={productImages.books}
                type="slider"
            />

            <ProductBox
                title="مرکب‌های خوشنویسی"
                link="/category/لوازم خوشنویسی/مرکب"
                images={productImages.inks}
                type="double"
            />

            <ProductBox
                title="کاغذ خوشنویسی"
                link="/category/لوازم خوشنویسی/کاغذ"
                images={productImages.paper}
            />

            <ProductBox
                title="قلم‌تراش"
                link="/category/لوازم خوشنویسی/قلم‌تراش"
                images={productImages.knives}
                type="double"
                knife
            />
        </div>
    );
}