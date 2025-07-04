import { linksType } from '@/lib/Types/links';
import CMSProductBox from '@/lib/Components/CMS/CMSProductBox';
import CMSAddProduct from '@/lib/Components/CMS/CMSAddProduct';
import CMSAddAuthor from '@/lib/Components/CMS/CMSAddAuthor';
import CMSUserBox from '@/lib/Components/CMS/CMSUserBox';
import CMSOrderBox from '@/lib/Components/CMS/CMSOrderBox';
import CMSTicketBox from '@/lib/Components/CMS/CMSTicketBox';
import CMSArticleBox from '@/lib/Components/CMS/CMSArticleBox';
import CMSAddArticle from '@/lib/Components/CMS/CMSAddArticle';

async function CMS({ activeLink, searchParams }: any) {
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

    return (
        <>
            {activeLink === 'محصولات' &&
                <CMSProductBox type={activeLink} page={page} links={links} authors={authors} />
            }

            {activeLink === 'ثبت محصول' &&
                <CMSAddProduct links={links} authors={authors} />
            }

            {activeLink === 'مقالات' &&
                <CMSArticleBox type={activeLink} page={page} links={links} authors={authors} />
            }
            {activeLink === 'ثبت مقاله' &&
                <CMSAddArticle links={links} authors={authors} />
            }

            {activeLink === 'تیکت‌ها' &&
                <CMSTicketBox type={activeLink} page={page} />
            }

            {activeLink === 'سفارشات' &&
                <CMSOrderBox type={activeLink} page={page} />
            }

            {activeLink === 'کاربران' &&
                <CMSUserBox type={activeLink} page={page} />
            }

            {activeLink === 'ثبت نویسنده' &&
                <>
                    {/* برای افزودن نویسنده جدید */}
                    <CMSAddAuthor type="add" />

                    {/* برای ویرایش نویسندگان */}
                    <CMSAddAuthor type="edit" />
                </>
            }

            {/* {activeLink === 'تخفیف‌ها' && 'discounts'} */}
        </>
    );
}

export default CMS;