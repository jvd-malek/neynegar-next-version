// icons
import { isInstagramLink } from '@/public/utils/link/linkUtils';

// utils
import InstagramIcon from '@mui/icons-material/Instagram';

type ExternalLinkProps = {
    url: string;
    linkText: string;
    keyPrefix: string;
}

const ExternalLink = ({ url, linkText, keyPrefix }: ExternalLinkProps) => {

    const isInstagram = isInstagramLink(url);

    return (
        <div className="mt-2">
            <a
                key={`link-${keyPrefix}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isInstagram
                    ? `text-rose-600 ring-rose-300 ring-2 ring-offset-2 hover:text-rose-800 underline decoration-rose-300 hover:decoration-rose-500 bg-rose-100 hover:bg-rose-200`
                    : `text-blue-600 ring-blue-300 ring-2 ring-offset-2 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 bg-blue-100 hover:bg-blue-200`
                    } transition-all duration-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1`}
                title={url}
                aria-label={`لینک | ${linkText}`}
            >
                {isInstagram && <InstagramIcon sx={{ fontSize: 16 }} />}
                <span className="text-sm line-clamp-1">{linkText}</span>
                <span className="text-xs">↗</span>
            </a>
        </div>
    );
};

export default ExternalLink;