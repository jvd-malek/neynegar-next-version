import BoxHeader from "@/lib/Components/ProductBoxes/BoxHeader";
import ProductBox from "@/lib/Components/ProductBoxes/ProductBox";
import { productCoverType } from "@/lib/Types/product";
import { articleAuthorCoverType } from "@/lib/Types/article";
import Image from "next/image";
import poem1 from "@/../../public/Img/poem1.webp";
import DescProductBoxes from "@/lib/Components/ProductBoxes/DescProductBoxes";
import ArticleBox from "@/lib/Components/ArticleBoxes/ArticleBox";
import PaginationBox from "@/lib/Components/Pagination/PaginationBox";
import { getLinks } from "@/lib/actions/link.actions";
import { Metadata } from "next";
import { Bounce, ToastContainer } from "react-toastify";

interface CategoryProps {
    params: { slug: string[] };
    searchParams: {
        page?: string;
        sort?: string;
        cat?: string;
        count?: string;
        search?: string;
    };
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const param = await params; // Await the params first
    const slug = param.slug; // Await the params first
    const categoryName = decodeURIComponent(slug[0]) == "search" ? "جستجو" : decodeURIComponent(slug[0]);
    const subCategory = slug[1] ? decodeURIComponent(slug[1]) : null;

    return {
        title: subCategory
            ? `${subCategory} | ${categoryName} - نی‌نگار`
            : `${categoryName} - فروشگاه اینترنتی نی‌نگار`,
        description: subCategory
            ? `محصولات و مقالات ${subCategory} در دسته‌بندی ${categoryName} - بهترین کیفیت و قیمت`
            : `همه محصولات و مقالات دسته ${categoryName} - خرید آنلاین با تضمین کیفیت`,
        alternates: {
            canonical: `https://neynegar1.ir/category/${slug.join('/')}`, // استفاده از slug که await شده
        },
        openGraph: {
            title: subCategory
                ? `${subCategory} | ${categoryName} - نی‌نگار`
                : `${categoryName} - نی‌نگار`,
            description: subCategory
                ? `محصولات دسته ${subCategory} در گروه ${categoryName}`
                : `همه محصولات دسته ${categoryName}`,
            url: `https://neynegar1.ir/category/${slug.join('/')}`, // استفاده از slug که await شده
            images: [{
                url: 'https://neynegar1.ir/logo.png',
                width: 800,
                height: 600,
                alt: 'نی‌نگار',
            }],
            siteName: 'نی‌نگار',
        },
    };
}

const Category = async ({ params, searchParams }: any) => {
    const [slug, search] = await Promise.all([
        params.slug,
        searchParams
    ]);

    const page = {
        page: parseInt(search.page || '1'),
        sort: search.sort || 'latest',
        cat: search.cat || 'همه',
        count: parseInt(search.count || '24'),
        search: search.search || '',
    };

    const isArticle = decodeURIComponent(slug[0]) === "مقالات";
    const categoryName = decodeURIComponent(slug[0]) == "search" ? "جستجو" : decodeURIComponent(slug[0]);
    const subCategory = slug[1] ? decodeURIComponent(slug[1]) : null;
    const initialLinks = await getLinks();

    // Fetch data with pagination
    const [productsData, articles] = await Promise.all([
        isArticle ? { products: [], totalPages: 0, currentPage: 1, total: 0 } : fetchProducts(slug, page),
        isArticle ? fetchArticles(slug) : [],
    ]);

    const filteredProducts = filterAndSortProducts(productsData.products, page, slug);
    const filteredArticles = filterAndSortArticles(articles, page, slug);

    return (
        <div className="font-[Baloo]">
            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                limit={2}
                hideProgressBar={false}
                newestOnTop
                closeOnClick={false}
                rtl={true}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
            />

            {/* Hero Section */}
            <section aria-labelledby="category-heading" className="relative bg-[url(../../public/Img/blue-low.webp)] bg-repeat bg-contain w-full pt-10 lg:h-[75vh] sm:h-[100vh] h-[70vh] text-white flex justify-center items-center">
                <div className="w-40 absolute -bottom-1/7 left-1/2 -translate-x-1/2 z-10">
                    <Image
                        src={poem1}
                        alt={`تصویر شعر مولانا - ${categoryName}`}
                        priority
                        quality={80}
                    />
                </div>
                <div className="absolute inset-x-0 -bottom-1 h-[70%] bg-gradient-to-t from-slate-50 to-transparent" />
                <BoxHeader
                    initialLinks={initialLinks}
                    title={subCategory || categoryName}
                    all={false}
                    searchBar={true}
                    article={isArticle}
                    searchCat={categoryName === "search"}
                    catTitle={subCategory ? categoryName : undefined}
                />
            </section>

            {/* Main Content */}
            <main>

                {/* Products/Articles List */}
                <section aria-labelledby="items-heading" className="w-full">
                    <h2 id="items-heading" className="sr-only">
                        لیست {isArticle ? 'مقالات' : 'محصولات'}
                    </h2>

                    <ul className="flex flex-wrap justify-center sm:gap-[3.5rem] gap-4 w-[90vw] mx-auto mt-26">
                        {!isArticle
                            ? filteredProducts.map((product: any) => (
                                <li key={product._id} className="sm:w-52 w-40" itemScope itemType="https://schema.org/Product">
                                    <ProductBox
                                        box={false}
                                        {...product}
                                    />
                                </li>
                            ))
                            : filteredArticles
                                .slice(page.page * page.count - page.count, page.page * page.count)
                                .map(article => (
                                    <li key={article._id} itemScope itemType="https://schema.org/Article">
                                        <ArticleBox {...article} />
                                    </li>
                                ))}
                    </ul>
                </section>

                {/* Pagination */}
                {(!isArticle && productsData.totalPages > 1) && (
                    <PaginationBox
                        count={productsData.totalPages}
                        currentPage={productsData.currentPage}
                    />
                )}
                {(isArticle && filteredArticles.length > page.count) && (
                    <PaginationBox
                        count={Math.ceil(filteredArticles.length / page.count)}
                        currentPage={page.page}
                    />
                )}

                {/* Empty State */}
                {(!isArticle && filteredProducts.length === 0) && (
                    <div className="container px-8 mx-auto" role="status" aria-live="polite">
                        <p className="text-2xl text-slate-700 text-center mt-6 mb-20">
                            موردی یافت نشد
                        </p>
                    </div>
                )}
                {(isArticle && filteredArticles.length === 0) && (
                    <div className="container px-8 mx-auto" role="status" aria-live="polite">
                        <p className="text-2xl text-slate-700 text-center mt-6 mb-20">
                            موردی یافت نشد
                        </p>
                    </div>
                )}
            </main>

            {/* Description Section */}
            <section aria-labelledby="description-heading" className="flex justify-center items-center flex-wrap gap-10 text-center mt-20">
                <span className="w-[50%] mx-auto h-1 bg-slate-300 rounded-3xl md:mb-8 mb-12"></span>
                <DescProductBoxes />
            </section>
        </div>
    );
};

// Update the fetchProducts function to use GraphQL
async function fetchProducts(loc: string[], page: any) {
    // اگر جستجو باشد
    if (decodeURIComponent(loc[0]) === "search") {
        const query = `
            query SearchProducts($query: String!, $page: Int, $limit: Int) {
                searchProducts(query: $query, page: $page, limit: $limit) {
                    products {
                        _id
                        title
                        desc
                        price {price}
                        discount {discount}
                        popularity
                        cover
                        brand
                        showCount
                        majorCat
                        minorCat
                    }
                    totalPages
                    currentPage
                    total
                }
            }
        `;

        const variables = {
            query: decodeURIComponent(loc[1]),
            page: page.page,
            limit: page.count
        };

        const res = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            }),
            next: { revalidate: 3600 }
        });

        const data = await res.json();
        return data.data.searchProducts;
    }

    // اگر دسته‌بندی باشد
    const query = `
        query ProductsByCategory($majorCat: String!, $minorCat: String, $page: Int, $limit: Int, $search: String, $sort: String, $cat: String) {
            productsByCategory(
                majorCat: $majorCat, 
                minorCat: $minorCat, 
                page: $page, 
                limit: $limit,
                search: $search,
                sort: $sort,
                cat: $cat
            ) {
                products {
                    _id
                    title
                    desc
                    price {price}
                    discount {discount date}
                    popularity
                    cover
                    brand
                    showCount
                    majorCat
                    minorCat
                }
                totalPages
                currentPage
                total
            }
        }
    `;

    const variables = {
        majorCat: decodeURIComponent(loc[0]),
        minorCat: loc[1] ? decodeURIComponent(loc[1]) : null,
        page: page.page,
        limit: page.count,
        search: page.search,
        sort: page.sort,
        cat: page.cat
    };

    const res = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables
        }),
        next: { revalidate: 3600 }
    });

    const data = await res.json();
    return data.data.productsByCategory;
}

async function fetchArticles(loc: string[]) {
    const url = loc[1]
        ? `${process.env.NEXT_PUBLIC_BASE_URL!}/api/articles/${decodeURIComponent(loc[0])}/${decodeURIComponent(loc[1])}`
        : `${process.env.NEXT_PUBLIC_BASE_URL!}/api/articles/${decodeURIComponent(loc[0])}`;

    const res = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour
    return await res.json();
}

function filterAndSortProducts(products: productCoverType, page: any, loc: string[]) {
    return [...products]
        .sort((a, b) => {
            // اول بر اساس موجودی مرتب می‌کنیم
            if (a.showCount > 0 && b.showCount <= 0) return -1;
            if (a.showCount <= 0 && b.showCount > 0) return 1;

            // سپس بر اساس نوع مرتب‌سازی انتخاب شده
            switch (page.sort) {
                case 'expensive':
                    return calculateFinalPrice(b) - calculateFinalPrice(a);
                case 'cheap':
                    return calculateFinalPrice(a) - calculateFinalPrice(b);
                case 'popular':
                    return b.popularity - a.popularity;
                case 'offers':
                    const aLastDiscount = a.discount[a.discount.length - 1];
                    const bLastDiscount = b.discount[b.discount.length - 1];
                    const now = Date.now();
                    
                    // اگر تخفیف معتبر باشد (تاریخ آن نگذشته باشد)
                    const aValidDiscount = aLastDiscount && aLastDiscount.date > now ? aLastDiscount.discount : 0;
                    const bValidDiscount = bLastDiscount && bLastDiscount.date > now ? bLastDiscount.discount : 0;
                    
                    return bValidDiscount - aValidDiscount;
                default:
                    return 0;
            }
        });
}

function filterAndSortArticles(articles: articleAuthorCoverType, page: any, loc: string[]) {
    return [...articles]
        .filter(a => {
            if (page.cat === 'همه') return true;
            return !loc[1] ? a.minorCat == page.cat : a.subCat === page.cat;
        })
        .filter(a => a.title.includes(page.search.trim()))
        .sort((a, b) => page.sort === 'popular' ? b.popularity - a.popularity : 0);
}

function calculateFinalPrice(product: any) {
    const lastDiscount = product.discount[product.discount.length - 1];
    const lastPrice = product.price[product.price.length - 1].price;
    const now = Date.now();
    
    // اگر تخفیف معتبر باشد (تاریخ آن نگذشته باشد)
    const validDiscount = lastDiscount && lastDiscount.date > now ? lastDiscount.discount : 0;
    return validDiscount > 0 ? (lastPrice * (100 - validDiscount) / 100) : lastPrice;
}

export default Category;