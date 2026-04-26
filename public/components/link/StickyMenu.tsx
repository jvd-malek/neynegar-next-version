// next
import Link from "next/link";

// icons
import KeyboardArrowLeftRounded from "@mui/icons-material/KeyboardArrowLeftRounded";

type StickyMenuProps = {
    links: {
        id: number,
        txt: string
    }[]
    activeLink: string
}

const StickyMenu = ({ links, activeLink }: StickyMenuProps) => {
    return (
        <div className="sticky top-20 max-h-[83vh] h-fit scrollable-section overflow-y-scroll lg:block hidden bg-white rounded-lg p-6 pb-4 font-bold">
            <h3 className="text-lg">پیشخوان</h3>

            <div className="flex flex-col gap-3 mt-5">
                {
                    links.map(link => (
                        <Link
                            key={link.id}
                            href={`/account?activeLink=${link.txt}`}
                            className={`flex justify-between items-center gap-1 py-2 px-4 transition-all rounded-xl relative ${(activeLink === link.txt) ? "bg-black text-white" : "bg-mist-200 hover:bg-slate-300"}`}

                        >
                            <span>
                                {link.txt}
                            </span>

                            <KeyboardArrowLeftRounded />
                        </Link>
                    ))
                }
            </div>
        </div>
    );
}

export default StickyMenu;