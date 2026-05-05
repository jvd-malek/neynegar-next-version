'use client'

interface SummaryCardsProps {
    data: any;
    isLoading?: boolean;
    selectedYear: number;
    onYearChange: (year: number) => void;
}

export default function SummaryCards({ data, isLoading, selectedYear, onYearChange }: SummaryCardsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) return null;

    const cards = [
        {
            label: "کل درآمد",
            value: `${(data.totalRevenue / 1000000).toFixed(1)}M تومان`,
            icon: "💰",
            color: "from-blue-500 to-blue-600"
        },
        {
            label: "کل سفارشات",
            value: data.totalOrders.toLocaleString('fa-IR'),
            icon: "📦",
            color: "from-green-500 to-green-600"
        },
        {
            label: "میانگین سفارش",
            value: `${(data.averageOrderValue / 1000).toFixed(0)}K تومان`,
            icon: "📊",
            color: "from-purple-500 to-purple-600"
        },
        {
            label: "سود خالص",
            value: `${(data.netProfit / 1000000).toFixed(1)}M تومان`,
            icon: "💎",
            color: "from-emerald-500 to-emerald-600"
        },
        {
            label: "حاشیه سود خالص",
            value: `${data.netProfitMargin.toFixed(1)}%`,
            icon: "📈",
            color: "from-teal-500 to-teal-600"
        },
        {
            label: "سود ناخالص",
            value: `${(data.totalProfit / 1000000).toFixed(1)}M تومان`,
            icon: "💵",
            color: "from-indigo-500 to-indigo-600"
        },
        {
            label: "هزینه ارسال کل",
            value: `${(data.totalShippingCost / 1000000).toFixed(1)}M تومان`,
            icon: "🚚",
            color: "from-orange-500 to-orange-600"
        },
        {
            label: "سفارشات آزاد",
            value: `${data.freeOrderPercentage.toFixed(1)}%`,
            icon: "🎁",
            color: "from-pink-500 to-pink-600"
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">داشبورد فروش</h2>
                <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 621 - i;
                        return (
                            <option key={year} value={year}>
                                سال {year}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden"
                    >
                        <div className={`bg-linear-to-r ${card.color} p-3 text-white`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs opacity-90">{card.label}</span>
                                <span className="text-lg">{card.icon}</span>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="text-lg font-bold text-gray-800">{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}