// next
import Link from "next/link";

// types
import { articleSingleType } from "@/public/types/article";


function RelatedLinks({ article }: { article: articleSingleType }) {
    if (!article) return null;

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const allLinks = new Map<string, { text: string; url: string; type: 'article' | 'product' }>();
    let articleLinks = 0;
    let productLinks = 0;
    let externalLinks = 0;

    // Extract from description
    let match;
    while ((match = linkRegex.exec(article.desc || '')) !== null) {
        const [, text, url] = match;
        if (url.startsWith('/article/')) {
            allLinks.set(url, { text, url, type: 'article' });
            articleLinks++;
        } else if (url.startsWith('/product/')) {
            allLinks.set(url, { text, url, type: 'product' });
            productLinks++;
        } else {
            externalLinks++;
        }
    }

    // Extract from content sections
    article.content?.forEach((content: string) => {
        while ((match = linkRegex.exec(content)) !== null) {
            const [, text, url] = match;
            if (url.startsWith('/article/')) {
                allLinks.set(url, { text, url, type: 'article' });
                articleLinks++;
            } else if (url.startsWith('/product/')) {
                allLinks.set(url, { text, url, type: 'product' });
                productLinks++;
            } else {
                externalLinks++;
            }
        }
    });

    const links = Array.from(allLinks.values());

    if (links.length === 0) return null;

    return (
        <div className="bg-white rounded-lg p-6 w-full">
            <h3 className="text-lg font-bold">لینک‌های مرتبط</h3>
            <div className="grid gap-3 lg:grid-cols-1 md:grid-cols-2 mt-6">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url}
                        className="flex items-center gap-3 p-3 bg-mist-100 rounded-lg hover:bg-slate-200 active:bg-slate-200 transition-colors duration-200 text-sm"
                    >
                        <div className={`w-3 h-3 rounded-full ${link.type === 'article' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                        <div className="flex-1">
                            <div className="font-bold line-clamp-1">{link.text}</div>
                            <div className="text-xs text-mist-500">
                                {link.type === 'article' ? 'مقاله' : 'محصول'}
                            </div>
                        </div>
                        <div className="text-mist-500">
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

export default RelatedLinks;