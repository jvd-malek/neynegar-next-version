// components
import HomeHeader from "@/public/components/home/HomeHeader";
import OrderListBox from "@/public/components/account/OrderListBox";

// type
import { userType } from "@/public/types/user";
import { paginatedOrdersType } from "@/public/types/order";

type OrderListSectionProps = {
    orders: paginatedOrdersType | null,
    user: userType
    demo?: boolean
}


const OrderListSection = ({ orders, user, demo = false }: OrderListSectionProps) => {
    return (
        <section>
            {demo ?
                <div className="bg-white rounded-lg px-2 py-4 w-full mt-10">
                    <HomeHeader
                        title="سفارشات اخیر"
                        link="?activeLink=سفارشات"
                        ariaLabel="سفارشات اخیر"
                    />
                </div> :
                <div className="bg-white rounded-lg px-2 py-4 w-full mt-6">
                    <HomeHeader
                        title="سفارشات"
                        showAll={false}
                    />
                </div>
            }

            <div className="mt-4 w-full">
                {orders ?
                    <OrderListBox orders={orders} user={user} demo={demo} />
                    :
                    <p className="text-center bg-white rounded-lg p-6 w-full mt-4">
                        سفارشی به نام شما ثبت نشده است.
                    </p>
                }
            </div>
        </section>
    );
}

export default OrderListSection;