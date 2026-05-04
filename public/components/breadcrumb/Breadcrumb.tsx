// next
import Link from "next/link";

// icons
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

type BreadcrumbProps = {
    majorCat?: string,
    minorCat?: string,
    title?: string
    brand?: string
    cart?: boolean
}

const Breadcrumb = ({ majorCat, minorCat, title, cart = false , brand}: BreadcrumbProps) => {

    return (
        <nav
            aria-label="breadcrumb"
            className="w-full bg-white rounded-lg py-3 px-4 mt-6 flex justify-start items-center gap-4 font-medium"
        >

            <Link href="/" className="relative pl-6 flex items-center" aria-label="خانه">
                <HomeRoundedIcon />
                <span className="text-mist-100 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                    <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                </span>
            </Link>

            {cart && !minorCat &&
                <div className="relative pl-6 flex items-center" aria-label="سبد خرید">
                    <p className="line-clamp-1">
                        سبد خرید
                    </p>
                    <span className="text-mist-100 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                        <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                    </span>
                </div>
            }

            {majorCat &&
                <Link href={cart ? "?activeLink=products" : `/category/${majorCat}`} className="relative pl-6">
                    <p className="line-clamp-1">
                        {majorCat}
                    </p>
                    <span className="text-mist-100 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                        <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                    </span>
                </Link>
            }

            {minorCat &&
                <Link href={cart ? "?activeLink=info" : `/category/${majorCat}/${minorCat}`} className="relative pl-6">
                    <p className="line-clamp-1">
                        {minorCat}
                    </p>
                    <span className="text-mist-100 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                        <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                    </span>
                </Link>
            }

            {brand &&
                <Link href={cart ? "?activeLink=info" : `/category/${majorCat}/${minorCat}?cat=${brand}`} className="relative pl-6">
                    <p className="line-clamp-1">
                        {brand}
                    </p>
                    <span className="text-mist-100 text-7xl absolute -left-6 top-1/2 -translate-y-1/2">
                        <ArrowBackIosNewRoundedIcon fontSize="inherit" />
                    </span>
                </Link>
            }

            {title &&
                <p className="line-clamp-1" aria-current="page">{title}</p>
            }

        </nav>
    );
}

export default Breadcrumb;