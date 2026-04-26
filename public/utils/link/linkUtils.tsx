
import { fetcher } from '@/public/utils/fetcher';

export const isInternalLink = (url: string): boolean => {
    return url.startsWith('/') || url.startsWith('#');
};

export const isInstagramLink = (url: string): boolean => {
    return url.includes('instagram.com') || url.includes('instagr.am');
};

// Function to check if URL is a product or article link
export const isProductOrArticleLink = (url: string): { isProduct: boolean; isArticle: boolean; id: string | null } => {
    const productMatch = url.match(/^\/product\/([a-zA-Z0-9]+)$/);
    const articleMatch = url.match(/^\/article\/([a-zA-Z0-9]+)$/);

    return {
        isProduct: !!productMatch,
        isArticle: !!articleMatch,
        id: productMatch?.[1] || articleMatch?.[1] || null
    };
};

// Function to fetch cover image for product or article
export const fetchCoverImage = async (type: 'product' | 'article', id: string): Promise<string | null> => {
    try {
        const query = type === 'product'
            ? `query GetProduct($id: ID!) { product(id: $id) { cover } }`
            : `query GetArticle($id: ID!) { article(id: $id) { cover } }`;

        const response = await fetcher(query, { id });

        return type === 'product' ? response?.product?.cover : response?.article?.cover;
    } catch (error) {
        console.error(`Error fetching ${type} cover:`, error);
        return null;
    }
}

export const parseBold = (str: string, keyPrefix: string) => {
    const boldRegex = /\*([^*]+)\*/g;
    const boldParts = str.split(boldRegex);
    const nodes: React.ReactNode[] = [];
    for (let j = 0; j < boldParts.length; j++) {
        if (j % 2 === 1) {
            // متن بین دو ستاره
            nodes.push(
                <span key={`${keyPrefix}-bold-${j}`} className="font-bold text-shadow text-2xl text-start">{boldParts[j]}</span>
            );
        } else if (boldParts[j]) {
            nodes.push(
                <span key={`${keyPrefix}-plain-${j}`}>{boldParts[j]}</span>
            );
        }
    }
    return nodes;
};