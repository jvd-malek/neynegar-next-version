"use client"
import useSWR from "swr";
import SalesChart from "./SalesChart";
import { fetcher } from '@/public/utils/fetcher';
import { useState } from "react";

const GET_SALES_ANALYTICS = `
    query GetSalesAnalytics($year: Int) {
        salesAnalytics(year: $year) {
            monthlyData {
                month
                year
                totalOrders
                totalRevenue
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
                totalSell
              }
            }
            totalRevenue
            totalOrders
            averageOrderValue
            freeOrderPercentage
            topProducts{
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
                totalSell
            }
        }
    }
`;

function CMSAnalytics() {

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Fetch sales analytics data
    const { data: salesData, error: salesError, isLoading: salesLoading } = useSWR(
        [GET_SALES_ANALYTICS, { year: selectedYear }],
        ([query, variables]) => fetcher(query, variables),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000, // Cache for 30 seconds
            keepPreviousData: true
        }
    );

    return (
        <div className="mb-6">
            <SalesChart
                data={salesData?.salesAnalytics}
                isLoading={salesLoading}
                onYearChange={setSelectedYear}
            />
        </div>
    );
}

export default CMSAnalytics;