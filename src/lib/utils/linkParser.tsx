import React from 'react';
import Link from 'next/link';

// Function to check if URL is internal
const isInternalLink = (url: string): boolean => {
  return url.startsWith('/') || url.startsWith('#');
};

// Function to parse text and convert markdown-style links to clickable links
export const parseLinks = (text: string): React.ReactNode[] => {
  if (!text || typeof text !== 'string') return [];
  
  // Regular expression to match markdown-style links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  const parts = text.split(linkRegex);
  const result: React.ReactNode[] = [];
  
  // Helper to parse bold (*...*) inside a string
  const parseBold = (str: string, keyPrefix: string) => {
    const boldRegex = /\*([^*]+)\*/g;
    const boldParts = str.split(boldRegex);
    const nodes: React.ReactNode[] = [];
    for (let j = 0; j < boldParts.length; j++) {
      if (j % 2 === 1) {
        // متن بین دو ستاره
        nodes.push(
          <span key={`${keyPrefix}-bold-${j}`} className="font-semibold text-shadow leading-loose">{boldParts[j]}</span>
        );
      } else if (boldParts[j]) {
        nodes.push(
          <span key={`${keyPrefix}-plain-${j}`}>{boldParts[j]}</span>
        );
      }
    }
    return nodes;
  };

  for (let i = 0; i < parts.length; i += 3) {
    if (i + 2 < parts.length) {
      // This is a link: parts[i] = text before, parts[i+1] = link text, parts[i+2] = URL
      const beforeText = parts[i];
      const linkText = parts[i + 1];
      const url = parts[i + 2];
      
      // Add text before the link
      if (beforeText) {
        result.push(...parseBold(beforeText, `before-${i}`));
      }
      
      // Check if it's an internal link
      if (isInternalLink(url)) {
        // Internal link - use Next.js Link
        result.push(
          <Link
            key={`link-${i}`}
            href={url}
            className="text-green-600 hover:text-green-800 underline decoration-green-300 hover:decoration-green-500 transition-all duration-200 font-medium bg-green-100 hover:bg-green-200 px-1.5 py-0.5 my-0.5 rounded-md"
            title={url}
          >
            {parseBold(linkText, `linkText-${i}`)}
            <span className="text-xs">🔗</span>
          </Link>
        );
      } else {
        // External link - use regular anchor tag
        const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
        result.push(
          <a
            key={`link-${i}`}
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-all duration-200 font-medium bg-blue-100 hover:bg-blue-200 px-1.5 py-0.5 my-0.5 rounded-md"
            title={url}
          >
            {parseBold(linkText, `linkText-${i}`)}
            <span className="text-xs">↗</span>
          </a>
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
export const ContentWithLinks: React.FC<{ content: string }> = ({ content }) => {
  // Ensure content is always a string
  const safeContent = typeof content === 'string' ? content : String(content || '');
  
  if (!safeContent || safeContent.trim() === '') {
    return <span className="whitespace-pre-line"></span>;
  }
  
  return (
    <span className="whitespace-pre-line">
      {parseLinks(safeContent)}
    </span>
  );
}; 