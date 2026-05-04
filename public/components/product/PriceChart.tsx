"use client"

// react
import React, { useRef, useEffect, useState } from 'react';

// icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface PriceHistory {
    price: number;
    date: string;
}

interface PriceChartProps {
    priceHistory: PriceHistory[];
}

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [tooltip, setTooltip] = useState<{
        show: boolean;
        x: number;
        y: number;
        price: number;
        date: string;
    }>({ show: false, x: 0, y: 0, price: 0, date: '' });

    const parseDate = (dateStr: string): number => {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date.getTime();

        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(
                parseInt(parts[0]) + 621,
                parseInt(parts[1]) - 1,
                parseInt(parts[2])
            ).getTime();
        }

        return Date.now();
    };

    const formatPrice = (price: number): string => {
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1) + 'M';
        } else if (price >= 1000) {
            return (price / 1000).toFixed(0) + 'K';
        }
        return price.toString();
    };

    const formatDate = (timestamp: number): string => {
        return new Intl.DateTimeFormat('fa-IR', {
            month: 'short',
            day: 'numeric'
        }).format(new Date(timestamp));
    };

    const formatFullDate = (timestamp: number): string => {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(timestamp));
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: 350
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!canvasRef.current || priceHistory.length < 1 || !dimensions.width) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        canvas.style.width = dimensions.width + 'px';
        canvas.style.height = dimensions.height + 'px';
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        const padding = { top: 50, right: 40, bottom: 60, left: 70 };
        const chartWidth = dimensions.width - padding.left - padding.right;
        const chartHeight = dimensions.height - padding.top - padding.bottom;

        const sortedData = [...priceHistory]
            .map(item => ({
                timestamp: parseDate(item.date),
                price: item.price
            }))
            .sort((a, b) => a.timestamp - b.timestamp);

        if (sortedData.length === 0) return;

        const prices = sortedData.map(d => d.price);
        const minPrice = Math.min(...prices) * 0.9;
        const maxPrice = Math.max(...prices) * 1.1;
        const priceRange = maxPrice - minPrice || 1; // جلوگیری از تقسیم بر صفر

        const minTime = sortedData[0].timestamp;
        const maxTime = sortedData[sortedData.length - 1].timestamp;
        const timeRange = maxTime - minTime || 1;

        const getX = (timestamp: number) => {
            return padding.left + ((timestamp - minTime) / timeRange) * chartWidth;
        };

        const getY = (price: number) => {
            return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
        };

        // Grid lines
        const gridLines = 5;
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(dimensions.width - padding.right, y);
            ctx.stroke();

            const price = maxPrice - (priceRange / gridLines) * i;
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px Vazirmatn, IRANSans, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(formatPrice(price), padding.left - 10, y + 4);
        }

        ctx.setLineDash([]);

        // Date labels - هوشمند
        const minLabelSpacing = 80;
        const maxLabels = Math.floor(chartWidth / minLabelSpacing);

        let selectedIndices: number[] = [];

        if (sortedData.length <= maxLabels) {
            selectedIndices = sortedData.map((_, i) => i);
        } else {
            const step = Math.ceil(sortedData.length / maxLabels);
            for (let i = 0; i < sortedData.length; i += step) {
                selectedIndices.push(i);
            }
            if (selectedIndices[selectedIndices.length - 1] !== sortedData.length - 1) {
                selectedIndices.push(sortedData.length - 1);
            }
        }

        const finalLabels: number[] = [];
        let lastX = -Infinity;

        selectedIndices.forEach(index => {
            const x = getX(sortedData[index].timestamp);
            if (x - lastX >= minLabelSpacing) {
                finalLabels.push(index);
                lastX = x;
            }
        });

        finalLabels.forEach((index) => {
            const item = sortedData[index];
            const x = getX(item.timestamp);
            const y = padding.top + chartHeight;

            // خط راهنمای عمودی
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // دایره کوچک روی محور
            ctx.fillStyle = '#9ca3af';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();

            // متن تاریخ
            ctx.fillStyle = '#4b5563';
            ctx.font = '11px Vazirmatn, IRANSans, sans-serif';
            ctx.textAlign = 'center';

            const dateText = index === sortedData.length - 1
                ? formatFullDate(item.timestamp)
                : formatDate(item.timestamp);

            ctx.save();
            ctx.translate(x, y + 15);
            ctx.rotate(-0.4);
            ctx.fillText(dateText, 0, 0);
            ctx.restore();
        });

        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Vazirmatn, IRANSans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('تاریخ', dimensions.width / 2, dimensions.height - 5);

        // ============ رسم نمودار ============
        if (sortedData.length === 1) {
            // فقط یک قیمت - رسم خط صاف
            const singleData = sortedData[0];
            const y = getY(singleData.price);

            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(dimensions.width - padding.right, y);
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // Gradient fill زیر خط
            const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(padding.left, y, chartWidth, padding.top + chartHeight - y);

            // نقطه وسط
            const centerX = padding.left + chartWidth / 2;

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(centerX, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(centerX, y, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // برچسب قیمت روی خط
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 12px Vazirmatn, IRANSans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${singleData.price.toLocaleString('fa-IR')} تومان`, centerX, y - 12);

        } else {
            // چند قیمت - رسم منحنی
            const lineGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
            lineGradient.addColorStop(0, '#3b82f6');
            lineGradient.addColorStop(0.5, '#2563eb');
            lineGradient.addColorStop(1, '#1d4ed8');
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
            ctx.shadowBlur = 10;

            ctx.beginPath();
            sortedData.forEach((item, index) => {
                const x = getX(item.timestamp);
                const y = getY(item.price);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevX = getX(sortedData[index - 1].timestamp);
                    const prevY = getY(sortedData[index - 1].price);
                    const cpX = (prevX + x) / 2;
                    ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
                }
            });
            ctx.stroke();

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;

            // Gradient fill
            const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
            gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.03)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            sortedData.forEach((item, index) => {
                const x = getX(item.timestamp);
                const y = getY(item.price);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    const prevX = getX(sortedData[index - 1].timestamp);
                    const prevY = getY(sortedData[index - 1].price);
                    const cpX = (prevX + x) / 2;
                    ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
                }
            });
            ctx.lineTo(getX(sortedData[sortedData.length - 1].timestamp), padding.top + chartHeight);
            ctx.lineTo(getX(sortedData[0].timestamp), padding.top + chartHeight);
            ctx.closePath();
            ctx.fill();

            // Data points
            sortedData.forEach((item) => {
                const x = getX(item.timestamp);
                const y = getY(item.price);

                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#3b82f6';
                ctx.beginPath();
                ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Mouse events
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;

            let closestPoint: any = null;
            let minDistance = Infinity;

            sortedData.forEach((item) => {
                const x = getX(item.timestamp);
                const distance = Math.abs(mouseX - x);

                if (distance < 30 && distance < minDistance) {
                    minDistance = distance;
                    closestPoint = {
                        x: getX(item.timestamp),
                        y: getY(item.price),
                        price: item.price,
                        date: formatFullDate(item.timestamp),
                        timestamp: item.timestamp
                    };
                }
            });

            if (closestPoint) {
                setTooltip({
                    show: true,
                    ...closestPoint
                });
            } else {
                setTooltip({ show: false, x: 0, y: 0, price: 0, date: '' });
            }
        };

        const handleMouseLeave = () => {
            setTooltip({ show: false, x: 0, y: 0, price: 0, date: '' });
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [priceHistory, dimensions]);

    if (!priceHistory || priceHistory.length === 0) {
        return (
            <div className="w-full py-8 text-center text-gray-400">
                <TrendingUpIcon sx={{ fontSize: 48, mb: 1 }} />
                <p>تاریخچه قیمتی برای این محصول ثبت نشده است</p>
            </div>
        );
    }

    const firstPrice = priceHistory[0]?.price || 0;
    const lastPrice = priceHistory[priceHistory.length - 1]?.price || 0;
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = firstPrice ? ((priceChange / firstPrice) * 100) : 0;
    const hasMultiplePrices = priceHistory.length > 1;

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-800">
                    {hasMultiplePrices ? 'میزان تغییر' : 'قیمت محصول'}
                </p>

                {hasMultiplePrices && (
                    <div className="flex items-center gap-2">
                        {priceChange > 0 ? (
                            <TrendingUpIcon className="text-red-500" />
                        ) : priceChange < 0 ? (
                            <TrendingDownIcon className="text-green-500" />
                        ) : null}

                        <p className={`text-sm font-bold ${
                            priceChange > 0 ? 'text-red-500' : 
                            priceChange < 0 ? 'text-green-500' : 
                            'text-gray-500'
                        }`}>
                            {priceChange > 0 ? '+' : ''}
                            {priceChangePercent.toFixed(1)}%
                        </p>
                    </div>
                )}
            </div>

            {/* Chart container */}
            <div
                ref={containerRef}
                className="relative w-full bg-linear-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm pb-2"
            >
                <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair"
                />

                {/* Tooltip */}
                {tooltip.show && (
                    <div
                        className="absolute z-10 bg-gray-900 text-white rounded-lg p-3 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{
                            left: tooltip.x,
                            top: tooltip.y - 15
                        }}
                    >
                        <p className="text-xs text-gray-300 mb-1">
                            {tooltip.date}
                        </p>
                        <p className="text-sm font-bold">
                            {new Intl.NumberFormat('fa-IR').format(tooltip.price)} تومان
                        </p>
                    </div>
                )}
            </div>

            {/* Price summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="text-center bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
                    <p className="text-[10px] sm:text-xs text-green-600 mb-1">
                        کمترین قیمت
                    </p>
                    <div className="flex flex-col items-center">
                        <p className="text-xs sm:text-sm font-bold text-green-700">
                            {new Intl.NumberFormat('fa-IR').format(Math.min(...priceHistory.map(p => p.price)))}
                        </p>
                        <p className="text-[10px] sm:text-xs text-green-600">تومان</p>
                    </div>
                </div>

                <div className="text-center bg-red-50 rounded-lg p-2 sm:p-3 border border-red-100">
                    <p className="text-[10px] sm:text-xs text-red-600 mb-1">
                        بیشترین قیمت
                    </p>
                    <div className="flex flex-col items-center">
                        <p className="text-xs sm:text-sm font-bold text-red-700">
                            {new Intl.NumberFormat('fa-IR').format(Math.max(...priceHistory.map(p => p.price)))}
                        </p>
                        <p className="text-[10px] sm:text-xs text-red-600">تومان</p>
                    </div>
                </div>

                <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
                    <p className="text-[10px] sm:text-xs text-blue-600 mb-1">
                        قیمت فعلی
                    </p>
                    <div className="flex flex-col items-center">
                        <p className="text-xs sm:text-sm font-bold text-blue-700">
                            {new Intl.NumberFormat('fa-IR').format(priceHistory[priceHistory.length - 1]?.price || 0)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-blue-600">تومان</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceChart;