import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { articleType } from '@/lib/Types/article';
import { productCoverType } from '@/lib/Types/product';
import Box from '@/lib/Components/ProductBoxes/Box';
import CommentComplex from '@/lib/Components/Comment/CommentComplex';
import { Bounce, ToastContainer } from 'react-toastify';
import Link from 'next/link';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import SentimentDissatisfiedTwoToneIcon from '@mui/icons-material/SentimentDissatisfiedTwoTone';
import Image from 'next/image';

import { cookies } from 'next/headers';
import DescProductBoxes from '@/lib/Components/ProductBoxes/DescProductBoxes';

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

        const imageUrl = `https://api.neynegar1.ir/imgs/${state?.article?.cover}`;

        return {
            title: `${state.article.title} | نی نگار`,
            description: state.article.desc?.substring(0, 160) || "مقاله از نی نگار",
            alternates: {
                canonical: `https://neynegar1.ir/article/${id}`,
                languages: {
                    'fa-IR': `https://neynegar1.ir/article/${id}`,
                },
            },
            openGraph: {
                title: `${state.article.title} | نی نگار`,
                description: state.article.desc?.substring(0, 160) || "توضیحات مقاله",
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
                description: state.article.desc?.substring(0, 160) || "توضیحات مقاله",
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

async function Article({ params , searchParams}: any) {
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
            next: { revalidate: 1 }
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

    // Fetch user verification status
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
                        name
                        status
                    }
                }
            `
        }),
        next: { revalidate: 3600 }
    }).then(data => data.json()) : undefined

    const ban: boolean = jwt ? userData.data.userByToken.status == "banUser" : false

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
            <div className="sm:w-[85vw] w-[98vw] mx-auto mt-32 relative px-2">
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
                            <Link href="/articles" className="relative pl-6">
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
                    <div className="col-start-1 lg:col-end-7 lg:row-start-1 row-start-2 lg:row-end-4 w-full relative bg-slate-200 rounded-xl pt-9 pb-4 px-6 text-slate-700">
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

                        {/* Cover Image */}
                        <div className="mt-8">
                            <Image
                                src={`https://api.neynegar1.ir/imgs/${state?.article?.cover}`}
                                alt={state?.article?.title}
                                width={800}
                                height={400}
                                className="rounded-lg w-full"
                            />
                        </div>

                        {/* Table of Contents */}
                        {state?.article?.subtitles && state.article.subtitles.length > 0 && (
                            <div className="mt-8 bg-white rounded-xl p-6 shadow-cs">
                                <h2 className="text-lg font-bold mb-4">فهرست مطالب</h2>
                                <ul className="space-y-2">
                                    {state.article.subtitles.map((subtitle, index) => (
                                        <li key={index}>
                                            <a
                                                href={`#section-${index}`}
                                                className="text-slate-700 hover:text-slate-900 transition-colors duration-200 flex items-center gap-2"
                                            >
                                                <span className="text-slate-400">{index + 1}.</span>
                                                {subtitle}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mt-8 text-slate-700">
                            <p className="text-lg leading-relaxed">{state?.article?.desc}</p>
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
                                                src={`https://api.neynegar1.ir/imgs/${item.image}`}
                                                alt={item.subtitle || `تصویر ${index + 1}`}
                                                width={800}
                                                height={400}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    )}
                                    <div className="whitespace-pre-line">{item.content}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Share section */}
                    <div className="lg:col-start-7 lg:col-end-10 lg:row-start-1 col-start-1 h-fit w-full relative bg-slate-200 rounded-xl pt-9 pb-4 px-6">
                        <div className="flex items-center border-white border-b border-solid pb-6 text-lg text-slate-900 gap-3">
                            <div className="">
                                <ShareRoundedIcon />
                            </div>
                            <p className="">
                                اشتراک‌گذاری مطلب
                            </p>
                        </div>
                        <div className="flex items-center justify-between cursor-pointer mt-6 mb-2 py-1 px-2 rounded-lg text-lg relative gap-3 text-slate-800 bg-slate-400">
                            <div className="">
                                <InsertLinkRoundedIcon />
                            </div>
                            <p className="line-clamp-1 overflow-y-scroll text-xs" dir='ltr'>{`https://neynegar1.ir/article/${id}`}</p>
                        </div>
                    </div>

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
                {/* Toast notifications */}
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
            </div>
        </>
    );
}

export default Article;