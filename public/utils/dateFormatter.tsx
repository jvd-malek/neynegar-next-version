interface DateFormatOptions {
    showTime?: boolean;
    showSeconds?: boolean;
    showDay?: boolean;
    showMonth?: boolean;
    showYear?: boolean;
}

export const formatPersianDate = (
    timestamp: any, 
    options: DateFormatOptions = {}
): string => {
    if (!timestamp) return '';
    
    const {
        showTime = false,
        showSeconds = false,
        showDay = true,
        showMonth = true,
        showYear = true
    } = options;
    
    const date = new Date(Number(timestamp));
    
    // Check valid date
    if (isNaN(date.getTime())) {
        return String(timestamp);
    }
    
    try {
        // فقط تاریخ
        if (!showTime) {
            const dateOptions: Intl.DateTimeFormatOptions = {};
            
            if (showDay) dateOptions.day = 'numeric';
            if (showMonth) dateOptions.month = 'long';
            if (showYear) dateOptions.year = 'numeric';
            
            return new Intl.DateTimeFormat('fa-IR', dateOptions).format(date);
        }
        
        // تاریخ با ساعت
        const dateTimeOptions: Intl.DateTimeFormatOptions = {};
        
        if (showDay) dateTimeOptions.day = 'numeric';
        if (showMonth) dateTimeOptions.month = 'long';
        if (showYear) dateTimeOptions.year = 'numeric';
        
        dateTimeOptions.hour = '2-digit';
        dateTimeOptions.minute = '2-digit';
        
        if (showSeconds) {
            dateTimeOptions.second = '2-digit';
        }
        
        return new Intl.DateTimeFormat('fa-IR', dateTimeOptions).format(date);
    } catch {
        return date.toLocaleString('fa-IR');
    }
};

// Shortcuts for common use cases
export const formatDate = (timestamp: any) => formatPersianDate(timestamp);
export const formatDateTime = (timestamp: any) => formatPersianDate(timestamp, { showTime: true });
export const formatDateTimeWithSeconds = (timestamp: any) => formatPersianDate(timestamp, { showTime: true, showSeconds: true });
export const formatMonthYear = (timestamp: any) => formatPersianDate(timestamp, { showDay: false });
export const formatDayMonth = (timestamp: any) => formatPersianDate(timestamp, { showYear: false });