// components
import HomeHeader from "@/public/components/home/HomeHeader";
import TicketListBox from "@/public/components/account/TicketListBox";

// type
import { userType } from "@/public/types/user";
import { paginatedTicketsType } from "@/public/types/ticket";

type TicketSectionProps = {
    tickets: paginatedTicketsType | null,
    user: userType
    demo?: boolean
}


const TicketSection = ({ tickets, user, demo = false }: TicketSectionProps) => {
    return (
        <section>
            {demo ?
                <div className="bg-white rounded-lg px-2 py-4 w-full mt-10">
                    <HomeHeader
                        title="سوالات اخیر"
                        link="?activeLink=پرسش و پاسخ"
                        ariaLabel="سوالات اخیر"
                    />
                </div> :
                <div className="bg-white rounded-lg px-2 py-4 w-full mt-6">
                    <HomeHeader
                        title="پرسش و پاسخ"
                        showAll={false}
                    />
                </div>
            }
            <div className="w-full">
                {tickets && tickets.tickets?.length > 0 ?
                    <TicketListBox tickets={tickets} user={user} demo={demo} />
                    :
                    <div className="text-center bg-white rounded-lg p-6 w-full mt-4 space-y-4">
                        <p className="font-semibold">
                            هنوز تیکتی ثبت نکرده‌اید.
                        </p>
                        <p className="text-sm text-mist-700">
                            می‌توانید سوالات یا مشکلات خود را از این بخش پیگیری کنید.
                        </p>
                    </div>
                }
            </div>
        </section>
    );
}

export default TicketSection;