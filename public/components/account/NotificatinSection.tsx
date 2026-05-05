// components
import HomeHeader from "@/public/components/home/HomeHeader";
import AlertListClient from "./AlertListClient";

// types
import { paginatedAlertsType } from "@/public/types/alert";

type NotificatinSectionProps = {
  alerts: paginatedAlertsType | null;
};

const NotificatinSection = ({ alerts }: NotificatinSectionProps) => {
  return (
    <section>
      <div className="bg-white rounded-lg px-2 py-4 w-full mt-6">
        <HomeHeader title="اعلان‌ها" showAll={false} />
      </div>

      <AlertListClient alerts={alerts} />
    </section>
  );
};

export default NotificatinSection;