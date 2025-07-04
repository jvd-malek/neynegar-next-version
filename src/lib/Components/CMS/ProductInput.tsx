'use client';

import { useState, useEffect } from 'react';

interface ProductInputProps {
    label: string;
    value: any;
    type?: 'text' | 'number' | 'textarea' | 'select';
    options?: { value: string; label: string; }[];
    onChange: (value: string | number) => void;
    onFocus?: () => void;
    error?: string;
    disabled?: boolean;
    form?: boolean
}

export default function ProductInput({ label, value, type = 'text', options, onChange, onFocus, error, disabled, form = false }: ProductInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    // Update editValue when value changes
    useEffect(() => {
        setEditValue(value);
    }, [value]);

    const handleSave = () => {
        onChange(editValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
        }
    };

    if (!isEditing) {
        return (
            <div
                className={`flex flex-col gap-2 ${form ? "w-full" : " w-20 sm:w-48"} cursor-pointer`}
                onClick={() => {
                    setIsEditing(true);
                    onFocus?.();
                }}
            >
                <label className="text-xs sm:text-sm font-medium text-gray-700 text-shadow">{label}</label>
                <div className="rounded-lg p-1.5 sm:p-2 border border-gray-300 text-xs sm:text-sm bg-slate-50 text-nowrap line-clamp-1 h-8.5 sm:h-10">
                    {value}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-2 ${form ? "w-full" : " w-20 sm:w-48"}`}>
            <label className="text-xs sm:text-sm text-gray-700 text-shadow">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    onFocus={onFocus}
                    className={`rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none resize-y min-h-[100px] w-full ${error ? 'border-red-500' : 'border-gray-300'}`}
                    rows={4}
                    autoFocus
                />
            ) : type === 'select' ? (
                <select
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    onFocus={onFocus}
                    disabled={disabled}
                    className={`rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    autoFocus
                >
                    {options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    value={editValue}
                    onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    onFocus={onFocus}
                    className={`rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    autoFocus
                />
            )}
            {error && <span className="text-red-500 text-xs sm:text-sm transition-all">{error}</span>}
        </div>
    );
}

export const DiscountInput = ({ form = false, discount, duration, onDiscountChange, onDurationChange, onFocus, errors }: {
    discount: string;
    duration: string;
    form?: boolean;
    onDiscountChange: (value: string) => void;
    onDurationChange: (value: string) => void;
    onFocus: (field: string, value: string) => void;
    errors: { discount?: string; discountDuration?: string };
}) => {
    return (
        <div className={`flex flex-col gap-2 ${form ? "w-full" : " w-20 sm:w-48"}`}>
            <label className="text-xs sm:text-sm text-gray-700 text-shadow">تخفیف</label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <input
                        type="number"
                        value={discount}
                        onChange={(e) => onDiscountChange(e.target.value)}
                        onFocus={() => onFocus('discount', discount)}
                        className={`rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${errors.discount ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="میزان تخفیف"
                    />
                    {errors.discount && (
                        <p className="mt-1 text-red-500 text-xs sm:text-sm transition-all">{errors.discount}</p>
                    )}
                </div>
                <div className="flex-1">
                    <input
                        type="number"
                        value={duration}
                        onChange={(e) => onDurationChange(e.target.value)}
                        onFocus={() => onFocus('discountDuration', duration)}
                        className={`rounded-lg p-1.5 sm:p-2 border bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${errors.discountDuration ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="مدت زمان (روز)"
                    />
                    {errors.discountDuration && (
                        <p className="mt-1 text-red-500 text-xs sm:text-sm transition-all">{errors.discountDuration}</p>
                    )}
                </div>
            </div>
        </div>
    );
};