"use client"
import { useEffect, useState } from "react";

type DiscountTimerProps = {
    endDate: number;
    page?: boolean;
    discount?: boolean;
}
function DiscountTimer({ endDate, page = false, discount = false }: DiscountTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        if (endDate > Date.now()) {
            const timer = setInterval(() => {
                const now = Date.now();
                const difference = endDate - now;

                if (difference <= 0) {
                    clearInterval(timer);
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                    return;
                }

                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [endDate]);

    return (
        <div className={`${!discount && "absolute"} ${page ? " top-2 left-2" : " top-0 left-0"} transform z-10 bg-red-600/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-xs font-medium`}>
            <table className="border-collapse">
                <tbody>
                    <tr>
                        <td className="px-1 text-center">
                            <div className="flex flex-col items-center">
                                <span className="font-bold">{timeLeft.days > 10 ? '+10' : timeLeft.days}</span>
                                <span className="text-[10px]">روز</span>
                            </div>
                        </td>
                        <td className="px-1 text-center">
                            <div className="flex flex-col items-center">
                                <span className="font-bold">{timeLeft.hours}</span>
                                <span className="text-[10px]">ساعت</span>
                            </div>
                        </td>
                        <td className="px-1 text-center">
                            <div className="flex flex-col items-center">
                                <span className="font-bold">{timeLeft.minutes}</span>
                                <span className="text-[10px]">دقیقه</span>
                            </div>
                        </td>
                        <td className="px-1 text-center">
                            <div className="flex flex-col items-center">
                                <span className="font-bold">{timeLeft.seconds}</span>
                                <span className="text-[10px]">ثانیه</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
export default DiscountTimer;
