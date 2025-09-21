import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { articleType } from '@/lib/Types/article';
import { productCoverType } from '@/lib/Types/product';
import Box from '@/lib/Components/ProductBoxes/Box';
import CommentComplex from '@/lib/Components/Comment/CommentComplex';
import Link from 'next/link';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';
import Image from 'next/image';

import { cookies } from 'next/headers';
import DescProductBoxes from '@/lib/Components/ProductBoxes/DescProductBoxes';
import { ContentWithLinks } from '@/lib/utils/linkParser';
import ReadingListButton from '../../../lib/Components/ArticleBoxes/ReadingListButton';
import CopyArticleId from '../../../lib/Components/ArticleBoxes/CopyArticleId';

// Component to extract and display all related links from article
function AllRelatedLinks({ article }: { article: any }) {
    if (!article) return null;

    // Extract all internal links from description and content
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const allLinks = new Map<string, { text: string; url: string; type: 'article' | 'product' }>();

    // Extract from description
    let match;
    while ((match = linkRegex.exec(article.desc || '')) !== null) {
        const [, text, url] = match;
        if (url.startsWith('/article/')) {
            allLinks.set(url, { text, url, type: 'article' });
        } else if (url.startsWith('/product/')) {
            allLinks.set(url, { text, url, type: 'product' });
        }
    }

    // Extract from content sections
    article.content?.forEach((content: string) => {
        while ((match = linkRegex.exec(content)) !== null) {
            const [, text, url] = match;
            if (url.startsWith('/article/')) {
                allLinks.set(url, { text, url, type: 'article' });
            } else if (url.startsWith('/product/')) {
                allLinks.set(url, { text, url, type: 'product' });
            }
        }
    });

    const links = Array.from(allLinks.values());

    if (links.length === 0) return null;

    return (
        <div className="mt-8 bg-slate-200 rounded-xl py-3 px-4 relative">
            <h3 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">لینک‌های مرتبط</h3>
            <div className="grid gap-3 md:grid-cols-2 mt-18">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                    >
                        <div className={`w-3 h-3 rounded-full ${link.type === 'article' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                        <div className="flex-1">
                            <div className="font-medium text-slate-900">{link.text}</div>
                            <div className="text-xs text-slate-500">
                                {link.type === 'article' ? 'مقاله' : 'محصول'}
                            </div>
                        </div>
                        <div className="text-slate-400">
                            <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Component to show link statistics
function LinkStats({ article }: { article: any }) {
    if (!article) return null;

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let articleLinks = 0;
    let productLinks = 0;
    let externalLinks = 0;

    // Count links in description
    let match;
    while ((match = linkRegex.exec(article.desc || '')) !== null) {
        const [, , url] = match;
        if (url.startsWith('/article/')) {
            articleLinks++;
        } else if (url.startsWith('/product/')) {
            productLinks++;
        } else {
            externalLinks++;
        }
    }

    // Count links in content
    article.content?.forEach((content: string) => {
        while ((match = linkRegex.exec(content)) !== null) {
            const [, , url] = match;
            if (url.startsWith('/article/')) {
                articleLinks++;
            } else if (url.startsWith('/product/')) {
                productLinks++;
            } else {
                externalLinks++;
            }
        }
    });

    const totalLinks = articleLinks + productLinks + externalLinks;

    if (totalLinks === 0) return null;

    return (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">آمار لینک‌ها</h4>
            <div className="flex flex-wrap gap-4 text-xs">
                {articleLinks > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600">{articleLinks} لینک مقاله</span>
                    </div>
                )}
                {productLinks > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600">{productLinks} لینک محصول</span>
                    </div>
                )}
                {externalLinks > 0 && (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-slate-600">{externalLinks} لینک خارجی</span>
                    </div>
                )}
            </div>
        </div>
    );
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            const delay = Math.pow(2, 3 - retries) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

export async function generateMetadata({ params }: any) {
    const { id } = await params;

    try {
        const articleGraphData = await fetchWithRetry(
            `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: `
                        query GetArticle($id: ID!) {
                            article(id: $id) {
                                _id
                                title
                                desc
                                content
                                subtitles
                                images
                                popularity
                                views
                                authorId {
                                    _id
                                    firstname
                                    lastname
                                }
                                cover
                                createdAt
                                updatedAt
                            }
                        }
                    `,
                    variables: { id }
                }),
                next: {
                    revalidate: 3600,
                    tags: [`article-${id}`]
                }
            }
        );
        const stateGraph = await articleGraphData.json()
        const state: articleType = stateGraph.data

        const imageUrl = `https://api.neynegar1.ir/uploads/${state?.article?.cover}`;

        return {
            title: `${state.article.title} | نی نگار`,
            description: state.article.desc?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 160) || "مقاله از نی نگار",
            alternates: {
                canonical: `https://neynegar1.ir/article/${id}`,
                languages: {
                    'fa-IR': `https://neynegar1.ir/article/${id}`,
                },
            },
            openGraph: {
                title: `${state.article.title} | نی نگار`,
                description: state.article.desc?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 160) || "توضیحات مقاله",
                url: `https://neynegar1.ir/article/${id}`,
                type: 'article',
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 600,
                        alt: state.article.title,
                    },
                ],
                siteName: 'نی نگار',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${state.article.title} | نی نگار`,
                description: state.article.desc?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 160) || "توضیحات مقاله",
                images: [imageUrl],
            },
            keywords: [
                state.article.title,
                state.article.authorId.firstname,
                state.article.authorId.lastname,
            ].filter(Boolean),
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'مقاله | نی نگار',
            description: 'صفحه مقالات نی نگار',
        };
    }
}

// Add type for combined content
type CombinedContentItem = {
    content: string;
    subtitle: string;
    image: string | null;
};

async function Article({ params, searchParams }: any) {
    const { id } = await params;
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');
    const { page: searchPage, count } = await searchParams;
    const page = {
        page: parseInt(searchPage || '1'),
        count: parseInt(count || '10')
    };
    // Increment article views
    await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: `
                mutation IncrementArticleViews($id: ID!) {
                    incrementArticleViews(id: $id) {
                        _id
                        views
                    }
                }
            `,
            variables: { id }
        }),
        cache: "no-store"
    });

    const articleGraphData = await fetch(
        `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    query GetArticle($id: ID!) {
                        article(id: $id) {
                            _id
                            title
                            desc
                            content
                            subtitles
                            images
                            popularity
                            views
                            authorId {
                                _id
                                fullName
                            }
                            cover
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: { id }
            }),
            next: { revalidate: 3600 }
        }
    );

    const commentsGraphData = await fetch(
        `${process.env.NEXT_BACKEND_GRAPHQL_URL!}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: `
                    query CommentsByArticle($id: ID!, $page: Int, $limit: Int) {
                        commentsByArticle(articleId: $id, page: $page, limit: $limit) {
                            comments {
                                _id
                                txt
                                star
                                status
                                like
                                articleId { _id }
                                userId {
                                    _id
                                    name
                                    phone
                                }
                                createdAt
                                updatedAt
                                replies {
                                    txt
                                    userId {
                                        _id
                                        name
                                        phone
                                    }
                                    like
                                }
                            }
                            totalPages
                            currentPage
                            total
                        }
                    }
                `,
                variables: {
                    id,
                    page: page.page,
                    limit: page.count
                }
            }),
            cache: "no-store"
        }
    );

    const stateGraph = await articleGraphData.json()
    const commentsGraph = await commentsGraphData.json()
    const state: articleType = { article: stateGraph.data.article, comments: commentsGraph.data.commentsByArticle }

    // Create combined content array with proper typing
    const combinedContent: CombinedContentItem[] = state.article.content.map((content: string, index: number) => ({
        content,
        subtitle: state.article.subtitles?.[index] || '',
        image: state.article.images?.[index] || null
    }));

    // Fetch user verification status and reading list
    const userData = jwt?.value ? await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
        method: "POST",
        headers: {
            'authorization': jwt?.value as string,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                query {
                    userByToken {
                        _id
                        name
                        status
                        readingList {
                            articleId {
                                _id
                            }
                        }
                    }
                }
            `
        }),
        next: { revalidate: 3600 }
    }).then(data => data.json()) : undefined

    const ban: boolean = jwt ? userData?.data?.userByToken?.status == "banUser" : false
    const isInReadingList = userData?.data?.userByToken?.readingList?.some((item: any) => item.articleId._id === id) || false

    // Fetch suggested products
    const sugData = await fetch(`${process.env.NEXT_BACKEND_GRAPHQL_URL!}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                query GetSuggestedProducts($majorCat: String!, $minorCat: String, $cat: String) {
                    suggestedProducts(majorCat: $majorCat, minorCat: $minorCat, cat: $cat) {
                        _id
                        title
                        desc
                        price {
                            price
                        }
                        discount {
                            discount
                            date
                        }
                        popularity
                        cover
                        majorCat
                        minorCat
                        showCount
                    }
                }
            `,
            variables: {
                majorCat: "مقالات",
                minorCat: id,
                cat: "کتاب"
            }
        }),
        next: { revalidate: 3600 }
    }).then(data => data.json())

    const sugProduct: productCoverType = sugData.data.suggestedProducts

    return (
        <>
            <div className="sm:w-[85vw] w-[98vw] mx-auto mt-26 relative px-2">
                {/* Breadcrumb navigation */}
                <nav aria-label="breadcrumb" className="bg-slate-200 rounded-xl py-3 px-4 flex justify-start items-center gap-4 font-medium">
                    {state?.article && (
                        <>
                            <Link href="/" className="relative pl-6 flex items-center" aria-label="خانه">
                                <HomeRoundedIcon />
                                <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                                    <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                                </span>
                            </Link>
                            <Link href="/category/مقالات" className="relative pl-6">
                                <p className="line-clamp-1">
                                    مقالات
                                </p>
                                <span className="text-slate-50 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                                    <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                                </span>
                            </Link>
                            <p className="line-clamp-1" aria-current="page">{state.article.title}</p>
                        </>
                    )}
                </nav>

                {/* Article section */}
                <section className="grid gap-10 my-10 lg:grid-cols-9 grid-cols-1">
                    {/* Article content */}
                    <div className="col-start-1 lg:col-end-7 lg:row-start-1 row-start-2 lg:row-end-4 w-full relative bg-slate-100 rounded-xl pt-9 pb-4 px-6 text-black">
                        <h1 className="border-b border-white border-solid pb-10 text-xl text-slate-900">
                            {state?.article?.title}
                        </h1>

                        <div className="flex justify-between items-center gap-4 mt-6 text-slate-500 flex-wrap">
                            <div className="flex items-center gap-2">
                                <div className="">
                                    <PersonOutlineRoundedIcon />
                                </div>
                                <span className=" line-clamp-1">
                                    {state?.article?.authorId?.fullName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="">
                                    <CalendarMonthRoundedIcon />
                                </div>
                                <span className="pt-1">{state?.article?.createdAt ? new Date(Number(state?.article?.createdAt)).toLocaleDateString('fa-IR') : 'نامشخص'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="">
                                    <RemoveRedEyeOutlinedIcon />
                                </div>
                                <span className="pt-1">{state?.article?.views || 0} بازدید</span>
                            </div>
                            {state?.article &&
                                <p className=" flex gap-1 justify-center items-center">
                                    <span className=" text-amber-300">
                                        <StarRoundedIcon />
                                    </span>
                                    {state.article?.popularity.toLocaleString('fa-IR')}
                                </p>
                            }
                        </div>

                        {/* Reading List Button - Prominent placement */}
                        {jwt && (
                            <div className="mt-6 flex justify-center">
                                <ReadingListButton
                                    articleId={id}
                                    isInReadingList={isInReadingList}
                                    userId={userData?.data?.userByToken?._id}
                                />
                            </div>
                        )}


                        {/* Cover Image */}
                        <div className="mt-8 rounded-xl overflow-hidden p-4 shadow bg-white relative w-fit mx-auto lg:mb-0 md:mb-4">
                            <Image
                                src={`https://api.neynegar1.ir/uploads/${state?.article?.cover}`}
                                alt={state?.article?.title}
                                width={800}
                                height={400}
                                className="rounded-lg w-full transition-transform duration-300 hover:scale-110 active:scale-110"
                            />
                        </div>

                        {/* Table of Contents */}
                        {state?.article?.subtitles && state.article.subtitles.length > 0 && (
                            <div className="mt-8 bg-white rounded-xl p-6 shadow">
                                <h2 className="text-lg font-bold mb-4">فهرست مطالب</h2>
                                <ul className="space-y-2">
                                    {state.article.subtitles.map((subtitle, index) => (
                                        <Link href={`#section-${index}`} key={index} className='flex justify-between items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200'>
                                            <p
                                                className="text-slate-700 hover:text-slate-900 transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <span className="text-slate-400">{index + 1}.</span>
                                                {subtitle}
                                            </p>
                                            <div className="text-slate-400">
                                                <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mt-8 text-slate-700">
                            <p className="text-lg leading-relaxed">
                                <ContentWithLinks content={state?.article?.desc || ''} />
                            </p>
                        </div>

                        <div className="mt-8 prose prose-lg max-w-none">
                            {combinedContent.map((item: CombinedContentItem, index: number) => (
                                <div key={index} id={`section-${index}`} className="mb-8 scroll-mt-32">
                                    {item.subtitle && (
                                        <h2 className="text-xl font-bold mb-4">{item.subtitle}</h2>
                                    )}
                                    {item.image && (
                                        <div className="my-4">
                                            <Image
                                                src={`https://api.neynegar1.ir/uploads/${item.image}`}
                                                alt={item.subtitle || `تصویر ${index + 1}`}
                                                width={800}
                                                height={400}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    )}
                                    <ContentWithLinks content={item.content} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Share section */}
                    <CopyArticleId id={id} />

                    {/* Suggested products */}
                    <div className="lg:col-start-7 lg:col-end-10 col-start-1 lg:row-start-2 row-start-3 h-fit w-full relative bg-slate-200 rounded-xl pt-14 pb-4 px-6">
                        <h2 className="absolute top-4 -right-2 text-xl rounded-r-lg rounded-l-xl pr-6 pl-4 py-2 bg-black text-white">
                            محصولات مرتبط
                        </h2>
                        {sugProduct && sugProduct.length > 0 ? (
                            <div className="w-[90%] lg:w-[60%] md:w-full mx-auto mt-4">
                                <Box books={sugProduct.slice(0, 10)} />
                            </div>
                        ) : (
                            <p className="text-center flex items-center gap-2 mt-4 mb-4 justify-center w-full h-full">
                                محصول مرتبطی یافت نشد.
                                <SentimentDissatisfiedTwoToneIcon />
                            </p>
                        )}
                    </div>
                </section>

                {/* Related Links Section */}
                <section className="mb-10">
                    <AllRelatedLinks article={state.article} />
                    <LinkStats article={state.article} />
                </section>

                {/* Comments section */}
                <section className="grid gap-10 mb-10 grid-cols-2">
                    <CommentComplex
                        ban={Boolean(userData?.data?.userByToken?.name && ban)}
                        commentsData={state?.comments || { comments: [], totalPages: 0, currentPage: 1, total: 0 }}
                        id={id}
                        article
                    />
                </section>

                {/* Product description boxes */}
                <div className="flex justify-center items-center flex-wrap sm:gap-8 gap-10 mt-24 text-center">
                    <DescProductBoxes />
                </div>
            </div>
        </>
    );
}

export default Article;