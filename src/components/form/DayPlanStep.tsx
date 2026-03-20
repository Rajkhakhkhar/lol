'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Toggle, Badge } from '@/components/ui';
import type { DayPlanForm, DayPlanPlace } from '@/types';
import { Calendar, Hotel, MapPin, Plus, Trash2, Clock, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import PlaceSuggestions from '@/components/common/PlaceSuggestions';
import { getActivityAccessibilityAdvice, getHotelAccessibilityAdvice } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

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
    isLastDay: boolean;
    allDays: DayPlanForm[];
    accessibilityNeeds?: boolean;
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
    isLastDay,
    allDays,
    accessibilityNeeds,
}: Props) {
    const [placeInput, setPlaceInput] = useState('');
    const [timeInput, setTimeInput] = useState('10:00');

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };


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
    const hotelAdvice = accessibilityNeeds ? getHotelAccessibilityAdvice(currentHotel) : null;

    // Logic for showing hotel fields
    const prevDayHotel = data.dayNumber > 1 ? allDays[data.dayNumber - 2]?.hotel : null;
    const nextDayHotel = data.dayNumber < allDays.length ? allDays[data.dayNumber]?.hotel : null;

    const isFirstDayOfThisHotel = sameHotelForAllDays ? isFirstDay : (data.hotel !== prevDayHotel);
    const isLastDayOfThisHotel = sameHotelForAllDays ? isLastDay : (data.hotel !== nextDayHotel);

    const showHotelNameInput = !sameHotelForAllDays || isFirstDay;
    const showCheckIn = isFirstDayOfThisHotel;
    const showCheckOut = isLastDayOfThisHotel;


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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <Hotel className="w-4 h-4 text-blue-500" />
                        Hotel Assignment
                    </div>
                    {isFirstDay && (
                        <Toggle
                            checked={sameHotelForAllDays}
                            onChange={onSameHotelToggle}
                            label="Same hotel for all days"
                        />
                    )}
                </div>

                {accessibilityNeeds && currentHotel && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs text-blue-100/70">
                            {hotelAdvice?.message || 'We recommend ensuring this hotel provides wheelchair access.'}
                        </span>
                        <Badge variant="accent" className="ml-auto text-[10px]">♿ Preferred</Badge>
                    </div>
                )}

                {/* Hotel Selection Logic */}
                {showHotelNameInput && (
                    <div className="space-y-4 pt-2">
                        <Input
                            label={sameHotelForAllDays ? 'Hotel for all days' : `Hotel for Day ${data.dayNumber}`}
                            placeholder="e.g., Grand Hyatt, City Center"
                            value={currentHotel}
                            onChange={e => updateHotel(e.target.value)}
                            className={cn(accessibilityNeeds && 'focus:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]')}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {showCheckIn && (
                                <Input
                                    label="Check-in Time"
                                    type="time"
                                    value={data.checkin_time || '14:00'}
                                    onChange={e => onChange({ ...data, checkin_time: e.target.value })}
                                />
                            )}
                            {showCheckOut && (
                                <Input
                                    label="Check-out Time"
                                    type="time"
                                    value={data.checkout_time || '11:00'}
                                    onChange={e => onChange({ ...data, checkout_time: e.target.value })}
                                />
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                            {showCheckIn && <span>• Check-in only required on first day</span>}
                            {showCheckOut && <span>• Check-out only required on last day</span>}
                        </div>
                    </div>
                )}

                {!showHotelNameInput && (
                    <div className="space-y-3 pt-2">
                        <p className="text-sm text-white/50 flex items-center gap-2">
                            🏨 Staying at: <span className="text-white font-medium">{globalHotel || 'Not set yet'}</span>
                        </p>
                        {showCheckOut && (
                            <div className="w-full sm:w-1/2">
                                <Input
                                    label="Check-out Time (Final Day)"
                                    type="time"
                                    value={data.checkout_time || '11:00'}
                                    onChange={e => onChange({ ...data, checkout_time: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
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
                        {data.places.map((place, index) => {
                            const activityAdvice = accessibilityNeeds ? getActivityAccessibilityAdvice(place.name) : null;
                            const isNotRecommended = activityAdvice?.level === 'not_recommended';

                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex flex-col p-3 rounded-lg bg-[#141414] border transition-all",
                                        isNotRecommended ? "border-pink-500/30 shadow-[0_0_10px_rgba(255,110,199,0.1)]" : "border-[#2a2a2a]"
                                    )}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <MapPin className={cn("w-4 h-4 flex-shrink-0", isNotRecommended ? "text-pink-500" : "text-blue-500")} />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium text-white truncate">{place.name}</span>
                                                {isNotRecommended && activityAdvice && (
                                                    <span className="text-[10px] text-pink-500/80 font-medium">
                                                        ⚠️ {activityAdvice.badge}: {activityAdvice.message}
                                                    </span>
                                                )}
                                            </div>
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
                                </div>
                            );
                        })}
                    </div>
                )}

                {data.places.length === 0 && (
                    <p className="text-sm text-white/30 text-center py-3">
                        No places added yet. Add places below or use suggestions.
                    </p>
                )}
            </div>

            {/* AI Place Suggestions */}
            <PlaceSuggestions 
                city={city} 
                country={country} 
                onSelect={(placeName) => addPlace(placeName)}
                className="mt-8 pt-8 border-t border-white/5"
            />
        </div>
    );
}
