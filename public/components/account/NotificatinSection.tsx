// components
import HomeHeader from "@/public/components/home/HomeHeader";

// type
import { userType } from "@/public/types/user";


const NotificatinSection = (user: userType) => {
    return (
        <section>
            <div className="bg-white rounded-lg px-2 py-4 w-full mt-6">
                <HomeHeader
                    title="اعلان ها"
                    showAll={false}
                />
            </div>

            {user?.alert?.length > 0 ?
                user.alert.reverse().map((a: any) => (
                    <div key={a} className="bg-white mt-4 shadow-cs py-4 px-6 rounded-xl w-full flex justify-between items-center sm:flex-row flex-col">
                        <p className="">{a}</p>
                    </div>
                )) :
                <p className="text-center bg-white rounded-lg p-2 w-full mt-4 font-semibold">
                    اعلانی ندارید.
                </p>
            }
        </section>

    );
}

export default NotificatinSection;