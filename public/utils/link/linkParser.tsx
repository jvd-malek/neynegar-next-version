// components
import InternalLink from "@/public/components/link/InternalLinks";
import ExternalLink from "@/public/components/link/ExternalLinks";

// utils
import { isInternalLink, parseBold } from "@/public/utils/link/linkUtils";


const parseLinks = (text: string): React.ReactNode[] => {
  if (!text || typeof text !== 'string') return [];

  // Regular expression to match markdown-style links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parts = text.split(linkRegex);
  const result: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i += 3) {
    if (i + 2 < parts.length) {

      // This is a link: 
      // parts[i] = text before, 
      // parts[i+1] = link text, 
      // parts[i+2] = URL
      const beforeText = parts[i];
      const linkText = parts[i + 1];
      const url = parts[i + 2];

      // Add text before the link
      if (beforeText) {
        result.push(...parseBold(beforeText, `before-${i}`));
      }

      if (isInternalLink(url)) {
        // Internal link - use Next.js Link with cover image
        result.push(
          <InternalLink
            key={`link-${i}`}
            url={url}
            linkText={linkText}
            keyPrefix={`${i}`}
          />
        );
      } else {
        // External link - use regular anchor tag
        result.push(
          <ExternalLink
            key={`link-${i}`}
            url={url}
            linkText={linkText}
            keyPrefix={`${i}`}
          />
        );
      }
    } else {
      // This is the remaining text after the last link
      const remainingText = parts[i];
      if (remainingText) {
        result.push(...parseBold(remainingText, `remaining-${i}`));
      }
    }
  }

  return result;
};

// Component to render content with clickable links
const ContentWithLinks: React.FC<{ content: string }> = ({ content }) => {

  if (!content || content.trim() === '') {
    return <span className="whitespace-pre-line"></span>;
  }

  return (
    <span className="whitespace-pre-line">
      {parseLinks(content)}
    </span>
  );
};

export default ContentWithLinks;