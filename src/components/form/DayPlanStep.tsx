'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Toggle } from '@/components/ui';
import type { DayPlanForm, DayPlanPlace } from '@/types';
import { Calendar, Hotel, MapPin, Plus, Trash2, Clock, Sparkles, Loader2 } from 'lucide-react';

interface Props {
    data: DayPlanForm;
    onChange: (data: DayPlanForm) => void;
    city: string;
    country: string;
    sameHotelForAllDays: boolean;
    onSameHotelToggle: (checked: boolean) => void;
    globalHotel: string;
    onGlobalHotelChange: (hotel: string) => void;
    isFirstDay: boolean;
}

export default function DayPlanStep({
    data,
    onChange,
    city,
    country,
    sameHotelForAllDays,
    onSameHotelToggle,
    globalHotel,
    onGlobalHotelChange,
    isFirstDay,
}: Props) {
    const [placeInput, setPlaceInput] = useState('');
    const [timeInput, setTimeInput] = useState('10:00');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Place suggestions disabled:
    const fetchSuggestions = useCallback(async () => {
        return; // do nothing
    }, []);

    // useEffect(() => {
    //     fetchSuggestions();
    // }, [fetchSuggestions]);

    const addPlace = (name?: string) => {
        const placeName = name || placeInput.trim();
        if (!placeName) return;

        // Check if place already added
        if (data.places.some(p => p.name.toLowerCase() === placeName.toLowerCase())) return;

        const newPlace: DayPlanPlace = {
            name: placeName,
            time: timeInput || '10:00',
        };
        onChange({ ...data, places: [...data.places, newPlace] });
        if (!name) setPlaceInput('');
    };

    const removePlace = (index: number) => {
        const updated = data.places.filter((_, i) => i !== index);
        onChange({ ...data, places: updated });
    };

    const updatePlaceTime = (index: number, time: string) => {
        const updated = data.places.map((p, i) => i === index ? { ...p, time } : p);
        onChange({ ...data, places: updated });
    };

    const updateHotel = (hotel: string) => {
        if (sameHotelForAllDays) {
            onGlobalHotelChange(hotel);
        } else {
            onChange({ ...data, hotel });
        }
    };

    const currentHotel = sameHotelForAllDays ? globalHotel : data.hotel;

    // Filter out already-added places from suggestions
    const filteredSuggestions = suggestions.filter(
        s => !data.places.some(p => p.name.toLowerCase() === s.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Day Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2a2a2a] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">
                        Day {data.dayNumber} — {formatDate(data.date)}
                    </h2>
                    <p className="text-sm text-white/50">Plan your activities for this day</p>
                </div>
            </div>

            {/* Hotel Toggle + Selection (show toggle only on first day) */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Hotel className="w-4 h-4 text-blue-500" />
                    Hotel
                </div>

                {isFirstDay && (
                    <Toggle
                        checked={sameHotelForAllDays}
                        onChange={onSameHotelToggle}
                        label="Use same hotel for all days"
                        description="Selected hotel will apply to every day automatically"
                    />
                )}

                {(!sameHotelForAllDays || isFirstDay) && (
                    <Input
                        label={sameHotelForAllDays ? 'Hotel for all days' : `Hotel for Day ${data.dayNumber}`}
                        placeholder="e.g., Grand Hyatt, City Center"
                        value={currentHotel}
                        onChange={e => updateHotel(e.target.value)}
                    />
                )}

                {sameHotelForAllDays && !isFirstDay && (
                    <p className="text-sm text-white/50">
                        🏨 Using: <span className="text-white font-medium">{globalHotel || 'Not set yet'}</span>
                    </p>
                )}
            </div>

            {/* Places to Visit */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    Places to Visit
                </div>

                {/* Add Place Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex gap-2">
                        <Input
                            placeholder="Enter a place name..."
                            value={placeInput}
                            onChange={e => setPlaceInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addPlace();
                                }
                            }}
                            className="flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => addPlace()}
                            className="h-11 w-11 rounded-xl border border-[#2a2a2a] hover:border-blue-500 bg-[#141414] flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 sm:hidden"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            type="time"
                            value={timeInput}
                            onChange={e => setTimeInput(e.target.value)}
                            className="flex-1 sm:w-32"
                        />
                        <button
                            type="button"
                            onClick={() => addPlace()}
                            className="h-11 w-11 rounded-xl border border-[#2a2a2a] hover:border-blue-500 bg-[#141414] hidden sm:flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Added Places List */}
                {data.places.length > 0 && (
                    <div className="space-y-2">
                        {data.places.map((place, index) => (
                            <div
                                key={index}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-[#141414] border border-[#2a2a2a] gap-3"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <span className="text-sm font-medium text-white truncate">{place.name}</span>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-white/40" />
                                        <Input
                                            type="time"
                                            value={place.time}
                                            onChange={e => updatePlaceTime(index, e.target.value)}
                                            className="w-28 !h-8 text-xs sm:text-xs"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePlace(index)}
                                        className="p-1.5 rounded-lg hover:bg-pink-500/20 text-[#7a7a7a] hover:text-pink-500 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {data.places.length === 0 && (
                    <p className="text-sm text-white/30 text-center py-3">
                        No places added yet. Add places below or use suggestions.
                    </p>
                )}
            </div>

            {/* Popular Places Suggestions */}
            <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-900/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Popular places in {city || 'your city'}
                </div>

                {loadingSuggestions ? (
                    <div className="flex items-center gap-2 py-3">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-sm text-white/40">Loading suggestions...</span>
                    </div>
                ) : filteredSuggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {filteredSuggestions.map(place => (
                            <button
                                key={place}
                                type="button"
                                onClick={() => addPlace(place)}
                                className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#b5b5b5] hover:text-[#f5f5f5] text-sm font-medium border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all cursor-pointer"
                            >
                                + {place}
                            </button>
                        ))}
                    </div>
                ) : suggestionsLoaded ? (
                    <p className="text-sm text-white/30 py-2">
                        {suggestions.length > 0
                            ? 'All suggested places have been added!'
                            : 'No suggestions available for this city.'}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
