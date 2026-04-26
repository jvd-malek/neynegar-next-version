"use client"

// utils
import { getCookie, setCookie } from 'cookies-next';

type BasketItem = {
    productId?: string | undefined;
    packageId?: string | undefined;
    count: number;
    showCount: number;
}

export const BLUR_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAASCAYAAAA6yNxSAAAJcklEQVR4AQCBAH7/AABWcP8AV3H/AFhx/wBZcv8AW3T/Dl11/x5gd/8pY3r/MmV8/zlofv8+a4D/Q22C/0Zvg/9IcYX/SXGF/0hyhf9GcYX/QnCE/zxtgv8zan//JWV7/whfd/8AWHH/AE9r/wBEZP8AN1z/ACZU/wAAS/8AAEL/AAA6/wAAMv8AAC3/AIEAfv8AAFhx/wBYcv8AWXL/AFpz/wBcdf8XX3f/I2F5/y1ke/81Z33/PGp//0Ftgf9Gb4P/SXGF/0tyhv9Lc4f/S3OH/0lzhv9FcYX/P2+D/zdrgP8rZ33/FWF4/wBac/8AUW3/AEdm/wA6Xv8AKlb/AA9N/wAARP8AADz/AAA1/wAAMP8AgQB+/wAAXHT/AFx1/wBddf8OX3b/G2F4/yZjev8vZnz/N2l+/z5sgf9Eb4P/SXGF/010h/9Qdon/UneK/1N4i/9TeIv/UXiK/012if9IdIf/QXCE/zdsgf8pZnz/C193/wBXcf8ATWr/AEJj/wA0W/8AIlP/AABK/wAAQ/8AAD3/AAA4/wCBAH7/ABphef8cYnn/IWN6/ydke/8uZ33/Nml//z1sgf9Eb4T/SnKG/1B1if9UeIv/WHuN/1t9j/9dfpD/Xn+R/11/kf9cfpD/WX2P/1R7jf9Od4r/RnOG/zttgv8sZ33/D193/wBWcP8ATGn/AEBi/wAzWv8AI1P/AAlM/wAAR/8AAEP/AIEAfv8AMGh+/zFpfv80an//OWuA/z9ugv9FcYX/S3SH/1F3iv9Weo3/W32P/2CAkv9jg5T/ZoWW/2iGl/9ph5f/aIeY/2eGl/9khZb/YIOU/1t/kf9Ue43/S3aJ/0BvhP8xaH7/GGB4/wBXcf8ATWr/AEJj/wA3XP8AK1b/AB9R/wAUTv8AgQB+/wBAb4T/QXCE/0Rxhf9Hc4b/THWI/1F4i/9Xe43/XH+Q/2KCk/9mhZb/aoiY/26Lm/9xjZz/co6e/3OPnv9zj57/co6e/2+NnP9sipr/Z4eY/2GDlP9ZfpD/UHiL/0Rxhf81an//H2F5/wBZcv8AT2z/AEZl/wA+YP8ANlz/ADFZ/wCBAH7/AE12if9Od4r/UHiL/1N6jP9YfI7/XH+R/2GClP9nhpb/a4mZ/3CMnP90j5//d5Kh/3qUo/97laT/fJal/3yWpf97laT/eZSj/3WRof9xjp7/a4qa/2SFlv9cf5H/UnmM/0dyhv84a4D/JWN6/wBbdP8AU27/AExp/wBGZf8AQmP/AIEAfv8AWHyO/1h9j/9afpD/XYCR/2GCk/9lhZb/aomZ/2+MnP9zj5//d5Kh/3uVpP9+mKb/gZqo/4Kbqf+DnKr/g5yq/4Kbqf+Amaj/fZel/3iUo/9zkJ//bYub/2WGlv9dgJH/U3mM/0dyhv86a4D/KWR6/xBddf8AV3H/AFJu/wBPa/8AgQB+/wBggpP/YYKT/2KDlP9lhZb/aIeY/2yKmv9wjZ3/dZGg/3mUo/99l6X/gJmo/4Ocqv+Fnqv/h5+s/4ifrf+Hn63/hp6s/4Sdq/+Bm6n/fZem/3iUov9zj57/bIqa/2SElf9bfpD/UXiL/0Zxhf86a4D/LGV7/xxgd/8DXHT/AFly/wCBAH7/AGaGlv9nhpf/aIeY/2qJmf9ti5v/cY6d/3WRoP95lKL/fJal/4CZp/+DnKr/hp6s/4ifrf+Joa7/iaGu/4mhrv+IoK3/hp6s/4Ocqv+Amaf/e5Wk/3WRoP9vjJz/aIeX/2CBk/9Xe47/TXWJ/0NwhP85aoD/LmZ8/yRief8dYHj/AIEAfv8AaomZ/2uJmf9sipr/boyb/3GOnf90kJ//d5Kh/3qVpP9+mKb/gZqo/4Ocqv+Gnqz/h5+t/4igrv+JoK7/iKCu/4efrf+Fnqv/g5up/3+Zp/97laT/dZGg/2+NnP9piJj/YYKU/1p9j/9ReIv/SHOG/0Bug/84an//MWd9/yxle/8AgQB+/wBti5v/boub/2+MnP9wjZ3/co+e/3WRoP93k6L/epWk/32Xpf9/maf/gpup/4Ocqv+Fnav/hZ6s/4aerP+Fnav/hJyq/4Kbqf9/maf/fJal/3iTov9zj5//bYub/2eHl/9hgpP/WX2P/1J4i/9LdIf/Q3CE/z1sgf83an//M2h+/wCBAH7/AG+MnP9vjJz/cI2c/3GOnf9yj57/dJCg/3aSof94k6L/epWk/3yWpf9+mKb/f5mn/4CZqP+Amqj/gJmo/3+Zp/9+mKb/fJal/3mUo/92kqH/co+e/26Lm/9piJj/Y4SV/12Akf9XfI7/UHeK/0p0h/9EcIT/Pm2C/zprgP83aX//AIEAfv8Ab4yc/2+MnP9wjZz/cI2d/3GOnv9zj57/dJCf/3WRoP92kqH/eJOi/3iTov95lKP/eZSj/3mUo/95lKL/eJOi/3aSof90kJ//co6e/26MnP9riZn/Z4aX/2KDlP9dgJH/WHyO/1J5i/9NdYj/R3KG/0Jvg/8+bYH/OmuA/zhqf/8AgQB+/wBujJz/b4yc/2+MnP9vjZz/cI2d/3CNnf9xjp3/cY6d/3KOnv9yjp7/co6e/3KOnv9yjp7/cY6d/3CNnf9vjJz/bYub/2uJmf9oiJj/ZYWW/2KDlP9egZL/Wn6Q/1Z7jf9ReIv/TXWI/0hyhv9DcIT/P22C/ztrgP84an//N2l//wCBAH7/AG6Mm/9ujJv/boyb/26Lm/9ti5v/bYub/22Lm/9ti5v/bYqa/2yKmv9riZn/a4mZ/2qImP9oh5j/Z4aX/2WFlv9jhJX/YYKT/16Bkv9cf5D/WH2P/1V7jf9ReIv/TnaJ/0p0h/9GcYX/Qm+D/z5tgv87a4D/OGp//zZpfv81aH7/AIEAfv8AbYub/22Lm/9si5v/bIqa/2uKmv9riZn/aomZ/2mImP9oh5f/Z4aX/2aFlv9khJX/YoOU/2GCk/9fgJL/XX+R/1p+j/9YfI7/VXuN/1J5jP9Pd4r/THWJ/0l0h/9Gcob/Q3CE/0Bug/88bIH/OmuA/zdpf/81aH7/M2d9/zJnff8BgQB+/wBsi5v/bIqa/2uKmv9ripr/aomZ/2mImP9oh5f/Z4aX/2WFlf9jg5T/YYKT/1+Bkv9df5H/W36Q/1l8jv9We43/VHmM/1F4i/9Od4r/THWI/0lzh/9Gcob/Q3CE/0Bvg/8+bYL/O2yB/zhqgP82aX//NGh+/zJnff8xZnz/MGZ8/7/ROyS5PrFIAAAAAElFTkSuQmCC'

export const customLoader = ({ src }: { src: string }) => {
    return `https://api.neynegar1.ir/uploads/${src}`;
};

export const updateBasketCookie = (basket: BasketItem[]) => {
    setCookie('basket', JSON.stringify(basket), {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });
};

export const getBasketFromCookies = (): BasketItem[] => {
    const basketCookie = getCookie('basket');
    return basketCookie ? JSON.parse(basketCookie.toString()) : [];
};