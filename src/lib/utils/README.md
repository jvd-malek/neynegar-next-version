# Link Parser Utility

This utility provides functionality to automatically detect and render clickable links in article content.

## Features

- **Automatic URL Detection**: Detects URLs starting with `http://`, `https://`, or `www.`
- **Persian Text Support**: Properly handles Persian text without breaking URL detection
- **External Link Indicators**: Adds an arrow (↗) to indicate external links
- **Responsive Design**: Links break properly on mobile devices
- **Security**: Uses `target="_blank"` and `rel="noopener noreferrer"` for external links

## Usage

### In Article Content

```tsx
import { ContentWithLinks } from '@/lib/utils/linkParser';

// In your component
<ContentWithLinks content={articleContent} />
```

### Manual Link Parsing

```tsx
import { parseLinks } from '@/lib/utils/linkParser';

// Parse text and get React nodes
const linkNodes = parseLinks("Check out https://example.com for more info");
```

## Supported URL Formats

- `https://example.com`
- `http://example.com`
- `www.example.com` (automatically converted to `https://www.example.com`)

## Styling

Links are styled with:
- Blue color (`text-blue-600`)
- Hover effect (`hover:text-blue-800`)
- Underline
- Smooth transitions
- External link indicator (↗)

## Example

Input text:
```
برای اطلاعات بیشتر به سایت https://example.com مراجعه کنید.
```

Output:
```
برای اطلاعات بیشتر به سایت <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com↗</a> مراجعه کنید.
``` 