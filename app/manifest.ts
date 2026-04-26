import type { MetadataRoute } from 'next'
import Logo192 from "@/public/images/Logo192.webp"
import Logo512 from "@/public/images/Logo.webp"
import screenshotWide from "@/public/images/Screenshot-wide.png"
import screenshotNarrow from "@/public/images/Screenshot-narrow.png"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NeyNegar | نی‌نگار',
    short_name: 'NeyNegar',
    description: 'فروشگاه لوازم هنری نی‌نگار',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    lang: "fa_IR",
    icons: [
      {
        src: Logo192.src,
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: Logo512.src,
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
    // screenshots: [
    //   {
    //     src: screenshotWide.src,
    //     sizes: '120x720',
    //     type: 'image/png',
    //     form_factor: 'wide',   // برای دسکتاپ لازمه
    //   },
    //   {
    //     src: screenshotNarrow.src,
    //     sizes: '375x667',
    //     type: 'image/png',
    //     form_factor: 'narrow', // برای موبایل
    //   }
    // ],
  }
}
