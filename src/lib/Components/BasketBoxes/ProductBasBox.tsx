import PaginationBox from "@/lib/Components/Pagination/PaginationBox";
import BasketBox from "@/lib/Components/ProductBoxes/BasketBox";
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';

interface ProductId {
    _id: string;
    title: string;
    desc: string;
    weight: number;
    cover: string;
    brand: string;
    status: string;
    majorCat: string;
    minorCat: string;
    price: number;
    discount: number;
    popularity: number;
    showCount: number;
    discountRaw: { discount: number; date: number }[];
}

interface UserBasket {
    count: number;
    productId: ProductId;
    currentPrice: number;
    currentDiscount: number;
    itemTotal: number;
    itemDiscount: number;
    itemWeight: number;
}

interface ProductBasBoxProps {
    Products: UserBasket[];
    page: {
        sort?: 'expensive' | 'cheap' | 'popular' | 'offers';
        activeLink: string;
        page: number;
        count: number;
        search?: string;
    };
    basket: UserBasket[];
}

function ProductBasBox({ Products, page, basket }: ProductBasBoxProps) {
    const products = [...Products];

    return (
        <div className={`bg-slate-200 col-start-1 lg:col-end-4 col-end-6 row-start-1 transition-all ${page.activeLink == "product" ? "w-full opacity-100" : "h-0 opacity-60 w-0 overflow-hidden z-0"} flex flex-col justify-between transition-opacity rounded-l-xl rounded-b-xl`}>
            <div className={`lg:pt-16 py-10 px-10 w-full transition-all duration-700 grid grid-cols-1 grid-flow-row justify-center items-center gap-8 ${page.activeLink == "product" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}>
                {products.length > 0 ?
                    products
                        .slice(page.page * page.count - page.count, page.page * page.count)
                        .map((b: UserBasket) => (
                            <div className="" key={b.productId._id}>
                                <BasketBox {...b.productId} count={b.count} />
                            </div>
                        )) :
                    page.search ?
                        <p className="">
                            {`محصولی در سبد خرید شما با \" ${page.search} \" مطابقت ندارد.`}
                        </p> :
                        <p className="text-center">
                            هنوز محصولی به سبد خرید خود اضافه نکرده‌اید.
                            <span><SentimentDissatisfiedTwoToneIcon /></span>
                        </p>
                }
            </div>
            {basket && basket.length > page.count &&
                <div className={`mb-10 transition-all duration-700 ${page.activeLink == "product" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                    <PaginationBox
                        count={Math.ceil(basket.length / page.count)}
                        currentPage={page.page}
                        basket
                    />
                </div>
            }
        </div>
    );
}

export default ProductBasBox;