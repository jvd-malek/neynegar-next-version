'use client';

import { useState, useEffect, useRef } from 'react';

interface Author {
    _id: string;
    fullName: string;
}

interface SearchableAuthorSelectProps {
    value: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    error?: string;
    authors: Author[];
    form?: boolean
}

export default function SearchableAuthorSelect({ value, onChange, onFocus, error, authors, form = false }: SearchableAuthorSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) {
            const author = authors.find(a => a._id === value);
            setSelectedAuthor(author || null);
        } else {
            setSelectedAuthor(null);
        }
    }, [value, authors]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredAuthors = authors.filter(author =>
        author.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (author: Author) => {
        setSelectedAuthor(author);
        onChange(author._id);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`flex flex-col gap-2 ${form ? "w-full" : " w-20 sm:w-48"} text-xs sm:text-sm relative`} ref={dropdownRef}>
            <label className="text-xs sm:text-sm text-gray-700 text-shadow">نویسنده</label>
            <div
                className={`rounded-lg cursor-pointer p-1.5 sm:p-2 border text-center bg-slate-50 text-xs sm:text-sm focus:outline-none w-full h-8.5 sm:h-10 ${error ? 'border-red-500' : 'border-gray-300'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedAuthor ? selectedAuthor.fullName : "__ انتخاب کنید __"}
            </div>
            {isOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[9999]">
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="جستجوی نویسنده..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filteredAuthors.map((author) => (
                            <div
                                key={author._id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleSelect(author)}
                            >
                                {author.fullName}
                            </div>
                        ))}
                        {filteredAuthors.length === 0 && (
                            <div className="p-2 text-gray-500 text-center">
                                نویسنده‌ای یافت نشد
                            </div>
                        )}
                    </div>
                </div>
            )}
            {error && <span className="text-red-500 text-xs sm:text-sm">{error}</span>}
        </div>
    );
} 