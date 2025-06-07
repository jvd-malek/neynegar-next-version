import CMSForm from '@/lib/Components/CMS/CMSForm';
import CMSBox from '@/lib/Components/CMS/CMSBox';
import CMSProductBox from '@/lib/Components/CMS/CMSProductBox';
import CMSAddProduct from '@/lib/Components/CMS/CMSAddProduct';
import { linksType } from '@/lib/Types/links';

async function CMS({ activeLink, ticketState, ordersState, searchParams }: any) {
    const search = await searchParams;
    let links: linksType[] = [];
    
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

    const page = {
        page: parseInt(search.page || '1'),
        count: parseInt(search.count || '24'),
        search: search.search || '',
    };
    
    return (
        <>
            {activeLink === 'محصولات' &&
                <>
                    {/* product section start */}
                    {/* <CMSBox type={activeLink} /> */}
                    <CMSProductBox type={activeLink} page={page} links={links} />
                    {/* product section end */}
                </>
            }

            {activeLink === 'ثبت محصول' &&
                <>
                    {/* add product section start */}
                    {/* <h3 className="absolute top-4 -right-2 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                        ثبت محصول
                    </h3>
                    <CMSForm /> */}
                    <CMSAddProduct links={links} />
                    {/* add product section end */}
                </>
            }

            {activeLink === 'مقالات' &&
                <>
                    {/* add product section start */}
                    <h3 className="absolute top-4 -right-2 text-lg rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                        ثبت مقاله
                    </h3>
                    <CMSForm article={true} />
                    {/* add product section end */}

                    {/* product section start */}
                    <CMSBox type={activeLink} />
                    {/* product section end */}

                </>
            }
            {activeLink === 'تیکت‌ها' &&
                <>
                    {/* product section start */}
                    <CMSBox type={activeLink} row={2} ticketState={ticketState} />
                    {/* product section end */}

                </>
            }
            {activeLink === 'سفارشات' &&
                <>
                    {/* product section start */}
                    <CMSBox type={activeLink} row={2} ordersState={ordersState} />
                    {/* product section end */}

                </>
            }

            {activeLink === 'کاربران' &&
                <>
                    {/* user section start */}
                    <CMSBox type={activeLink} row={2} />
                    {/* user section end */}

                </>
            }

            {activeLink === 'تخفیف‌ها' && 'discounts'}
        </>
    );
}

export default CMS;