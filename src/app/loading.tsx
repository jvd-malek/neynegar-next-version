import Image from "next/image";
import Logo from '../../public/Img/Logo-removebg.webp'

function loading() {
    return (
        <div className="container mx-auto h-[30vh] mt-32 flex justify-center items-center">
            <Image
                src={Logo}
                className="w-60"
                priority
                alt="لوگو نی نگار"
                width={240}
                height={240}
            />
        </div>
    );
}

export default loading;