// next and utils
import { Metadata } from "next";
import { getLinks } from "@/public/utils/actions/link.actions";
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";

// components
import BoxHeader from "@/public/components/product-boxes/BoxHeader";
import ProductBox from "@/public/components/product-boxes/ProductBox";
import DescProductBoxes from "@/public/components/home/DescProductBoxes";
import ArticleBox from "@/public/components/article/ArticleBox";
import PaginationBox from "@/public/components/pagination/PaginationBox";

// types
import { articleAuthorCoverType } from "@/public/types/article";
import { packageCoverType } from "@/public/types/package";
import { productCoverType } from "@/public/types/product";
import { linksType } from "@/public/types/links";

// queries
import { GET_RELATED_PRODUCTS_COURSE_BY_CATEGORY } from "@/public/graphql/courseQueries";
import { GET_OFFER_PRODUCTS, GET_PRODUCTS_BY_CATEGORY, GET_SEARCH_PRODUCTS } from "@/public/graphql/productQueries";
import { GET_HOME_PAGE_PACKAGES } from "@/public/graphql/packageQueries";
import { GET_ARTICLES_BY_CATEGORY, GET_SEARCH_ARTICLES } from "@/public/graphql/articleQueries";
import Header from "@/public/components/header/Header";
import Footer from "@/public/components/footer/Footer";
import Breadcrumb from "@/public/components/breadcrumb/Breadcrumb";

type productsDataType = {
    products: productCoverType[],
    totalPages: number,
    currentPage: number,
    total: number
}
type articlesDataType = {
    articles: articleAuthorCoverType[],
    totalPages: number,
    currentPage: number,
    total: number
}
type packagesDataType = {
    packages: packageCoverType[],
    totalPages: number,
    currentPage: number,
    total: number
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
    const param = await params;
    const slug = param.slug;
    const majorCategory = decodeURIComponent(slug[0]) == "search" ? "جستجو" : decodeURIComponent(slug[0]);
    const minorCategory = slug[1] ? decodeURIComponent(slug[1]) : null;

    return {
        title: minorCategory
            ? `${minorCategory} | ${majorCategory} - نی‌نگار`
            : `${majorCategory} - فروشگاه اینترنتی نی‌نگار`,

        description: minorCategory
            ? `محصولات و مقالات ${minorCategory} در دسته‌بندی ${majorCategory} - بهترین کیفیت و قیمت`
            : `همه محصولات و مقالات دسته ${majorCategory} - خرید آنلاین با تضمین کیفیت`,

        alternates: {
            canonical: `https://neynegar1.ir/category/${slug.join('/')}`
        },

        openGraph: {
            title: minorCategory
                ? `${minorCategory} | ${majorCategory} - نی‌نگار`
                : `${majorCategory} - نی‌نگار`,
            description: minorCategory
                ? `محصولات دسته ${minorCategory} در گروه ${majorCategory}`
                : `همه محصولات دسته ${majorCategory}`,
            url: `https://neynegar1.ir/category/${slug.join('/')}`,
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

    const search = await searchParams

    const param = await params;
    const slug = param.slug;

    const pageFilters = {
        page: parseInt(search.page || '1'),
        sort: search.sort || 'latest',
        cat: search.cat || 'همه',
        count: parseInt(search.count || '24'),
        instock: Boolean(search.instock || false)
    };

    const isArticleCategory = decodeURIComponent(slug[0]) === "مقالات";
    const isPackageCategory = decodeURIComponent(slug[0]) === "پکیج";
    const isSearchCategory = decodeURIComponent(slug[0]) === "search";
    const isCourseProductCategory = decodeURIComponent(slug[0]) === "دوره";
    const isOfferProductCategory = decodeURIComponent(slug[0]) === "حراجستون";
    const majorCategory = isSearchCategory ? "جستجو" : decodeURIComponent(slug[0]);
    const minorCategory = slug[1] ? decodeURIComponent(slug[1]) : null;
    const initialLinks: linksType[] = await getLinks();

    // Fetch data with pagination
    let productsData: productsDataType = { products: [], totalPages: 0, currentPage: 1, total: 0 };
    let articlesData: articlesDataType = { articles: [], totalPages: 0, currentPage: 1, total: 0 };
    let packagesData: packagesDataType = { packages: [], totalPages: 0, currentPage: 1, total: 0 };

    // برای سرچ 3 تا دکمه بزار بتونه بین این 3 نوع جابه جا شه و با زدنشون اطلاعات فیلتر ریست شه
    // هدر سایت مدل هدر تمرین بهمن سبز بشه
    // برای حالت های پکیج، سرچ، حراجستون در بک اند فیلتر لحاظ کن
    // اضافه کردن instock به فیلتر های بک اند

    switch (true) {
        case isArticleCategory:
            const articlesVariables = {
                majorCat: majorCategory,
                minorCat: minorCategory,
                page: pageFilters.page,
                limit: pageFilters.count,
                sort: pageFilters.sort,
                cat: pageFilters.cat
            };

            const articlesByCategotyData = await fetcher(GET_ARTICLES_BY_CATEGORY, articlesVariables, revalidateOneHour)
                .then(data => data.articlesByCategory)
                .catch(err => console.error(err))

            articlesData = {
                articles: articlesByCategotyData.articles,
                totalPages: articlesByCategotyData?.totalPages || 0,
                currentPage: articlesByCategotyData?.currentPage || 1,
                total: articlesByCategotyData?.total || 0
            };
            break;

        case isPackageCategory:
            const packagesVariables = {
                page: pageFilters.page,
                limit: pageFilters.count
            };

            const PackagesData = await fetcher(GET_HOME_PAGE_PACKAGES, packagesVariables, revalidateOneHour)
                .then(data => data.packages)
                .catch(err => console.error(err))

            packagesData = {
                packages: PackagesData.packages,
                totalPages: PackagesData?.totalPages || 0,
                currentPage: PackagesData?.currentPage || 1,
                total: PackagesData?.total || 0
            };
            break;

        case isSearchCategory:

            const searchVariables = {
                query: minorCategory,
                page: pageFilters.page,
                limit: pageFilters.count
            };

            const searchProductsData = await fetcher(GET_SEARCH_PRODUCTS, searchVariables, revalidateOneHour)
                .then(data => data.searchProducts)
                .catch(err => console.error(err))

            const searchArticlesData = await fetcher(GET_SEARCH_ARTICLES, searchVariables, revalidateOneHour)
                .then(data => data.searchArticles)
                .catch(err => console.error(err))

            productsData = {
                products: searchProductsData.products,
                totalPages: searchProductsData?.totalPages || 0,
                currentPage: searchProductsData?.currentPage || 1,
                total: searchProductsData?.total || 0
            };

            articlesData = {
                articles: searchArticlesData.articles,
                totalPages: searchArticlesData?.totalPages || 0,
                currentPage: searchArticlesData?.currentPage || 1,
                total: searchArticlesData?.total || 0
            };

            break;

        case isCourseProductCategory:

            const courseProductsVariables = { category: decodeURIComponent(slug[1]) };
            const courseProductsData = await fetcher(GET_RELATED_PRODUCTS_COURSE_BY_CATEGORY, courseProductsVariables, revalidateOneHour)
                .then(data => data.coursesByCategory)
                .catch(err => console.error(err))

            let courseProducts = (courseProductsData || []).flatMap((c: any) => c.relatedProducts || []);
            productsData = {
                products: courseProducts,
                totalPages: 0,
                currentPage: 1,
                total: 0
            };

            break;

        case isOfferProductCategory:

            const offerProductsVariables = {
                page: pageFilters.page,
                limit: pageFilters.count
            };

            const offerProductsData = await fetcher(GET_OFFER_PRODUCTS, offerProductsVariables, revalidateOneHour)
                .then(data => data.offer)
                .catch(err => console.error(err))

            productsData = {
                products: offerProductsData?.products,
                totalPages: offerProductsData?.totalPages || 0,
                currentPage: offerProductsData?.currentPage || 1,
                total: offerProductsData?.total || 0
            };

            break;

        default:

            const productsByCategoryVariables = {
                majorCat: majorCategory,
                minorCat: minorCategory,
                page: pageFilters.page,
                limit: pageFilters.count,
                sort: pageFilters.sort,
                cat: pageFilters.cat
            };

            const productsByCategoryData = await fetcher(GET_PRODUCTS_BY_CATEGORY, productsByCategoryVariables, revalidateOneHour)
                .then(data => data.productsByCategory)
                .catch(err => console.error(err))

            productsData = {
                products: productsByCategoryData?.products,
                totalPages: productsByCategoryData?.totalPages || 0,
                currentPage: productsByCategoryData?.currentPage || 1,
                total: productsByCategoryData?.total || 0
            };
            break;
    }

    return (
        <main className="bg-mist-100">
            <Header />
            {/* Breadcrumb navigation */}


            <div className="container mx-auto px-3 mt-6">
                <Breadcrumb majorCat={minorCategory ? majorCategory : undefined} title={minorCategory ? minorCategory : majorCategory} />

                <BoxHeader
                    initialLinks={initialLinks}
                    article={isArticleCategory}
                    searchCat={isSearchCategory}
                />

                {/* Products/Articles List */}
                <section aria-labelledby="items-heading" className="w-full mt-12">
                    <h2 id="items-heading" className="sr-only">
                        لیست {isArticleCategory ? 'مقالات' : 'محصولات'}
                    </h2>

                    <ul className="flex flex-wrap justify-center sm:gap-12 gap-4 mt-6">
                        {!isArticleCategory ?
                            (isPackageCategory
                                ? packagesData.packages.map((product: any) => (
                                    <li key={product._id} className="sm:w-52 w-40" itemScope itemType="https://schema.org/Product">
                                        <ProductBox
                                            box={false}
                                            {...product}
                                            isPackage
                                        />
                                    </li>
                                ))
                                : productsData?.products.map((product: any) => (
                                    <li key={product._id} className="sm:w-52 w-40" itemScope itemType="https://schema.org/Product">
                                        <ProductBox
                                            box={false}
                                            {...product}
                                        />
                                    </li>
                                ))
                            )
                            : articlesData.articles
                                .slice(pageFilters.page * pageFilters.count - pageFilters.count, pageFilters.page * pageFilters.count)
                                .map(article => (
                                    <li key={article._id} itemScope itemType="https://schema.org/Article">
                                        <ArticleBox {...article} />
                                    </li>
                                ))}
                    </ul>

                    {/* Show articles in search results for products */}
                    {isSearchCategory && !isArticleCategory && articlesData.total > 0 && (
                        <>
                            <h3 className="text-2xl font-bold text-center mt-16 mb-8 text-slate-700">مقالات مرتبط</h3>
                            <ul className="flex flex-wrap justify-center sm:gap-14 gap-4">
                                {articlesData.articles
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
                {(!isArticleCategory && !isPackageCategory && productsData.totalPages > 1) && (
                    <PaginationBox
                        count={productsData.totalPages}
                        currentPage={productsData.currentPage}
                    />
                )}
                {(isPackageCategory && packagesData.totalPages > 1) && (
                    <PaginationBox
                        count={packagesData.totalPages}
                        currentPage={packagesData.currentPage}
                    />
                )}
                {(isArticleCategory && articlesData.totalPages > 1) && (
                    <PaginationBox
                        count={articlesData.totalPages}
                        currentPage={articlesData.currentPage}
                    />
                )}

                {/* Empty State */}
                {(!isArticleCategory && !isPackageCategory && productsData.total === 0) && (
                    <NotFound />
                )}
                {(isPackageCategory && packagesData.total === 0) && (
                    <NotFound />
                )}
                {(isArticleCategory && articlesData.total === 0) && (
                    <NotFound />
                )}

                {/* Description Section */}
                <section aria-labelledby="description-heading" className="flex justify-center items-center flex-wrap gap-10 text-center mt-12">
                    <span className="w-[50%] mx-auto h-1 bg-slate-300 rounded-3xl mb-12"></span>
                    <DescProductBoxes />
                </section>
            </div>

            <Footer />
        </main>
    );
};

function NotFound() {
    return (
        <div className="container px-8 mx-auto" role="status" aria-live="polite">
            <p className="text-2xl text-slate-700 text-center mt-6 mb-20">
                موردی یافت نشد.
            </p>
        </div>
    );
}

export default Category;