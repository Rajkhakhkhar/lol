'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input, Select, TagSelector, Spinner, Badge } from '@/components/ui';
import type { InterestsForm, InterestTag, DayPlanForm } from '@/types';
import { INTEREST_TAGS } from '@/types';
import { Heart, Star, Plus, X, Sparkles, MapPin, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    data: InterestsForm;
    onChange: (data: InterestsForm) => void;
    city: string;
    country: string;
    dayPlans: DayPlanForm[];
    onAddToDay: (dayNumber: number, placeName: string) => void;
}

interface SuggestedPlace {
    placeName: string;
    shortDescription: string;
    category: string;
}

export default function InterestsStep({ data, onChange, city, country, dayPlans, onAddToDay }: Props) {
    const update = (field: Partial<InterestsForm>) => onChange({ ...data, ...field });
    const [mustVisitInput, setMustVisitInput] = useState('');
    const [suggestions, setSuggestions] = useState<SuggestedPlace[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [addingToDay, setAddingToDay] = useState<string | null>(null);

    const fetchSuggestions = useCallback(async () => {
        if (!city || !country || data.interests.length === 0) {
            setSuggestions([]);
            return;
        }
        
        setLoading(true);
        setIsFallback(false);
        
        try {
            const res = await fetch('/api/ai-place-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city, country, interests: data.interests }),
            });
            
            let result: any = {};
            try {
                result = await res.json();
            } catch (e) {
                console.error('InterestsStep: JSON parse failed', e);
            }
            
            if (result.success && Array.isArray(result.places)) {
                setSuggestions(result.places);
                setIsFallback(result.isFallback || false);
            }
        } catch (err) {
            console.error('InterestsStep Catch Error:', err);
        } finally {
            setLoading(false);
        }
    }, [city, country, data.interests]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchSuggestions();
        }, 500);
        return () => clearTimeout(timeout);
    }, [data.interests, fetchSuggestions]);

    const addMustVisit = () => {
        if (mustVisitInput.trim() && !data.must_visit_places.includes(mustVisitInput.trim())) {
            update({ must_visit_places: [...data.must_visit_places, mustVisitInput.trim()] });
            setMustVisitInput('');
        }
    };

    const removeMustVisit = (place: string) => {
        update({ must_visit_places: data.must_visit_places.filter(p => p !== place) });
    };

    const isPlaceAdded = (placeName: string) => {
        return dayPlans.some(day => day.places.some(p => p.name === placeName));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#2a2a2a] flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Your Interests</h2>
                    <p className="text-sm text-white/50">What kind of experiences are you looking for?</p>
                </div>
            </div>

            {/* Interest Tags */}
            <TagSelector
                label="Select your interests (pick as many as you like)"
                options={INTEREST_TAGS as unknown as string[]}
                selected={data.interests as string[]}
                onChange={selected => update({ interests: selected as InterestTag[] })}
            />

            {data.interests.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-bold text-white/90">Curated for your interests in {city}</h3>
                        </div>
                        {loading && <Spinner size="sm" />}
                    </div>

                    {suggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {suggestions.map((suggestion, i) => {
                                const added = isPlaceAdded(suggestion.placeName);
                                return (
                                    <div key={suggestion.placeName + i} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => !added && setAddingToDay(addingToDay === suggestion.placeName ? null : suggestion.placeName)}
                                            className={cn(
                                                "group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300",
                                                added 
                                                    ? "bg-blue-500/10 border-blue-500/30 cursor-default opacity-80" 
                                                    : "bg-neutral-800 border-white/10 hover:border-blue-500/50 hover:bg-neutral-700 cursor-pointer hover:scale-105 active:scale-95"
                                            )}
                                        >
                                            {added ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                                            ) : (
                                                <MapPin className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-400 transition-colors" />
                                            )}
                                            <span className={cn(
                                                "text-xs font-medium transition-colors",
                                                added ? "text-blue-500" : "text-white/90 group-hover:text-white"
                                            )}>
                                                {suggestion.placeName}
                                            </span>
                                            {!added && (
                                                <ChevronDown className={cn("w-3 h-3 text-white/40 transition-transform duration-300", addingToDay === suggestion.placeName && "rotate-180")} />
                                            )}
                                        </button>
                                        
                                        {addingToDay === suggestion.placeName && (
                                            <div className="absolute top-full left-0 mt-2 p-2 rounded-xl bg-[#141414] border border-[#2a2a2a] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 min-w-[160px]">
                                                <div className="text-[9px] text-white/30 uppercase font-bold px-2 py-1 mb-1">Select Day</div>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {dayPlans.map((day) => (
                                                        <button
                                                            key={day.dayNumber}
                                                            onClick={() => {
                                                                onAddToDay(day.dayNumber, suggestion.placeName);
                                                                setAddingToDay(null);
                                                            }}
                                                            className="py-1.5 px-2 rounded-lg bg-[#202020] text-[10px] text-white/80 hover:bg-blue-600 hover:text-white transition-colors text-center font-bold"
                                                        >
                                                            Day {day.dayNumber}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        !loading && (
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/5">
                                <AlertCircle className="w-4 h-4 text-white/20" />
                                <p className="text-xs text-white/40">No specific places found for your current interest selection in {city}. Try selecting more categories!</p>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Must Visit Places (Custom Input) */}
            <div className="p-5 rounded-xl bg-[#202020] border border-[#2a2a2a] space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Star className="w-4 h-4 text-pink-500" />
                    Additional Must-Visit Places
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g., Eiffel Tower, Tokyo Skytree..."
                        value={mustVisitInput}
                        onChange={e => setMustVisitInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addMustVisit())}
                        className="flex-1"
                    />
                    <button
                        type="button"
                        onClick={addMustVisit}
                        className="h-11 w-11 rounded-xl border border-[#2a2a2a] hover:border-blue-500 bg-[#141414] flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                </div>
                {data.must_visit_places.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.must_visit_places.map(place => (
                            <span
                                key={place}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] text-[#b5b5b5] text-sm font-medium border border-[#2a2a2a]"
                            >
                                <Star className="w-3 h-3" />
                                {place}
                                <button
                                    type="button"
                                    onClick={() => removeMustVisit(place)}
                                    className="ml-1 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Environment Preference"
                    value={data.environment_preference}
                    onChange={e => update({ environment_preference: e.target.value as InterestsForm['environment_preference'] })}
                    options={[
                        { value: 'indoor', label: '🏛️ Indoor Activities' },
                        { value: 'outdoor', label: '🏔️ Outdoor Adventures' },
                        { value: 'mixed', label: '🔀 Mix of Both' },
                    ]}
                />
                <Select
                    label="Preferred Time of Day"
                    value={data.time_preference}
                    onChange={e => update({ time_preference: e.target.value as InterestsForm['time_preference'] })}
                    options={[
                        { value: 'morning', label: '🌅 Morning Person' },
                        { value: 'afternoon', label: '☀️ Afternoon Explorer' },
                        { value: 'evening', label: '🌙 Night Owl' },
                        { value: 'flexible', label: '⏰ Flexible / Any time' },
                    ]}
                />
            </div>
        </div>
    );
}
