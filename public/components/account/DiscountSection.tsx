// components
import HomeHeader from "@/public/components/home/HomeHeader";
import CopyDiscountCode from "@/public/components/account/CopyDiscountCode";

// type
import { userType } from "@/public/types/user";

// utils
import { formatPersianDate } from "@/public/utils/dateFormatter";


const DiscountSection = (user: userType) => {
    return (
        <section>
            <div className="bg-white rounded-lg px-2 py-4 w-full mt-10">
                <HomeHeader
                    title="تخفیف‌های فعال من"
                    showAll={false}
                />
            </div>

            {user.discount?.length > 0 ?
                user.discount.reverse().map((d: any) => (
                    <div key={d.date} className="bg-white mt-4 shadow-cs py-4 px-6 rounded-xl w-full flex justify-between items-center sm:flex-row flex-col">

                        <div className="flex gap-6 items-center sm:border-none border-b border-mist-300 w-full sm:pb-0 pb-4 justify-center sm:justify-start">
                            <p className="flex gap-2 items-center text-mist-600 text-sm">
                                کد:
                                <span className="font-bold text-black text-base">{d.code}</span>
                            </p>
                            <p className="flex gap-2 items-center text-mist-600 text-sm">
                                تخفیف:
                                <span className="font-bold text-black text-base">%{d.discount}</span>
                            </p>
                        </div>

                        {d.date < Date.now() ?
                            <p className="px-3 py-1.5 bg-red-200 text-red-700 border border-red-300 text-sm rounded sm:mt-0 mt-4 text-nowrap">منقضی شد</p> :
                            <div className="flex gap-6 items-center text-nowrap sm:mt-0 mt-4">
                                <p className="flex gap-2 items-center text-mist-600 text-sm">
                                    انقضا:
                                    <span className="font-bold text-black text-base">
                                        {d.date ?
                                           formatPersianDate(Number(d.date))
                                            : 'نامشخص'
                                        }
                                    </span>
                                </p>
                                <CopyDiscountCode code={d.code} />
                            </div>
                        }
                    </div>
                )) :
                <p className="text-center bg-white rounded-lg p-6 w-full mt-4">
                    تخفیفی برای شما فعال نشده است.
                </p>
            }
        </section>

    );
}

export default DiscountSection;