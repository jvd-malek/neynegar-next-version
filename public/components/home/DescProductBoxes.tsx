// next and icons
import Link from "next/link";
import Image, { StaticImageData } from 'next/image';
import  KeyboardBackspaceRounded  from "@mui/icons-material/KeyboardBackspaceRounded";

// images
import books from "@/public/images/books.webp";
import papers from "@/public/images/paper.webp";
import knives from "@/public/images/knives.webp";
import inks from "@/public/images/inks.webp";

const productImages = {
    books: { src: books, alt: "کتاب‌های خوشنویسی" },
    inks: { src: inks, alt: "مرکب خوشنویسی" },
    paper: { src: papers, alt: "کاغذ مخصوص خوشنویسی" },
    knives: { src: knives, alt: "قلم‌تراش سنتی" }
};

interface ProductBoxProps {
    title: string;
    link: string;
    images: { src: StaticImageData; alt: string }
}

const ProductBox: React.FC<ProductBoxProps> = ({ title, link, images, }) => {
    return (
        <div
            className="hover:shadow-lg transition-all relative md:h-56 h-52 md:w-42 w-36 px-1.5 py-2 rounded-xl flex justify-center items-center bg-white"
            role="product-box"
            aria-label={`باکس محصول ${title}`}
        >

            <div className="bg-linear-180 from-mist-100 to-mist-300 p-2 rounded-xl md:h-54 h-50 flex flex-col transition-all duration-300 md:w-40 w-36 relative">
                {/* Product Image */}
                <div className="absolute left-1/2 -translate-x-1/2 md:-top-20 -top-16 md:w-46 w-40 md:h-46 h-40">
                    <Image
                        src={(images as { src: any; alt: string }).src}
                        alt={(images as { src: any; alt: string }).alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100px, 150px"
                        loading="lazy"
                        quality={75}
                    />
                </div>

                {/* Product Info */}
                <div className="mt-auto text-center bg-white p-1 w-full h-[50%] flex justify-center items-center flex-col rounded-xl">
                    <h3 className="text-xl font-bold text-mist-800 mb-2">
                        {title}
                    </h3>
                    <Link
                        href={link}
                        className="inline-flex items-center gap-1 text-mist-600 hover:text-mist-900 active:text-mist-900 md:text-sm text-base font-extralight transition-colors group z-50"
                        aria-label={`مشاهده همه ${title}`}
                    >
                        مشاهده همه
                        <KeyboardBackspaceRounded
                            fontSize="inherit"
                            className="transform group-hover:-translate-x-1 active:-translate-x-1 transition-transform duration-700"
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
        <div className="flex flex-wrap w-full justify-center items-center gap-y-16 md:gap-x-12 gap-x-6 overflow-x-clip">
            <ProductBox
                title="کتاب‌های خوشنویسی"
                link="/category/کتاب/خوشنویسی"
                images={productImages.books}
            />

            <ProductBox
                title="مرکب‌های خوشنویسی"
                link="/category/لوازم خوشنویسی/مرکب"
                images={productImages.inks}
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
            />
        </div>
    );
}