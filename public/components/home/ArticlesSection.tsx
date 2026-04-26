// next and components
import HomeHeader from "@/public/components/home/HomeHeader";
import ArticleBox from "@/public/components/article/ArticleBox";

// utils and images
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";

// types and queries
import { GET_HOME_PAGE_ARTICLES } from "@/public/graphql/articleQueries";
import { articleAuthorCoverType } from "@/public/types/article";


const ArticlesSection = async () => {
    const articles: articleAuthorCoverType[] = await fetcher(GET_HOME_PAGE_ARTICLES, {}, revalidateOneHour)
        .then(data => data.homePageArticles.articles)
        .catch(err => console.error(err))

    return (
        <section
            className="container mx-auto px-4 mb-16"
            aria-label="بخش مقالات خوشنویسی نی‌نگار"
        >
            <HomeHeader
                title="آخرین مقالات خوشنویسی"
                link="/category/مقالات"
                ariaLabel="مقالات تخصصی خوشنویسی"
            />
            <article className="mt-4 mx-auto md:px-0 px-8 container flex flex-wrap gap-10 justify-center items-center">
                {articles?.map((a) => (
                    <ArticleBox key={a._id} {...a} />
                ))}
            </article>
        </section>
    );
};

export default ArticlesSection;