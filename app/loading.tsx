// next
import Image from "next/image";

// images
import Logo from '@/public/images/Logo-removebg.webp'

function loading() {
    return (
        <div className="container relative mx-auto h-screen py-40 flex flex-col justify-between items-center">
            <Image
                src={Logo}
                className="w-60"
                loading="lazy"
                alt="لوگو نی نگار"
                width={240}
                height={240}
            />
            <div className="loader text-black/75 absolute bottom-40 left-1/2 -translate-x-1/2 z-10"></div>
        </div>
    );
}

export default loading;