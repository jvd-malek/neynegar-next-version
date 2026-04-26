"use client"

// next and react
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// utils
import { fetchCoverImage, isProductOrArticleLink } from '@/public/utils/link/linkUtils';

type InternalLinkProps = {
    url: string;
    linkText: string;
    keyPrefix: string;
}

const InternalLink = ({ url, linkText, keyPrefix }: InternalLinkProps) => {

    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const linkInfo = isProductOrArticleLink(url);

    useEffect(() => {
        const loadCoverImage = async () => {
            if (linkInfo.id && (linkInfo.isProduct || linkInfo.isArticle)) {
                setIsLoading(true);
                setHasError(false);
                const type = linkInfo.isProduct ? 'product' : 'article';
                const cover = await fetchCoverImage(type, linkInfo.id);
                setCoverImage(`https://api.neynegar1.ir/uploads/${cover}`);
                setIsLoading(false);
                if (!cover) {
                    setHasError(true);
                }
            } else {
                setIsLoading(false);
            }
        };

        loadCoverImage();
    }, [linkInfo.id, linkInfo.isProduct, linkInfo.isArticle]);
    return (
        <div className="mt-2 ">
            <Link
                key={`link-${keyPrefix}`}
                href={url}
                className={`text-green-600 hover:text-green-800 ring-green-300 ring-2 ring-offset-2 underline decoration-green-300 hover:decoration-green-500 transition-all duration-200 bg-green-100 hover:bg-green-200 pl-1.5 rounded-md inline-flex items-center gap-1.5`}
                title={url}
                aria-label={`لینک | ${linkText}`}
            >
                {isLoading && (
                    <div className="w-8.75 h-8.75 bg-gray-200 rounded-sm animate-pulse"></div>
                )}
                {coverImage && !isLoading && !hasError && (
                    <Image
                        src={coverImage}
                        alt={linkText}
                        width={40}
                        height={40}
                        loading='lazy'
                        quality={50}
                        className="rounded-sm object-cover"
                        onError={() => setHasError(true)}
                    />
                )}
                <span className="text-sm line-clamp-1">
                    {linkInfo.isArticle && "مقاله: "}
                    {linkText}
                </span>
                <span className="text-xs">🔗</span>
            </Link>
        </div>
    );
};

export default InternalLink;