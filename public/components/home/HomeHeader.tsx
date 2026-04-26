// next
import Link from 'next/link';

// icons
import KeyboardBackspaceRounded from '@mui/icons-material/KeyboardBackspaceRounded';

interface BoxHeaderProps {
  title: string;
  link?: string;
  postfix?: string;
  ariaLabel?: string;
  showAll?: boolean;
}

export default function BoxHeader({
  title,
  postfix,
  link = "",
  ariaLabel = `مشاهده همه ${title}`,
  showAll = true
}: BoxHeaderProps) {
  return (
    <div className={`flex px-3 justify-between items-center gap-2`}>
      {!showAll &&
        <div className="flex-3 h-px bg-mist-300"></div>
      }
      <div className="flex flex-col relative mb-1">
        <h2 className="text-xl text-nowrap text-gray-900 text-shadow font-extrabold">
          {title}
          <span className="text-cyan-700 pr-1 sm:text-3xl text-2xl">{postfix}</span>
        </h2>
      </div>
      <div className={`${showAll && "hidden sm:block"} flex-3 h-px bg-mist-300`}></div>
      {showAll &&
        <Link
          href={link}
          className="flex items-center text-cyan-700 gap-1 group"
          aria-label={ariaLabel}
          role="button"
          tabIndex={0}
        >
          <span className="text-sm text-nowrap font-bold">مشاهده‌همه</span>
          <KeyboardBackspaceRounded
            fontSize='inherit'
            className="text-sm transform group-hover:-translate-x-1 transition-transform duration-700 animate-pulse"
            aria-hidden="true"
          />
        </Link>
      }
    </div>
  );
}