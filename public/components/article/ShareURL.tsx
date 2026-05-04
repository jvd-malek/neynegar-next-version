"use client"

//next
import Image from 'next/image';
import Link from 'next/link';

// icons
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';
import TelegramIcon from '@mui/icons-material/Telegram';

// utils
import { notify } from '@/public/utils/notify';

// images
import bale from '@/public/images/logo-Bale.webp';
import eitaa from '@/public/images/logo-Eitaa.webp';

function ShareURL({ link, title }: { link: string, title: string }) {

    const text = `نی نگار | ${title}`

    const shareLinks = [
        {
            title: "اشتراک گذاری در ایتا",
            link: `https://eitaa.com/share/url?url=${link}&text=${text}`,
            icon: <Image src={eitaa} className='object-contain' alt="لوگو ایتا نی نگار" loading="lazy" width={20} height={20} />
        },
        {
            title: "اشتراک گذاری در بله",
            link: `https://ble.ir/share?text=${text}&url=${link}`,
            icon: <Image src={bale} className='object-contain' alt="لوگو بله نی نگار" loading="lazy" width={20} height={20} />
        },
        {
            title: "اشتراک گذاری در تلگرام",
            link: `https://t.me/share/url?url=${link}&text=${text}`,
            icon: <TelegramIcon />
        }
    ]

    const shareHandler = () => {
        navigator.clipboard.writeText(
            `${link}
            ${text}`
        );
        notify("لینک این محصول در حافظه شما کپی شد.", "success");
    };

    return (
        <div className="bg-white rounded-lg p-6 w-full flex justify-between items-center flex-wrap gap-6">

            <div className="flex items-center text-lg font-bold gap-2">
                <ShareRoundedIcon />
                <p className="">
                    اشتراک‌گذاری
                </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-2">
                <button
                    onClick={shareHandler}
                    className="flex w-fit items-center justify-center cursor-pointer h-10 px-2 rounded-lg text-lg gap-2 bg-mist-100 hover:bg-slate-200 active:bg-slate-200">
                    <span className="">
                        <InsertLinkRoundedIcon />
                    </span>
                    <p className="line-clamp-1 overflow-y-scroll text-xs" dir='ltr'>کپی لینک</p>
                </button>

                {shareLinks.map(link => (
                    <Link
                        key={link.title}
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-mist-100 hover:bg-slate-200 active:bg-slate-200 rounded-md w-10 h-10 flex justify-center items-center"
                        itemProp="sameAs"
                        aria-label={link.title}
                        aria-placeholder={link.title}
                    >
                        {link.icon}
                    </Link>
                ))}
            </div>

        </div>
    );
}

export default ShareURL;