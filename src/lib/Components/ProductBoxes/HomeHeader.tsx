import { KeyboardBackspaceRounded } from '@mui/icons-material';
import Link from 'next/link';
import { ReactNode } from 'react';

interface BoxHeaderProps {
  title: string;
  link?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  className?: string;
  all?: boolean;
}

export default function BoxHeader({
  title,
  link = "",
  icon = <div className="w-6 h-6 rounded-md bg-black" />,
  ariaLabel = `مشاهده همه ${title}`,
  className = '',
  all = true
}: BoxHeaderProps) {
  return (
    <header className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:mb-6 sm:mb-2 ${className}`}>
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-2xl font-medium text-gray-900 text-shadow">
          {title}
        </h2>
      </div>

      {all &&
        <Link
          href={link}
          className="
          flex items-center gap-1
          px-3 py-2
          text-gray-600 hover:text-gray-900
          hover:bg-gray-100 active:bg-gray-200
          rounded-lg
          transition-colors duration-200
          group
        "
          aria-label={ariaLabel}
        >
          <span className="text-sm font-medium">مشاهده همه</span>
          <KeyboardBackspaceRounded
            className="
            text-lg
            transform group-hover:-translate-x-1
            transition-transform duration-700
            animate-pulse
          "
            aria-hidden="true"
          />
        </Link>
      }
    </header>
  );
}