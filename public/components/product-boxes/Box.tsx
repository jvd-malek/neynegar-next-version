"use client"

// react
import { useMemo } from 'react';

// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// components
import ProductBox from '@/public/components/product-boxes/ProductBox';

// types
import { productCoverType, productType } from '@/public/types/product';
import { packageCoverType } from '@/public/types/package';
import { articleAuthorCoverType } from '@/public/types/article';
import ArticleBox from '../article/ArticleBox';

type BoxType = {
    products?: productCoverType[]
    articles?: { articleId: articleAuthorCoverType }[]
    packages?: packageCoverType[]
    favoriteProducts?: { productId: productType }[]
    discount?: boolean
}

function SwiperBox({
    products = [],
    articles = [],
    packages = [],
    favoriteProducts = [],
    discount = false,
}: BoxType) {

    const autoplayConfig = useMemo(() => ({
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    }), []);

    
    return (
        <div className="w-full mt-6">
            <Swiper
                spaceBetween={10}
                breakpoints={
                    articles.length > 0 ? {
                        320: { slidesPerView: 1 },
                        644: { slidesPerView: 2 },
                        854: { slidesPerView: 3 }
                    }
                        : {
                            320: { slidesPerView: 2 },
                            644: { slidesPerView: 3 },
                            854: { slidesPerView: 4 }
                        }
                }
                modules={[Autoplay]}
                autoplay={autoplayConfig}
                watchSlidesProgress={true}
            >

                {favoriteProducts.length > 0 &&
                    favoriteProducts.map(p => (
                        <SwiperSlide key={p.productId._id} className='pb-2'>
                            <ProductBox {...p.productId} />
                        </SwiperSlide>
                    ))}

                {products.length > 0 &&
                    products.map((i) => (
                        <SwiperSlide key={i._id} className='pb-2'>
                            <ProductBox {...i} discountTimer={discount} />
                        </SwiperSlide>
                    ))}

                {packages.length > 0 &&
                    packages.map((i) => (
                        <SwiperSlide key={i._id} className='pb-2'>
                            <ProductBox {...i} discountTimer={discount} isPackage />
                        </SwiperSlide>
                    ))}

                {articles.length > 0 &&
                    articles.map((i) => (
                        <SwiperSlide key={i.articleId._id} className='pb-2'>
                            <ArticleBox key={i.articleId._id} {...i.articleId} />
                        </SwiperSlide>
                    ))}
            </Swiper>
        </div >
    );
}

export default SwiperBox;