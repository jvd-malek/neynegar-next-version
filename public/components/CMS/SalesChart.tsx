'use client'

import Link from 'next/link';
import { useState } from 'react';

interface MonthlySalesData {
    month: string;
    year: number;
    totalOrders: number;
    totalRevenue: number;
    freeOrders: number;
    paidOrders: number;
    freeOrderRevenue: number;
    paidOrderRevenue: number;
    products: {
        product: {
            _id: string
            title: string
            totalSell: number
            state: string
            count: number
            showCount: number
            majorCat: string
            minorCat: string
            cover: string
        }
        totalCount: number
        totalRevenue: number
        totalSell: number
    }[]
}

interface SalesAnalytics {
    monthlyData: MonthlySalesData[];
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    freeOrderPercentage: number;
    topProducts: {
        product: {
            _id: string
            title: string
            totalSell: number
            state: string
            count: number
            showCount: number
            majorCat: string
            minorCat: string
            cover: string
        }
        totalCount: number
        totalRevenue: number
        totalSell: number
    }[]
}

interface SalesChartProps {
    data: SalesAnalytics;
    isLoading?: boolean;
    onYearChange?: (year: number) => void;
}

export default function SalesChart({ data, isLoading, onYearChange }: SalesChartProps) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [chartType, setChartType] = useState<'revenue' | 'orders'>('revenue');
    const [Month, setMonth] = useState("فروردین");
    const topProduct = data?.topProducts[0]

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!data || !data.monthlyData) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <p className="text-gray-500 text-center">داده‌ای برای نمایش وجود ندارد</p>
            </div>
        );
    }

    const maxValue = Math.max(
        ...data.monthlyData.map(month =>
            chartType === 'revenue' ? month.totalRevenue : month.totalOrders
        )
    );

    // If no data, show a message
    if (maxValue === 0 || maxValue === -Infinity) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    آمار فروش ماهانه
                </h2>
                <div className="text-center py-8">
                    <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
                    <p className="text-sm text-gray-400 mt-2">در این سال سفارشی ثبت نشده است</p>
                </div>
            </div>
        );
    }

    const formatNumber = (num: number) => {
        if (!num || num === 0) return '0';
        if (chartType === 'revenue') {
            return (num / 1000000).toFixed(1) + 'M';
        }
        return num.toLocaleString('fa-IR');
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
                        آمار فروش ماهانه
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setChartType('revenue')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === 'revenue'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                درآمد
                            </button>
                            <button
                                onClick={() => setChartType('orders')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chartType === 'orders'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                تعداد سفارش
                            </button>
                        </div>

                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                const year = parseInt(e.target.value);
                                setSelectedYear(year);
                                onYearChange?.(year);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                            {Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">کل درآمد</div>
                        <div className="text-2xl font-bold text-blue-800">
                            {(data.totalRevenue / 1000000).toFixed(1)}M تومان
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">کل سفارشات</div>
                        <div className="text-2xl font-bold text-green-800">
                            {data.totalOrders.toLocaleString('fa-IR')}
                        </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">میانگین سفارش</div>
                        <div className="text-2xl font-bold text-purple-800">
                            {(data.averageOrderValue / 1000).toFixed(0)}K تومان
                        </div>
                    </div>
                    <Link href={`/product/${topProduct.product._id}`} className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 font-medium">پر فروش ترین</div>
                        <div className="text-xs font-shadow text-orange-700 line-clamp-1">
                            {topProduct.product.title}

                        </div>
                        <div className="text-xs font-bold text-orange-800 flex items-center gap-2">
                            <span>تعداد: {topProduct.totalCount}</span>
                            <span>فروش: {topProduct.totalRevenue.toLocaleString('fa-IR')}</span>
                        </div>
                    </Link>
                    <div className="bg-pink-50 p-4 rounded-lg">
                        <div className="text-sm text-pink-600 font-medium">سفارشات آزاد</div>
                        <div className="text-2xl font-bold text-pink-800">
                            {data.freeOrderPercentage.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative">
                    <div className="h-64 flex items-end justify-between gap-1 mb-4 bg-gray-50 rounded-lg p-4">
                        {data.monthlyData.map((month, index) => {
                            const value = chartType === 'revenue' ? month.totalRevenue : month.totalOrders;
                            const freeValue = chartType === 'revenue' ? month.freeOrderRevenue : month.freeOrders;
                            const paidValue = chartType === 'revenue' ? month.paidOrderRevenue : month.paidOrders;
                            // Calculate heights properly
                            const containerHeight = 220; // h-64 = 256px
                            const freeHeight = maxValue > 0 ? (freeValue / maxValue) * containerHeight : 0;
                            const paidHeight = maxValue > 0 ? (paidValue / maxValue) * containerHeight : 0;

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center group">
                                    <div className="w-full flex flex-col items-center relative">
                                        <div className="text-xs text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {formatNumber(value)}
                                        </div>
                                        <div className="w-full flex flex-col items-end gap-0.5">
                                            {/* Paid Orders Bar */}
                                            <div
                                                className={`w-full bg-linear-to-t from-green-500 to-green-300 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-400 relative`}
                                                style={{ height: `${paidHeight}px`, minHeight: '2px' }}
                                                title={`${month.month} - سفارشات پرداختی: ${formatNumber(paidValue)}`}
                                            >
                                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity whitespace-nowrap">
                                                    {formatNumber(paidValue)}
                                                </div>
                                            </div>
                                            {/* Free Orders Bar */}
                                            <div
                                                className="w-full bg-linear-to-t from-orange-500 to-orange-300 rounded-b transition-all duration-300 hover:from-orange-600 hover:to-orange-400 relative"
                                                style={{ height: `${freeHeight}px`, minHeight: '2px' }}
                                                title={`${month.month} - سفارشات آزاد: ${formatNumber(freeValue)}`}
                                            >
                                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity whitespace-nowrap">
                                                    {formatNumber(freeValue)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Month Labels */}
                    <div className="flex justify-between text-xs gap-0.5 text-gray-600 px-2">
                        {data.monthlyData.map((month, index) => (
                            <button key={index}
                                onClick={() => setMonth(month.month)}
                                className={`flex-1 cursor-pointer hover:bg-amber-200 rounded py-1 ${month.month == Month ? "bg-amber-200" : "bg-amber-50"} text-center rotate-270 md:rotate-0 w-4`}>
                                {month.month}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-10 flex flex-col gap-4 justify-center items-center">
                    <div className="flex-wrap flex gap-4 justify-center items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm text-gray-600">سفارشات پرداختی</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span className="text-sm text-gray-600">سفارشات آزاد</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span className="text-sm text-gray-600">
                                {chartType === 'revenue' ? 'درآمد کل' : 'تعداد کل سفارش'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-2xl flex flex-col gap-2 items-start">
                        <p className="text-shadow text-lg mb-2">محصولات پر فروش {Month}</p>
                        {data.monthlyData
                            .filter(p => p.month == Month)[0].products
                            .slice(0, 10)
                            .map((p, index) => {
                                return (
                                    <Link key={p.product._id} href={`/product/${p.product._id}`} className="flex items-center justify-center gap-2">
                                        <div className={`w-4 h-4 bg-${index % 5}-fix rounded text-xs flex justify-center items-center`}>{index + 1}</div>
                                        <div className="text-sm text-gray-600 flex justify-center items-center gap-2">
                                            {p.product.title}
                                            <span className='bg-blue-200 p-1 rounded'>تعداد: {p.totalCount}</span>
                                            <span className='bg-lime-200 p-1 rounded'>کل فروش: {p.totalRevenue.toLocaleString('fa-IR')}</span>
                                        </div>
                                    </Link>)
                            })}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 md:mb-0">
                    آمار فروش سالانه
                </h2>


                {/* Legend */}
                <div className="mt-10 flex flex-col gap-4 justify-center items-center">

                    <div className="bg-slate-100 p-2 rounded-2xl flex flex-col gap-2 items-start">
                        <p className="text-shadow text-lg mb-2">محصولات پر فروش {Month}</p>
                        {data.topProducts
                            .slice(0, 10)
                            .map((p, index) => {
                                return (
                                    <Link key={p.product._id} href={`/product/${p.product._id}`} className="flex items-center justify-center gap-2">
                                        <div className={`w-4 h-4 bg-${index % 5}-fix rounded text-xs flex justify-center items-center`}>{index + 1}</div>
                                        <div className="text-sm text-gray-600 flex justify-center items-center gap-2">
                                            {p.product.title}
                                            <span className='bg-blue-200 p-1 rounded'>تعداد: {p.totalCount}</span>
                                            <span className='bg-lime-200 p-1 rounded'>کل فروش: {p.totalRevenue.toLocaleString('fa-IR')}</span>
                                        </div>
                                    </Link>)
                            })}
                    </div>
                </div>
            </div>
        </>
    );
}
