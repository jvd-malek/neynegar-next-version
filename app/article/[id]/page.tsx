// next 
import Image from 'next/image';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';

// icons
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import RemoveRedEyeRounded from '@mui/icons-material/RemoveRedEyeRounded';

// components
import Header from '@/public/components/header/Header';
import Footer from '@/public/components/footer/Footer';
import CommentComplex from '@/public/components/comment/CommentComplex';
import DescProductBoxes from '@/public/components/home/DescProductBoxes';
import ReadingListButton from '@/public/components/article/ReadingListButton';
import ShareURL from '@/public/components/article/ShareURL';
import Breadcrumb from '@/public/components/breadcrumb/Breadcrumb';
import SuggestedProducts from '@/public/components/product/SuggestedProducts';

const RelatedLinks = dynamic(() => import('@/public/components/article/RelatedLinks'), {
    loading: () => (
        <div className="animate-pulse space-y-4 w-full">
            <div className="h-12 w-full bg-gray-300 rounded"></div>
            <div className="h-12 w-full bg-gray-300 rounded"></div>
            <div className="h-12 w-full bg-gray-300 rounded"></div>
            <div className="h-12 w-full bg-gray-300 rounded"></div>
        </div>
    )
});

// utils
import { fetcher, noCaching, revalidateOneHourByTags } from '@/public/utils/fetcher';
import { BLUR_IMAGE, customLoader } from '@/public/utils/product/ProductBoxUtils';
import { formatPersianDate } from '@/public/utils/dateFormatter';

const ContentWithLinks = dynamic(() => import('@/public/utils/link/linkParser'), {
    loading: () => (
        <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-300 rounded"></div>
            <div className="h-8 w-full bg-gray-200 rounded"></div>
            <div className="h-8 w-70 bg-gray-200 rounded"></div>
            <div className="h-8 w-full bg-gray-200 rounded"></div>
        </div>
    )
});

// queries
import { GET_ARTICLE_BY_ID, INCREASE_ARTICLE_VIEW } from '@/public/graphql/articleQueries';
import { GET_COMMENTS_BY_ID } from '@/public/graphql/commentQueries';

// types
import { articleSingleType } from '@/public/types/article';
import { paginatedCommentsType } from '@/public/types/comment';
import { GET_USER_BY_TOKEN } from '@/public/graphql/userQueries';
import { userType } from '@/public/types/user';
import ContentList from '@/public/components/article/ContentList';

type CombinedContentItem = {
    content: string;
    subtitle: string;
    image: string | null;
};


const articleDataFetcher = async (id: string) => {
    const articleData = await fetcher(GET_ARTICLE_BY_ID, { id }, revalidateOneHourByTags([`article-${id}`]));
    if (!articleData) {
        redirect("/404")
    }
    return articleData?.article
}

const commentDataFetcher = async (id: string, type: string, page: number, limit: number) => {
    const commentData = await fetcher(GET_COMMENTS_BY_ID, { id, type, page, limit }, noCaching);
    return commentData?.commentsById
}

const userDataFetcher = async (jwt: string) => {
    const userData = await fetcher(GET_USER_BY_TOKEN, {}, noCaching, jwt);
    return userData?.userByToken
}

export async function generateMetadata({ params }: any) {
    const { id } = await params;
    try {
        const article: articleSingleType = await articleDataFetcher(id)
        const imageUrl = `https://api.neynegar1.ir/uploads/${article?.cover}`;

        return {
            title: `${article?.title} | نی نگار`,
            description: article?.desc?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 160) || "مقاله از نی نگار",
            imageUrl: imageUrl,
            alternates: {
                canonical: `https://neynegar1.ir/article/${id}`,
                languages: {
                    'fa-IR': `https://neynegar1.ir/article/${id}`,
                },
            },
            openGraph: {
                title: `${article?.title} | نی نگار`,
                description: article?.desc?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 160) || "توضیحات مقاله",
                url: `https://neynegar1.ir/article/${id}`,
                type: 'article',
                images: [
                    {
                        url: imageUrl,
                        width: 800,
                        height: 600,
                        alt: article?.title,
                    },
                ],
                siteName: 'نی نگار',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${article?.title} | نی نگار`,
                description: article?.desc?.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 160) || "توضیحات مقاله",
                images: [imageUrl],
            },
            keywords: [
                article?.title,
                article?.authorId.firstname,
                article?.authorId.lastname,
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

async function Article({ params, searchParams }: any) {
    const { id } = await params;
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt")?.value
    const { page: searchPage, count } = await searchParams;
    const page = {
        page: parseInt(searchPage || '1'),
        count: parseInt(count || '10')
    };

    // Increment article views
    await fetcher(INCREASE_ARTICLE_VIEW, { id }, noCaching);

    const article: articleSingleType = await articleDataFetcher(id);
    const comments: paginatedCommentsType = await commentDataFetcher(id, "Article", page.page, page.count)
    const user: userType | null = jwt ? await userDataFetcher(jwt) : null

    // Create combined content array with proper typing
    const combinedContent: CombinedContentItem[] = article.content.map((content: string, index: number) => ({
        content,
        subtitle: article.subtitles?.[index] || '',
        image: article.images?.[index] || null
    }));

    const isInReadingList = user?.readingList.some((item) => item.articleId._id === id) || false

    return (
        <>
            <Header />

            <main className='container mx-auto px-3'>
                <Breadcrumb majorCat={article.majorCat} minorCat={article.minorCat} title={article.title} />

                <div className="lg:grid grid-cols-12 items-start gap-6 mt-6">

                    {/* article section */}
                    <section className="col-start-1 col-end-9 w-full bg-white rounded-lg p-6 font-medium">

                        <h1 className="border-b font-bold border-mist-200 border-solid pb-4 text-xl">
                            {article?.title}
                        </h1>

                        <div className="flex justify-between items-center gap-4 mt-6 text-mist-600 flex-wrap">
                            <div className="flex gap-6 items-center sm:justify-center flex-wrap">
                                <div className="flex items-center gap-2">
                                    <PersonOutlineRoundedIcon />
                                    <span className="line-clamp-1">
                                        {article?.authorId?.fullName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarMonthRoundedIcon />
                                    <span className="pt-1">
                                        {formatPersianDate(Number(article?.createdAt))}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RemoveRedEyeRounded />
                                    <span className="pt-1">{article?.views || 0} بازدید</span>
                                </div>
                            </div>
                            <ReadingListButton
                                articleId={id}
                                isInReadingList={isInReadingList}
                                userId={user?._id}
                            />
                        </div>

                        {/* Cover Image */}
                        <div className="mt-8 rounded-xl p-4 w-fit mx-auto">
                            <Image
                                src={article?.cover}
                                alt={article?.title}
                                width={800}
                                height={400}
                                loader={customLoader}
                                placeholder="blur"
                                blurDataURL={BLUR_IMAGE}
                                loading='lazy'
                                className="rounded-lg w-full"
                            />
                        </div>

                        {/* Description */}
                        <div className="mt-8 text-lg leading-relaxed">
                            <ContentWithLinks content={article?.desc || ''} />
                        </div>

                        <div className="lg:hidden">
                            <ContentList titles={article.subtitles} />
                        </div>

                        {/* content */}
                        <div className="mt-8">
                            {combinedContent.map((item: CombinedContentItem, index: number) => (
                                <div key={index} id={`section-${index}`} className="mb-8 scroll-mt-32">
                                    {item.subtitle && (
                                        <h2 className="text-xl font-bold text-shadow mb-4">{item.subtitle}</h2>
                                    )}
                                    {item?.image && (
                                        <div className="my-4">
                                            <Image
                                                src={item.image}
                                                alt={item.subtitle || `تصویر ${index + 1}`}
                                                width={800}
                                                height={400}
                                                loading='lazy'
                                                loader={customLoader}
                                                placeholder="blur"
                                                blurDataURL={BLUR_IMAGE}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    )}
                                    <div className="text-lg leading-loose">
                                        <ContentWithLinks content={item.content} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* links section */}
                    <section className="col-start-9 col-end-13 flex flex-col justify-center items-center gap-6 w-full mt-6 lg:mt-0">
                        <div className="lg:block hidden">
                            <ContentList titles={article.subtitles} />
                        </div>
                        <ShareURL title={article.title} link={`https://neynegar1.ir/article/${id}`} />
                        <RelatedLinks article={article} />
                    </section>

                </div>

                {/* Comments section */}
                <section className="grid gap-6 mb-10 mt-6 grid-cols-2">
                    <CommentComplex
                        ban={user ? user.status?.includes("ban") : false}
                        commentsData={comments || { comments: [], totalPages: 0, currentPage: 1, total: 0 }}
                        id={id}
                        targetType="Article"
                    />
                </section>

                {/* Suggested products */}
                <SuggestedProducts
                    id={id}
                    majorCat="مقالات"
                    minorCat={id}
                    cat="کتاب"
                />

                {/* Product description boxes */}
                <div className="flex justify-center items-center flex-wrap sm:gap-8 gap-10 mt-26 text-center">
                    <DescProductBoxes />
                </div>
            </main>

            <Footer />
        </>
    );
}

export default Article;