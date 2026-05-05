'use client'

import { useState } from 'react';
import Link from 'next/link';

interface MonthlyDetailProps {
    data: any;
    isLoading?: boolean;
}

export default function MonthlyDetail({ data, isLoading }: MonthlyDetailProps) {
    const [selectedMonth, setSelectedMonth] = useState(0);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!data?.monthlyData) return null;

    const month = data.monthlyData[selectedMonth];

    const metrics = [
        { label: "درآمد کل", value: `${(month.totalRevenue / 1000000).toFixed(1)}M`, color: "blue" },
        { label: "سفارشات", value: month.totalOrders, color: "green" },
        { label: "سود خالص", value: `${(month.netProfit / 1000000).toFixed(1)}M`, color: "emerald" },
        { label: "حاشیه سود", value: `${month.netProfitMargin.toFixed(1)}%`, color: "purple" },
        { label: "سفارشات پرداختی", value: month.paidOrders, color: "indigo" },
        { label: "سفارشات آزاد", value: month.freeOrders, color: "pink" },
        { label: "هزینه ارسال", value: `${(month.totalShippingCost / 1000).toFixed(0)}K`, color: "orange" },
        { label: "درآمد پرداختی", value: `${(month.paidOrderRevenue / 1000000).toFixed(1)}M`, color: "teal" },
    ];

    const colorMap: any = {
        blue: "border-blue-200 bg-blue-50",
        green: "border-green-200 bg-green-50",
        emerald: "border-emerald-200 bg-emerald-50",
        purple: "border-purple-200 bg-purple-50",
        indigo: "border-indigo-200 bg-indigo-50",
        pink: "border-pink-200 bg-pink-50",
        orange: "border-orange-200 bg-orange-50",
        teal: "border-teal-200 bg-teal-50",
    };

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                جزئیات ماهانه
            </h3>

            {/* Month Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollable-section ">
                {data.monthlyData.map((m: any, index: number) => (
                    <button
                        key={m.month}
                        onClick={() => setSelectedMonth(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                            selectedMonth === index
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {m.month} {m.year}
                    </button>
                ))}
            </div>

            {/* Month Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className={`${colorMap[metric.color]} border rounded-lg p-3`}
                    >
                        <div className="text-xs text-gray-600 mb-1">{metric.label}</div>
                        <div className="text-base font-bold text-gray-800">{metric.value}</div>
                    </div>
                ))}
            </div>

            {/* Products & Packages Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Products */}
                <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>📦</span> محصولات برتر {month.month}
                    </h4>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {month.products?.map((p: any, index: number) => (
                            <Link
                                key={p.product._id}
                                href={`/product/${p.product._id}`}
                                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs text-gray-400 w-4">{index + 1}</span>
                                    <span className="text-gray-700 truncate">{p.product.title}</span>
                                </div>
                                <div className="flex gap-3 text-xs shrink-0 mr-2">
                                    <span className="text-blue-600">{p.totalCount} عدد</span>
                                    <span className="text-green-600">{(p.totalProfit / 1000).toFixed(0)}K</span>
                                </div>
                            </Link>
                        ))}
                        {(!month.products || month.products.length === 0) && (
                            <p className="text-center text-gray-400 py-4 text-sm">محصولی یافت نشد</p>
                        )}
                    </div>
                </div>

                {/* Packages */}
                <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>🎁</span> پکیج‌های برتر {month.month}
                    </h4>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {month.packages?.map((p: any, index: number) => (
                            <div
                                key={p.package._id}
                                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs text-gray-400 w-4">{index + 1}</span>
                                    <span className="text-gray-700 truncate">{p.package.title}</span>
                                </div>
                                <div className="flex gap-3 text-xs shrink-0 mr-2">
                                    <span className="text-purple-600">{p.totalCount} عدد</span>
                                    <span className="text-green-600">{(p.totalProfit / 1000).toFixed(0)}K</span>
                                </div>
                            </div>
                        ))}
                        {(!month.packages || month.packages.length === 0) && (
                            <p className="text-center text-gray-400 py-4 text-sm">پکیجی یافت نشد</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}