// next and react
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// components
import CMSProductBox from '@/public/components/CMS/CMSProductBox';
import CMSAddProduct from '@/public/components/CMS/CMSAddProduct';
import CMSAddAuthor from '@/public/components/CMS/CMSAddAuthor';
import CMSUserBox from '@/public/components/CMS/CMSUserBox';
import CMSOrderBox from '@/public/components/CMS/CMSOrderBox';
import CMSTicketBox from '@/public/components/CMS/CMSTicketBox';
import CMSArticleBox from '@/public/components/CMS/CMSArticleBox';
import CMSAddArticle from '@/public/components/CMS/CMSAddArticle';
import CMSAddDiscount from '@/public/components/CMS/CMSAddDiscount';
import CMSDiscountBox from '@/public/components/CMS/CMSDiscountBox';
import ShippingCost from '@/public/components/CMS/ShippingCost';
import CMSAddCourse from '@/public/components/CMS/CMSAddCourse';
import CMSOutOfStackProducts from '@/public/components/CMS/CMSOutOfStackProducts';
import CMSFreeOrders from '@/public/components/CMS/CMSFreeOrders';
import CMSAnalytics from '@/public/components/CMS/CMSAnalytics';

// types
import { linksType } from '@/public/types/links';
import Header from '@/public/components/header/Header';
import Footer from '@/public/components/footer/Footer';
import CMSAddPackage from '@/public/components/CMS/CMSAddPackage';


async function CmsPage({ searchParams }: any) {

    const search = await searchParams;
    let links: linksType[] = [];
    let authors = [];

    try {
        const linkData = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query {
                        links {
                            _id
                            txt
                            path
                            sort
                            subLinks {
                                link
                                path
                                brand
                            }
                        }
                    }
                `
            })
        });

        if (!linkData.ok) {
            throw new Error(`HTTP error! status: ${linkData.status}`);
        }

        const response = await linkData.json();

        if (response.errors) {
            throw new Error(response.errors[0].message);
        }

        links = response.data.links;

    } catch (error) {
        console.error('Error fetching links:', error);
    }

    try {
        const authorData = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query {
                        authors {
                            _id
                            firstname
                            lastname
                            fullName
                        }
                    }
                `
            })
        });

        if (!authorData.ok) {
            throw new Error(`HTTP error! status: ${authorData.status}`);
        }

        const response = await authorData.json();

        if (response.errors) {
            throw new Error(response.errors[0].message);
        }

        authors = response.data.authors;

    } catch (error) {
        console.error('Error fetching links:', error);
    }

    const page = {
        page: parseInt(search.page || '1'),
        count: parseInt(search.count || '24'),
        search: search.search || '',
    };


    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    // اگر JWT وجود نداشت، به صفحه خانه ریدایرکت کن
    if (!jwt) {
        redirect('/');
    }

    const { activeLink = "محصولات" } = await searchParams;

    return (
        <>
            <Header />
            <main className="container mx-auto px-3 select-text mt-6">
                <div className="lg:col-start-2 col-end-5 lg:row-start-1 row-start-2 col-start-1 transition-all relative text-slate-700 rounded-xl p-4">
                    <>
                        {activeLink === 'محصولات' &&
                            <Suspense fallback={<div className="p-4 text-center">در حال بارگذاری...</div>}>
                                <CMSProductBox type={activeLink} page={page} links={links} authors={authors} />
                            </Suspense>
                        }

                        {activeLink === 'ثبت محصول' &&
                            <CMSAddProduct links={links} authors={authors} />
                        }

                        {activeLink === 'ثبت پکیج' &&
                            <CMSAddPackage links={links} />
                        }

                        {activeLink === 'مقالات' &&
                            <Suspense fallback={<div className="p-4 text-center">در حال بارگذاری...</div>}>
                                <CMSArticleBox type={activeLink} page={page} links={links} authors={authors} />
                            </Suspense>
                        }
                        {activeLink === 'ثبت مقاله' &&
                            <CMSAddArticle links={links} authors={authors} />
                        }

                        {activeLink === 'تیکت‌ها' &&
                            <Suspense fallback={<div className="p-4 text-center">در حال بارگذاری...</div>}>
                                <CMSTicketBox type={activeLink} page={page} />
                            </Suspense>
                        }

                        {activeLink === 'سفارشات' &&
                            <Suspense fallback={<div className="p-4 text-center">در حال بارگذاری...</div>}>
                                <CMSOrderBox type={activeLink} page={page} />
                            </Suspense>
                        }

                        {activeLink === 'کاربران' &&
                            <Suspense fallback={<div className="p-4 text-center">در حال بارگذاری...</div>}>
                                <CMSUserBox type={activeLink} page={page} />
                            </Suspense>
                        }

                        {activeLink === 'ثبت نویسنده' &&
                            <>
                                {/* برای افزودن نویسنده جدید */}
                                <CMSAddAuthor type="add" />

                                {/* برای ویرایش نویسندگان */}
                                <CMSAddAuthor type="edit" />
                            </>
                        }

                        {activeLink === 'تخفیف‌ها' &&
                            <>
                                {/* برای افزودن تخفیف جدید */}
                                <CMSAddDiscount links={links} />

                                {/* برای نمایش لیست تخفیف ها و ویرایش آنها */}
                                <CMSDiscountBox />
                            </>
                        }

                        {activeLink === 'هزینه ارسال' &&
                            <ShippingCost />
                        }

                        {activeLink === 'دوره‌ها' &&
                            <CMSAddCourse />
                        }

                        {activeLink === 'کسری' &&
                            <CMSOutOfStackProducts />
                        }

                        {activeLink === 'سفارشات آزاد' &&
                            <CMSFreeOrders />
                        }

                        {activeLink === 'میزان فروش' &&
                            <CMSAnalytics />
                        }
                    </>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default CmsPage;