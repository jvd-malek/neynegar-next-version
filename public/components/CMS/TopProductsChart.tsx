'use client'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface TopProductsChartProps {
    data: any;
    isLoading?: boolean;
}

export default function TopProductsChart({ data, isLoading }: TopProductsChartProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="h-80 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data?.topProducts) return null;

    const topProducts = data.topProducts.slice(0, 10);
    const topPackages = data.topPackages?.slice(0, 10) || [];

    const productsChartData = {
        labels: topProducts.map((p: any) => p.product.title),
        datasets: [
            {
                label: 'درآمد (میلیون تومان)',
                data: topProducts.map((p: any) => p.totalRevenue / 1000000),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'سود (میلیون تومان)',
                data: topProducts.map((p: any) => p.totalProfit / 1000000),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                rtl: true,
                labels: {
                    font: {
                        family: 'IRANSans, Vazirmatn, sans-serif',
                        size: 12,
                    },
                    usePointStyle: true,
                },
            },
            tooltip: {
                rtl: true,
                bodyFont: {
                    family: 'IRANSans, Vazirmatn, sans-serif',
                },
                callbacks: {
                    label: (context: any) => {
                        return context.dataset.label + ': ' + 
                            context.parsed.x.toFixed(1) + ' میلیون تومان';
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    callback: (value: any) => value.toFixed(1) + 'M',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    ۱۰ محصول برتر سال
                </h3>
                <div className="h-80 mb-4">
                    <Bar data={productsChartData} options={options} />
                </div>
                <div className="space-y-1">
                    {topProducts.map((p: any, index: number) => (
                        <Link
                            key={p.product._id}
                            href={`/product/${p.product._id}`}
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                                    {index + 1}
                                </span>
                                <span className="text-gray-700 truncate">{p.product.title}</span>
                            </div>
                            <div className="flex gap-3 text-xs flex-shrink-0 mr-2">
                                <span className="text-blue-600">{p.totalCount} عدد</span>
                                <span className="text-green-600">{(p.totalProfit / 1000).toFixed(0)}K</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Top Packages */}
            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                    ۱۰ پکیج برتر سال
                </h3>
                {topPackages.length > 0 ? (
                    <div className="space-y-1">
                        {topPackages.map((p: any, index: number) => (
                            <div
                                key={p.package._id}
                                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors text-sm"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span className="text-gray-700 truncate">{p.package.title}</span>
                                </div>
                                <div className="flex gap-3 text-xs flex-shrink-0 mr-2">
                                    <span className="text-purple-600">{p.totalCount} عدد</span>
                                    <span className="text-green-600">{(p.totalProfit / 1000).toFixed(0)}K</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        پکیجی یافت نشد
                    </div>
                )}
            </div>
        </div>
    );
}