// components
import HomeHeader from "@/public/components/home/HomeHeader";

// type
import { userType } from "@/public/types/user";
import ProfileForm from "./ProfileForm";

// utils
import { fetcher, revalidateOneHour } from "@/public/utils/fetcher";


const ProfileSection = async (user: userType) => {
    const provinces = await fetcher(`
                query {
                    provinces {
                        province
                        cities
                    }
                }
            ` , {}, revalidateOneHour)

    return (
        <section>
            <div className="bg-white rounded-lg px-2 py-4 w-full mt-6">
                <HomeHeader
                    title="اطلاعات کاربری"
                    showAll={false}
                />
            </div>
            <ProfileForm user={user} provinces={provinces.provinces} account />
        </section>

    );
}

export default ProfileSection;