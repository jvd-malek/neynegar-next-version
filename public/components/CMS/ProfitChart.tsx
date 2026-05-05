'use client'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ProfitChartProps {
    data: any;
    isLoading?: boolean;
}

export default function ProfitChart({ data, isLoading }: ProfitChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!data?.monthlyData) return null;

    const months = data.monthlyData.map((m: any) => m.month);
    const netProfit = data.monthlyData.map((m: any) => m.netProfit);
    const totalProfit = data.monthlyData.map((m: any) => m.totalProfit);
    const profitMargin = data.monthlyData.map((m: any) => m.profitMargin);
    const netProfitMargin = data.monthlyData.map((m: any) => m.netProfitMargin);
    const shippingCost = data.monthlyData.map((m: any) => m.totalShippingCost);

    const chartData = {
        labels: months,
        datasets: [
            {
                label: 'سود ناخالص',
                data: totalProfit,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
                order: 2,
            },
            {
                label: 'سود خالص',
                data: netProfit,
                backgroundColor: 'rgba(20, 184, 166, 0.6)',
                borderColor: 'rgb(20, 184, 166)',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
                order: 2,
            },
            {
                label: 'هزینه ارسال',
                data: shippingCost,
                backgroundColor: 'rgba(251, 146, 60, 0.6)',
                borderColor: 'rgb(251, 146, 60)',
                borderWidth: 1,
                borderRadius: 4,
                yAxisID: 'y',
                order: 2,
            },
            {
                label: 'حاشیه سود ناخالص',
                data: profitMargin,
                type: 'line' as const,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true,
                yAxisID: 'y1',
                order: 1,
            },
            {
                label: 'حاشیه سود خالص',
                data: netProfitMargin,
                type: 'line' as const,
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.3,
                fill: true,
                yAxisID: 'y1',
                order: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                rtl: true,
                labels: {
                    font: {
                        family: 'IRANSans, Vazirmatn, sans-serif',
                        size: 11,
                    },
                    usePointStyle: true,
                    padding: 12,
                },
            },
            tooltip: {
                rtl: true,
                bodyFont: {
                    family: 'IRANSans, Vazirmatn, sans-serif',
                },
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.dataset.yAxisID === 'y') {
                            label += (context.parsed.y / 1000000).toFixed(1) + ' میلیون تومان';
                        } else {
                            label += context.parsed.y.toFixed(1) + '%';
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: 'مبلغ (تومان)',
                    font: {
                        family: 'IRANSans, Vazirmatn, sans-serif',
                    },
                },
                ticks: {
                    callback: (value: any) => (value / 1000000).toFixed(1) + 'M',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'درصد (%)',
                    font: {
                        family: 'IRANSans, Vazirmatn, sans-serif',
                    },
                },
                min: 0,
                max: 100,
                ticks: {
                    callback: (value: any) => value + '%',
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                تحلیل سود و هزینه‌ها
            </h3>
            <div className="h-72">
                <Chart type='bar' data={chartData} options={options} />
            </div>
        </div>
    );
}