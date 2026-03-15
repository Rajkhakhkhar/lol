'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SearchableDropdownProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    fetchUrl: string;
    /** Extra query params appended to the fetch URL (e.g. "&country=Japan") */
    extraParams?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export default function SearchableDropdown({
    label,
    placeholder,
    value,
    onChange,
    fetchUrl,
    extraParams = '',
    disabled = false,
}: SearchableDropdownProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync external value → internal query (e.g. when form resets)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Close dropdown + revert query on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                // Revert displayed text to the committed value
                setQuery(value);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [value]);

    const fetchSuggestions = useCallback(
        async (search: string) => {
            if (search.length < 2) {
                setSuggestions([]);
                setIsOpen(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(
                    `${fetchUrl}?q=${encodeURIComponent(search)}${extraParams}`
                );
                if (!res.ok) throw new Error('fetch failed');
                const data = await res.json();
                const items: string[] = Array.isArray(data) ? data : [];
                setSuggestions(items);
                setIsOpen(items.length > 0);
                setHighlightIndex(-1);
            } catch {
                setSuggestions([]);
                setIsOpen(false);
            } finally {
                setLoading(false);
            }
        },
        [fetchUrl, extraParams]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        // If user clears the input entirely, also clear the committed value
        if (val === '') {
            onChange('');
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        // Debounce 300ms — typing only searches, does NOT commit value
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 300);
    };

    const handleSelect = (item: string) => {
        setQuery(item);
        onChange(item);
        setIsOpen(false);
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex(i => (i < suggestions.length - 1 ? i + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex(i => (i > 0 ? i - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter' && highlightIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[highlightIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="space-y-1.5 relative" ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-white/80">{label}</label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    className={cn(
                        'flex h-11 w-full rounded-xl border bg-[#141414] px-4 py-2.5 text-white placeholder:text-[#7a7a7a] transition-all duration-250',
                        'border-[#2a2a2a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                />

                {/* Loading spinner inside input */}
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div
                    className={cn(
                        'absolute z-50 left-0 right-0 mt-1',
                        'rounded-xl border border-[#2a2a2a] bg-[#141414]/95 backdrop-blur-xl',
                        'shadow-2xl shadow-black/40',
                        'overflow-hidden',
                        'animate-slide-up'
                    )}
                    style={{ top: '100%' }}
                >
                    <ul className="py-1 max-h-52 overflow-y-auto">
                        {suggestions.map((item, idx) => (
                            <li key={item}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setHighlightIndex(idx)}
                                    className={cn(
                                        'w-full text-left px-4 py-2.5 text-sm transition-colors duration-100 cursor-pointer',
                                        idx === highlightIndex
                                            ? 'bg-[#202020] text-white border-l-2 border-blue-500'
                                            : 'text-[#b5b5b5] hover:bg-[#202020] hover:text-[#f5f5f5]'
                                    )}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
