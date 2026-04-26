// next
import Image from "next/image";

// images
import Logo from '@/public/images/Logo-removebg.webp'


const MaintenanceMode = () => {
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
            <p className="font-bold text-lg">در حال انجام به‌روزرسانی هستیم.</p>
            <p className="font-semibold">به‌زودی برمی‌گردیم.</p>
        </div>
    );
}

export default MaintenanceMode;