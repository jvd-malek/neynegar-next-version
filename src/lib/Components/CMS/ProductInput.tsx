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
}

export default function ProductInput({ label, value, type = 'text', options, onChange, onFocus, error }: ProductInputProps) {
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
                className="flex flex-col gap-2 w-20 sm:w-48 flex-shrink-0 cursor-pointer"
                onClick={() => {
                    setIsEditing(true);
                    onFocus?.();
                }}
            >
                <label className="text-xs sm:text-sm font-medium">{label}</label>
                <div className="rounded p-1.5 sm:p-2 border text-xs sm:text-sm bg-white text-nowrap line-clamp-1 h-8.5 sm:h-10">
                    {value}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 w-20 sm:w-48 text-xs sm:text-sm">
            <label className="text-xs sm:text-sm text-gray-600">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    onFocus={onFocus}
                    className={`p-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] w-full ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                    className={`p-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
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
                    className={`p-2 border rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
                    autoFocus
                />
            )}
            {error && <span className="text-red-500 text-xs sm:text-sm">{error}</span>}
        </div>
    );
} 