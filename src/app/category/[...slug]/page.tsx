import BoxHeader from "@/lib/Components/ProductBoxes/BoxHeader";
import ProductBox from "@/lib/Components/ProductBoxes/ProductBox";
import { articleAuthorCoverType } from "@/lib/Types/article";
import Image from "next/image";
import poem1 from "@/../../public/Img/poem1.webp";
import DescProductBoxes from "@/lib/Components/ProductBoxes/DescProductBoxes";
import ArticleBox from "@/lib/Components/ArticleBoxes/ArticleBox";
import PaginationBox from "@/lib/Components/Pagination/PaginationBox";
import { getLinks } from "@/lib/actions/link.actions";
import { Metadata } from "next";

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
        await params.slug,
        await searchParams
    ]);

    const page = {
        page: parseInt(search.page || '1'),
        sort: search.sort || 'latest',
        cat: search.cat || 'همه',
        count: parseInt(search.count || '24'),
        search: search.search || '',
    };

    const isArticle = decodeURIComponent(slug[0]) === "مقالات";
    const isSearch = decodeURIComponent(slug[0]) === "search";
    const isCourseCategory = decodeURIComponent(slug[0]) === "دوره";
    const isSaleCategory = decodeURIComponent(slug[0]) === "حراجستون";
    const categoryName = isSearch ? "جستجو" : decodeURIComponent(slug[0]);
    const subCategory = slug[1] ? decodeURIComponent(slug[1]) : null;
    const initialLinks = await getLinks();

    // Fetch data with pagination
    let productsData: any = { products: [], totalPages: 0, currentPage: 1, total: 0 };
    let articlesData = { articles: [], totalPages: 0, currentPage: 1, total: 0 };
    let courseProducts: any[] = [];
    let saleProducts: any[] = [];
    
    if (isCourseCategory) {
        // کوئری دوره‌ها بر اساس دسته‌بندی و جمع‌آوری محصولات مرتبط
        const query = `
        query CoursesByCategory($category: String!) {
          coursesByCategory(category: $category) {
            relatedProducts {
              _id
              title
              desc
              price { price date }
              discount { discount date }
              popularity
              cover
              brand
              showCount
              majorCat
              minorCat
            }
          }
        }
      `;
        const variables = { category: decodeURIComponent(slug[1]) };

        const res = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        courseProducts = (data.data.coursesByCategory || []).flatMap((c: any) => c.relatedProducts || []);
    } else if (isSaleCategory) {
        // کوئری محصولات حراج (تخفیف‌دار) با pagination
        const query = `
        query OfferProducts($page: Int, $limit: Int) {
          offer(page: $page, limit: $limit) {
            products {
              _id
              title
              desc
              price { price date }
              discount { discount date }
              popularity
              cover
              brand
              showCount
              majorCat
              minorCat
              state
            }
            totalPages
            currentPage
            total
          }
        }
      `;

        const variables = {
            page: page.page,
            limit: page.count
        };

        const res = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        const offerData = data.data.offer;
        saleProducts = offerData?.products || [];
        productsData = {
            products: saleProducts,
            totalPages: offerData?.totalPages || 0,
            currentPage: offerData?.currentPage || 1,
            total: offerData?.total || 0
        };
    } else {
        [productsData, articlesData] = await Promise.all([
            isArticle ? { products: [], totalPages: 0, currentPage: 1, total: 0 } : fetchProducts(slug, page),
            isArticle ? fetchArticles(slug, page) : { articles: [], totalPages: 0, currentPage: 1, total: 0 },
        ]);
    }

    // If it's a search, also fetch articles for products
    let searchArticlesData = { articles: [], totalPages: 0, currentPage: 1, total: 0 };
    if (isSearch && !isArticle) {
        searchArticlesData = await fetchArticles(slug, page);
    }

    const filteredProducts = productsData.products.length > 0 ? productsData.products : 
                           courseProducts.length > 0 ? courseProducts : 
                           saleProducts.length > 0 ? saleProducts : []
    const filteredArticles = filterAndSortArticles(articlesData.articles || articlesData, page, slug);
    const filteredSearchArticles = filterAndSortArticles(searchArticlesData.articles, page, slug);

    return (
        <div className="font-[Baloo]">

            {/* Hero Section */}
            <section aria-labelledby="category-heading" className="relative bg-[url(../../public/Img/blue-low.webp)] bg-repeat bg-contain w-full sm:pt-10 lg:h-[75vh] sm:h-[100vh] h-[70vh] text-white flex justify-center items-center">
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
                    searchCat={isSearch}
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
                            ? (isSaleCategory 
                                ? saleProducts.map((product: any) => (
                                    <li key={product._id} className="sm:w-52 w-40" itemScope itemType="https://schema.org/Product">
                                        <ProductBox
                                            box={false}
                                            {...product}
                                        />
                                    </li>
                                ))
                                : filteredProducts.map((product: any) => (
                                    <li key={product._id} className="sm:w-52 w-40" itemScope itemType="https://schema.org/Product">
                                        <ProductBox
                                            box={false}
                                            {...product}
                                        />
                                    </li>
                                ))
                            )
                            : filteredArticles
                                .slice(page.page * page.count - page.count, page.page * page.count)
                                .map(article => (
                                    <li key={article._id} itemScope itemType="https://schema.org/Article">
                                        <ArticleBox {...article} />
                                    </li>
                                ))}
                    </ul>

                    {/* Show articles in search results for products */}
                    {isSearch && !isArticle && filteredSearchArticles.length > 0 && (
                        <>
                            <h3 className="text-2xl font-bold text-center mt-16 mb-8 text-slate-700">مقالات مرتبط</h3>
                            <ul className="flex flex-wrap justify-center sm:gap-[3.5rem] gap-4 w-[90vw] mx-auto">
                                {filteredSearchArticles
                                    .slice(0, 6) // Show only first 6 articles
                                    .map(article => (
                                        <li key={article._id} itemScope itemType="https://schema.org/Article">
                                            <ArticleBox {...article} />
                                        </li>
                                    ))}
                            </ul>
                        </>
                    )}
                </section>

                {/* Pagination */}
                {(!isArticle && !isSaleCategory && productsData.totalPages > 1) && (
                    <PaginationBox
                        count={productsData.totalPages}
                        currentPage={productsData.currentPage}
                    />
                )}
                {(isSaleCategory && productsData.totalPages > 1) && (
                    <PaginationBox
                        count={productsData.totalPages}
                        currentPage={productsData.currentPage}
                    />
                )}
                {(isArticle && (articlesData.totalPages > 1 || (articlesData.totalPages === 0 && filteredArticles.length > page.count))) && (
                    <PaginationBox
                        count={articlesData.totalPages || Math.ceil(filteredArticles.length / page.count)}
                        currentPage={articlesData.currentPage || page.page}
                    />
                )}

                {/* Empty State */}
                {(!isArticle && !isSaleCategory && filteredProducts.length === 0) && (
                    <div className="container px-8 mx-auto" role="status" aria-live="polite">
                        <p className="text-2xl text-slate-700 text-center mt-6 mb-20">
                            موردی یافت نشد
                        </p>
                    </div>
                )}
                {(isSaleCategory && productsData.total === 0) && (
                    <div className="container px-8 mx-auto" role="status" aria-live="polite">
                        <p className="text-2xl text-slate-700 text-center mt-6 mb-20">
                            محصول تخفیف‌داری یافت نشد
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
                        discount {discount date}
                        popularity
                        cover
                        brand
                        showCount
                        majorCat
                        minorCat
                        state
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
                    state
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

async function fetchArticles(loc: string[], page: any) {
    // اگر جستجو باشد
    if (decodeURIComponent(loc[0]) === "search") {
        const query = `
            query SearchArticles($query: String!, $page: Int, $limit: Int) {
                searchArticles(query: $query, page: $page, limit: $limit) {
                    articles {
                        _id
                        title
                        desc
                        content
                        subtitles
                        views
                        cover
                        images
                        popularity
                        authorId {
                            _id
                            firstname
                            lastname
                            fullName
                        }
                        majorCat
                        minorCat
                        createdAt
                        updatedAt
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
        return data.data.searchArticles;
    }

    // اگر دسته‌بندی باشد
    const query = `
        query ArticlesByCategory($majorCat: String!, $minorCat: String, $page: Int, $limit: Int, $search: String, $sort: String, $cat: String) {
            articlesByCategory(
                majorCat: $majorCat, 
                minorCat: $minorCat, 
                page: $page, 
                limit: $limit,
                search: $search,
                sort: $sort,
                cat: $cat
            ) {
                articles {
                    _id
                    title
                    desc
                    content
                    subtitles
                    views
                    cover
                    images
                    popularity
                    authorId {
                        _id
                        firstname
                        lastname
                        fullName
                    }
                    majorCat
                    minorCat
                    createdAt
                    updatedAt
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
    return data.data.articlesByCategory;
}

function filterAndSortArticles(articles: articleAuthorCoverType, page: any, loc: string[]) {
    return [...articles]
        .filter(a => {
            if (page.cat === 'همه') return true;
            return !loc[1] ? a.minorCat == page.cat : a.minorCat === page.cat;
        })
        .filter(a => a.title.includes(page.search.trim()))
        .sort((a, b) => {
            // اول بر اساس نوع مرتب‌سازی انتخاب شده
            switch (page.sort) {
                case 'popular':
                    return b.popularity - a.popularity;
                case 'views':
                    return b.views - a.views;
                case 'latest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default:
                    return 0;
            }
        });
}

export default Category;