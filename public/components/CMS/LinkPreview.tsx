'use client';

import  ContentWithLinks  from '@/public/utils/link/linkParser';
import InstagramIcon from '@mui/icons-material/Instagram';

interface LinkPreviewProps {
    content: string;
    title?: string;
}

function LinkPreview({ content, title = "پیش‌نمایش لینک‌ها" }: LinkPreviewProps) {
    // Ensure content is always a string
    const safeContent = typeof content === 'string' ? content : String(content || '');
    
    if (!safeContent || safeContent.trim() === '') return null;

    // Function to check if URL is Instagram
    const isInstagramLink = (url: string): boolean => {
        return url.includes('instagram.com') || url.includes('instagr.am');
    };

    // Extract all links from content
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links: Array<{ text: string; url: string; isInternal: boolean; isInstagram: boolean }> = [];
    let match;

    while ((match = linkRegex.exec(safeContent)) !== null) {
        const [, text, url] = match;
        const isInternal = url.startsWith('/') || url.startsWith('#');
        const isInstagram = !isInternal && isInstagramLink(url);
        links.push({ text, url, isInternal, isInstagram });
    }

    if (links.length === 0) return null;

    return (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
            <div className="space-y-2">
                {links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                            link.isInternal 
                                ? 'bg-green-500' 
                                : link.isInstagram 
                                    ? 'bg-rose-500' 
                                    : 'bg-blue-500'
                        }`}>
                            {link.isInternal ? 'داخلی' : link.isInstagram ? 'اینستاگرام' : 'خارجی'}
                        </span>
                        {link.isInstagram && <InstagramIcon sx={{ fontSize: 14 }} />}
                        <span className="text-gray-600">{link.text}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-500 font-mono">{link.url}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-3 p-2 bg-white rounded border">
                <h5 className="text-xs font-medium text-gray-700 mb-1">نمایش نهایی:</h5>
                <div className="text-sm text-gray-800">
                    <ContentWithLinks content={content} />
                </div>
            </div>
        </div>
    );
}

export default LinkPreview; 