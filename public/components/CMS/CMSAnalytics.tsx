"use client"

// react
import { useState } from "react";
import SummaryCards from "./SummaryCards";

// utils
import { fetcher } from '@/public/utils/fetcher';
import useSWR from "swr";

// components
import dynamic from 'next/dynamic';

// ✅ فقط وقتی کاربر وارد پنل ادمین بشه دانلود میشه
const SalesChart = dynamic(() => import('./SalesChart'), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

const ProfitChart = dynamic(() => import('./ProfitChart'), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

const TopProductsChart = dynamic(() => import('./TopProductsChart'), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

const MonthlyDetail = dynamic(() => import('./MonthlyDetail'), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

function ChartSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
        </div>
    );
}

const GET_SALES_ANALYTICS = `
    query GetSalesAnalytics($year: Int) {
        salesAnalytics(year: $year) {
            monthlyData {
                month
                year
                totalOrders
                totalRevenue
                totalShippingCost
                totalProfit
                netProfit
                profitMargin
                netProfitMargin
                freeOrders
                paidOrders
                freeOrderRevenue
                paidOrderRevenue
                products {
                    product {
                        _id
                        title
                        totalSell
                        state
                        count
                        showCount
                        majorCat
                        minorCat
                        cover
                    }
                    totalCount
                    totalRevenue
                    totalProfit
                    allTimeSales
                }
                packages {
                    package {
                        _id
                        title
                        totalSell
                        state
                        category
                        cover
                    }
                    totalCount
                    totalRevenue
                    totalProfit
                    allTimeSales
                }
            }
            totalRevenue
            totalOrders
            averageOrderValue
            freeOrderPercentage
            totalShippingCost
            totalProfit
            netProfit
            profitMargin
            netProfitMargin
            topProducts {
                product {
                    _id
                    title
                    totalSell
                    state
                    count
                    showCount
                    majorCat
                    minorCat
                    cover
                }
                totalCount
                totalRevenue
                totalProfit
                allTimeSales
            }
            topPackages {
                package {
                    _id
                    title
                    totalSell
                    state
                    category
                    cover
                }
                totalCount
                totalRevenue
                totalProfit
                allTimeSales
            }
        }
    }
`;

export default function CMSAnalytics() {
    const currentPersianYear = new Date().getFullYear() - 621; // Convert to Persian year
    const [selectedYear, setSelectedYear] = useState(currentPersianYear);

    const { data, error, isLoading } = useSWR(
        [GET_SALES_ANALYTICS, { year: selectedYear }],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
            keepPreviousData: true
        }
    );

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">خطا در دریافت اطلاعات آماری</p>
                <p className="text-red-400 text-sm mt-1">لطفاً دوباره تلاش کنید</p>
            </div>
        );
    }

    const analyticsData = data?.salesAnalytics;

    return (
        <div className="space-y-6">
            <SummaryCards
                data={analyticsData}
                isLoading={isLoading}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart data={analyticsData} isLoading={isLoading} />
                <ProfitChart data={analyticsData} isLoading={isLoading} />
            </div>

            <TopProductsChart data={analyticsData} isLoading={isLoading} />

            <MonthlyDetail data={analyticsData} isLoading={isLoading} />
        </div>
    );
}