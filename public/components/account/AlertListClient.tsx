"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// mui
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import MarkEmailUnreadRoundedIcon from "@mui/icons-material/MarkEmailUnreadRounded";
import DraftsRoundedIcon from "@mui/icons-material/DraftsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

// components
import PaginationBox from "@/public/components/pagination/PaginationBox";

// utils
import { fetcher } from "@/public/utils/fetcher";

// queries
import { MARK_ALERT_AS_READ, MARK_ALL_ALERTS_AS_READ } from "@/public/graphql/userQueries";

// types
import { alertType, paginatedAlertsType } from "@/public/types/alert";

type AlertListClientProps = {
    alerts: paginatedAlertsType | null;
};

const AlertListClient = ({ alerts: initialAlerts }: AlertListClientProps) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("unread");
    const router = useRouter()

    const alerts = initialAlerts?.alerts || [];

    // تشخیص خوندن - فقط از سرور
    const isRead = (alert: alertType) => {
        return alert.readBy && alert.readBy.length > 0;
    };

    // مارک کردن - فقط mutation میزنه، state رو تغییر نمیده
    const markAsReadOnServer = async (alertId: string) => {
        try {
            await fetcher(MARK_ALERT_AS_READ, { alertId });
        } catch (error) {
            console.error("Error marking alert as read:", error);
        }
    };

    // هندل expand/collapse
    const handleToggle = (alertId: string, currentlyRead: boolean) => {
        if (expandedId === alertId) {
            // بستن
            setExpandedId(null);
        } else {
            // باز کردن
            setExpandedId(alertId);

            // فقط اگه قبلاً خونده نشده باشه، mutation بزن
            if (!currentlyRead) {
                markAsReadOnServer(alertId);
            }
        }
    };

    // مارک کردن همه - فقط mutation میزنه
    const markAllAsRead = async () => {
        try {
            await fetcher(MARK_ALL_ALERTS_AS_READ);
        } catch (error) {
            console.error("Error marking all alerts as read:", error);
        }
    };

    // فیلتر کردن
    const filteredAlerts = alerts.filter((alert) => {
        if (filter === "unread") return !isRead(alert);
        if (filter === "read") return isRead(alert);
        return true;
    });

    // آمار
    const unreadCount = alerts.filter((a) => !isRead(a)).length;
    const readCount = alerts.filter((a) => isRead(a)).length;

    return (
        <>
            {/* تب‌های فیلتر */}
            <div className="flex gap-2 mt-4 px-1 flex-wrap items-center">
                <button
                    onClick={() => setFilter("unread")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${filter === "unread"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    <MarkEmailUnreadRoundedIcon fontSize="small" />
                    خوانده نشده
                    {unreadCount > 0 && (
                        <span
                            className={`text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 ${filter === "unread" ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                                }`}
                        >
                            {unreadCount.toLocaleString("fa-IR")}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setFilter("read")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${filter === "read"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    <DraftsRoundedIcon fontSize="small" />
                    خوانده شده
                    {readCount > 0 && (
                        <span
                            className={`text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 ${filter === "read" ? "bg-white text-green-600" : "bg-green-600 text-white"
                                }`}
                        >
                            {readCount.toLocaleString("fa-IR")}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setFilter("all")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${filter === "all"
                        ? "bg-gray-800 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    همه
                </button>

                {unreadCount > 0 && (
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={() => {
                                markAllAsRead()
                                router.refresh()
                            }}
                            className="text-sm flex items-center gap-1 text-gray-600 cursor-pointer hover:bg-gray-200 rounded-lg px-2 py-1"
                        >
                            <DraftsRoundedIcon fontSize="inherit" />
                            خواندن همه
                        </button>
                    </div>
                )}
            </div>

            {/* لیست آلرت‌ها */}
            <div className="mt-4 space-y-3">
                {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => {
                        const read = isRead(alert);
                        const isExpanded = expandedId === alert._id;
                        const timeAgo = new Date(parseInt(alert.createdAt)).toLocaleDateString("fa-IR", {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        });

                        return (
                            <div
                                key={alert._id}
                                className={`bg-white shadow-cs rounded-xl w-full transition-all duration-200 ${!read
                                    ? "border-r-4 border-blue-500"
                                    : "border-r-4 border-gray-200 opacity-75"
                                    }`}
                            >
                                {/* هدر قابل کلیک */}
                                <button
                                    onClick={() => handleToggle(alert._id, read)}
                                    className="w-full flex justify-between items-center gap-3 py-4 px-6 text-right"
                                >
                                    {/* آیکون وضعیت */}
                                    <div className="shrink-0">
                                        {read ? (
                                            <CheckCircleRoundedIcon className="text-gray-300" fontSize="small" />
                                        ) : (
                                            <CircleRoundedIcon className="text-blue-500" fontSize="small" />
                                        )}
                                    </div>

                                    {/* محتوا */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`font-semibold line-clamp-1 text-sm sm:text-base ${!read ? "text-black" : "text-gray-500"
                                                }`}
                                        >
                                            {alert.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                                    </div>

                                    {/* فلش آکاردئون */}
                                    <div className="shrink-0">
                                        <KeyboardArrowDownRoundedIcon
                                            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                                }`}
                                        />
                                    </div>
                                </button>

                                {/* محتوای باز شده */}
                                {isExpanded && (
                                    <div className="px-6 pb-4 border-t border-gray-100">
                                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed pt-3">
                                            {alert.body}
                                        </p>
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                {alert.source === "discount" && "🎁 تخفیف"}
                                                {alert.source === "order" && "📦 سفارش"}
                                                {alert.source === "promo" && "🎯 کد تخفیف"}
                                                {alert.source === "manual" && "📝 پیام"}
                                                {alert.source === "system" && "⚙️ سیستم"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {read ? "✅ خوانده شده" : ""}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center bg-white rounded-lg p-8 w-full">
                        <DraftsRoundedIcon className="text-gray-300 text-6xl mx-auto mb-4" />
                        <p className="font-semibold text-gray-600">
                            {filter === "unread" && "همه اعلان‌ها رو خوندی! 🎉"}
                            {filter === "read" && "اعلان خوانده شده‌ای نداری"}
                            {filter === "all" && "هنوز اعلانی نداری"}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {filter === "unread" && "منتظر اعلان‌های جدید باش..."}
                            {filter === "read" && "اعلان‌های خوانده شده اینجا نمایش داده میشن"}
                            {filter === "all" && "اعلان‌های جدیدت اینجا نشون داده میشه"}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {initialAlerts && initialAlerts.totalPages > 1 && (
                <div className="mt-6">
                    <PaginationBox
                        count={initialAlerts.totalPages}
                        currentPage={initialAlerts.currentPage}
                    />
                </div>
            )}
        </>
    );
};

export default AlertListClient;