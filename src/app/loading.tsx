import Image from "next/image";
import Logo from '../../public/Img/Logo-removebg.webp'

function loading() {
    return (
        <div className="container relative mx-auto h-[70vh] mt-32 flex flex-col justify-between items-center">
            <Image
                src={Logo}
                className="w-60"
                priority
                alt="لوگو نی نگار"
                width={240}
                height={240}
            />
            <div className="loader text-black/75 absolute -bottom-0 left-1/2 -translate-x-1/2 z-10"></div>
        </div>
    );
}

export default loading;